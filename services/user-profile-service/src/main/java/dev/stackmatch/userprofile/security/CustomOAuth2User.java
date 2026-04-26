package dev.stackmatch.userprofile.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oauth2User;
    private final String userId;

    public CustomOAuth2User(OAuth2User oauth2User, String userId) {
        this.oauth2User = oauth2User;
        this.userId = userId;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oauth2User.getAuthorities();
    }

    @Override
    public String getName() {
        return oauth2User.getAttribute("login");
    }

    public String getUserId() {
        return userId;
    }

    public String getLogin() {
        return oauth2User.getAttribute("login");
    }
}
