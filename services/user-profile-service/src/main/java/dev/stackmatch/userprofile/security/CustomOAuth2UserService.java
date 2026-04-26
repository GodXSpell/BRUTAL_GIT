package dev.stackmatch.userprofile.security;

import dev.stackmatch.userprofile.domain.entity.User;
import dev.stackmatch.userprofile.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AuthService authService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Delegate to default implementation to load user details from GitHub
        OAuth2User defaultOAuth2User = super.loadUser(userRequest);
        String accessToken = userRequest.getAccessToken().getTokenValue();

        log.debug("Authenticating over GitHub with user details: {}", defaultOAuth2User.getName());

        // Process user (Creates/updates in Postgres, stores token, triggers stack analysis)
        User processedUser = authService.processOAuth2User(defaultOAuth2User, accessToken);

        // Return a custom user object wrapper that includes the domain UUID
        return new CustomOAuth2User(defaultOAuth2User, processedUser.getId().toString());
    }
}
