package com.smartcampus.security;

import com.smartcampus.models.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

/**
 * Custom OAuth2UserService that processes the user info returned by Google
 * after a successful OAuth2 authorization code exchange.
 *
 * Responsibilities:
 *   1. Delegate to the default service to fetch Google profile attributes.
 *   2. Check whether a User document already exists in MongoDB.
 *   3. If yes  → update name / imageUrl in case they changed.
 *   4. If no   → create a new User with the default role of USER.
 *   5. Return the {@link CustomOAuth2User} wrapper so downstream handlers
 *      (e.g. {@link OAuth2AuthenticationSuccessHandler}) can access both
 *      Spring Security principal data and our MongoDB User entity.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. Fetch raw attributes from Google
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        log.debug("Processing OAuth2 login via provider: {}", registrationId);

        // 2. Extract standard Google profile fields
        String email     = (String) attributes.get("email");
        String name      = (String) attributes.get("name");
        String imageUrl  = (String) attributes.get("picture");
        String providerId = (String) attributes.get("sub"); // Google's unique user ID

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found in OAuth2 attributes");
        }

        // 3. Upsert the user record in MongoDB
        User user = userRepository.findByEmail(email)
                .map(existingUser -> updateExistingUser(existingUser, name, imageUrl))
                .orElseGet(() -> registerNewUser(email, name, imageUrl, registrationId, providerId));

        log.info("OAuth2 login: user '{}' authenticated with roles {}", email, user.getRoles());

        // 4. Return a wrapped principal that merges Google attributes + our User
        return new CustomOAuth2User(oAuth2User, user);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private User updateExistingUser(User user, String name, String imageUrl) {
        user.setName(name);
        user.setImageUrl(imageUrl);
        return userRepository.save(user);
    }

    private User registerNewUser(String email, String name, String imageUrl,
                                 String provider, String providerId) {
        User newUser = User.builder()
                .email(email)
                .name(name)
                .imageUrl(imageUrl)
                .provider(provider)
                .providerId(providerId)
                .roles(Set.of(User.Role.USER))   // Default role
                .build();
        log.info("Registering new user: {}", email);
        return userRepository.save(newUser);
    }
}
