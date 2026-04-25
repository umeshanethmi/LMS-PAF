package com.smartcampus.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Handles the final step of the OAuth2 Authorization Code flow.
 *
 * After Google redirects back and Spring Security validates the code,
 * this handler:
 *   1. Extracts the authenticated {@link CustomOAuth2User} principal.
 *   2. Generates a JWT for the user's email.
 *   3. Redirects the browser to the React frontend with the token as
 *      a query parameter: http://localhost:3000/oauth2/redirect?token=<JWT>
 *
 * The frontend then stores the token in localStorage and uses it for
 * subsequent API calls as a Bearer token.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.redirect-uri}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        // 1. Extract our custom principal
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getEmail();

        // 2. Generate JWT
        String token = jwtTokenProvider.generateTokenFromUsername(email);
        log.info("OAuth2 success – issuing JWT for: {}", email);

        // 3. Build redirect URL with token appended as query param
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("token", token)
                .build()
                .toUriString();

        // 4. Redirect browser to React app
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
