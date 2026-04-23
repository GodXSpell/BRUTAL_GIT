-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ──────────────────────────────────────────
-- Users & Auth
-- ──────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id       BIGINT UNIQUE NOT NULL,
    github_login    VARCHAR(100) NOT NULL,
    github_name     VARCHAR(255),
    github_avatar   TEXT,
    email           VARCHAR(255),
    access_token    TEXT NOT NULL,             -- encrypted
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_github_id ON users(github_id);

-- ──────────────────────────────────────────
-- User Stack Profiles
-- ──────────────────────────────────────────

CREATE TABLE user_stack_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    primary_languages   JSONB NOT NULL DEFAULT '[]',   -- [{name, weight_pct}]
    frameworks          JSONB NOT NULL DEFAULT '[]',   -- [{name, source, confidence}]
    domains             JSONB NOT NULL DEFAULT '[]',   -- ["web-backend","data-processing"]
    activity_pattern    VARCHAR(50),                   -- BUILDER | CONTRIBUTOR | LEARNER
    intent              VARCHAR(50),                   -- CONTRIBUTOR | LEARNER | BUILDER
    total_repos         INT DEFAULT 0,
    total_stars_given   INT DEFAULT 0,
    profile_embedding   vector(128),                   -- two-tower user embedding
    last_analyzed_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_stack_user_id ON user_stack_profiles(user_id);
CREATE INDEX idx_user_stack_embedding ON user_stack_profiles
    USING ivfflat (profile_embedding vector_cosine_ops) WITH (lists = 100);

-- ──────────────────────────────────────────
-- Repository Corpus
-- ──────────────────────────────────────────

CREATE TABLE repositories (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id           BIGINT UNIQUE NOT NULL,
    full_name           VARCHAR(255) NOT NULL,          -- owner/repo
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    html_url            TEXT NOT NULL,
    homepage            TEXT,
    topics              TEXT[] DEFAULT '{}',
    languages           JSONB NOT NULL DEFAULT '{}',   -- {Python: 72.3, Java: 27.7}
    primary_language    VARCHAR(100),
    stars               INT DEFAULT 0,
    forks               INT DEFAULT 0,
    open_issues         INT DEFAULT 0,
    watchers            INT DEFAULT 0,
    license             VARCHAR(100),
    is_archived         BOOLEAN DEFAULT FALSE,
    is_fork             BOOLEAN DEFAULT FALSE,
    last_pushed_at      TIMESTAMPTZ,
    created_at_github   TIMESTAMPTZ,
    good_first_issues   INT DEFAULT 0,
    has_contributing    BOOLEAN DEFAULT FALSE,
    readme_summary      TEXT,                          -- first 500 chars of README
    health_score        FLOAT DEFAULT 0.0,             -- computed: 0.0-1.0
    repo_embedding      vector(128),                   -- two-tower item embedding
    bm25_indexed        BOOLEAN DEFAULT FALSE,
    indexed_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repos_github_id ON repositories(github_id);
CREATE INDEX idx_repos_primary_language ON repositories(primary_language);
CREATE INDEX idx_repos_topics ON repositories USING GIN(topics);
CREATE INDEX idx_repos_health_score ON repositories(health_score DESC);
CREATE INDEX idx_repos_stars ON repositories(stars DESC);
CREATE INDEX idx_repos_embedding ON repositories
    USING ivfflat (repo_embedding vector_cosine_ops) WITH (lists = 200);

-- ──────────────────────────────────────────
-- Recommendations
-- ──────────────────────────────────────────

CREATE TABLE recommendation_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    intent          VARCHAR(50) NOT NULL,
    context_hash    VARCHAR(64),                        -- hash of user stack at time of rec
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recommendation_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES recommendation_sessions(id) ON DELETE CASCADE,
    repo_id         UUID NOT NULL REFERENCES repositories(id),
    rank_position   INT NOT NULL,
    match_score     FLOAT NOT NULL,
    retrieval_method VARCHAR(50),                      -- BM25 | VECTOR | HYBRID
    explanation     JSONB NOT NULL DEFAULT '[]',       -- [{reason, signal, weight}]
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rec_items_session ON recommendation_items(session_id);
CREATE INDEX idx_rec_items_repo ON recommendation_items(repo_id);

-- ──────────────────────────────────────────
-- Feedback
-- ──────────────────────────────────────────

CREATE TABLE feedback_signals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_id         UUID NOT NULL REFERENCES repositories(id),
    session_id      UUID REFERENCES recommendation_sessions(id),
    signal          VARCHAR(20) NOT NULL CHECK (signal IN ('LIKE','DISLIKE','SKIP','CLICK','STAR')),
    rank_position   INT,                               -- position when shown (for bias correction)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback_signals(user_id);
CREATE INDEX idx_feedback_repo_id ON feedback_signals(repo_id);
CREATE INDEX idx_feedback_user_repo ON feedback_signals(user_id, repo_id);

-- ──────────────────────────────────────────
-- User Embedding Store (personalized, mutable)
-- ──────────────────────────────────────────

CREATE TABLE user_embeddings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    embedding       vector(128) NOT NULL,
    version         INT DEFAULT 1,
    feedback_count  INT DEFAULT 0,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- Audit / Analytics
-- ──────────────────────────────────────────

CREATE TABLE analytics_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id),
    event_type  VARCHAR(100) NOT NULL,
    payload     JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- ──────────────────────────────────────────
-- Functions & Triggers
-- ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_stack_updated
    BEFORE UPDATE ON user_stack_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_repos_updated
    BEFORE UPDATE ON repositories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
