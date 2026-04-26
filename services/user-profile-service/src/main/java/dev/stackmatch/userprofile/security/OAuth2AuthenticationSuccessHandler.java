package dev.stackmatch.userprofile.security;

import dev.stackmatch.userprofile.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();

        // Generate JWT
        String jwt = jwtService.generateToken(oauth2User.getUserId(), oauth2User.getLogin());

        // Redirect to frontend: http://localhost:3000/dashboard?token=JWT
        String targetUrl = frontendUrl + "/dashboard?token=" + jwt;
        
        log.info("OAuth2 login successful, redirecting to frontend dashboard with JWT");
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}