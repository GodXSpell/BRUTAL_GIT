#!/bin/bash
echo "=== USERS ==="
docker exec -it stackmatch-postgres psql -U stackmatch -d stackmatch \
  -c "SELECT id, github_login, created_at FROM users LIMIT 5;"

echo "=== STACK PROFILES ==="
docker exec -it stackmatch-postgres psql -U stackmatch -d stackmatch \
  -c "SELECT user_id, primary_languages, frameworks, intent FROM user_stack_profiles LIMIT 5;"

echo "=== REPO COUNT ==="
docker exec -it stackmatch-postgres psql -U stackmatch -d stackmatch \
  -c "SELECT COUNT(*) as total_repos FROM repositories;"

echo "=== REPOS WITH EMBEDDINGS ==="
docker exec -it stackmatch-postgres psql -U stackmatch -d stackmatch \
  -c "SELECT COUNT(*) as repos_with_embeddings FROM repositories WHERE repo_embedding IS NOT NULL;"

echo "=== RECENT RECOMMENDATIONS ==="
docker exec -it stackmatch-postgres psql -U stackmatch -d stackmatch \
  -c "SELECT rs.id, rs.intent, rs.created_at, COUNT(ri.id) as item_count
      FROM recommendation_sessions rs
      LEFT JOIN recommendation_items ri ON rs.id = ri.session_id
      GROUP BY rs.id ORDER BY rs.created_at DESC LIMIT 5;"

echo "=== FEEDBACK SIGNALS ==="
docker exec -it stackmatch-postgres psql -U stackmatch -d stackmatch \
  -c "SELECT signal, COUNT(*) FROM feedback_signals GROUP BY signal;"

echo "=== USER EMBEDDINGS ==="
docker exec -it stackmatch-postgres psql -U stackmatch -d stackmatch \
  -c "SELECT user_id, version, feedback_count, updated_at FROM user_embeddings LIMIT 5;"\n