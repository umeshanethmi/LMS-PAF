package com.smartcampus.security;

import com.smartcampus.models.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Wrapper that merges a Google {@link OAuth2User} with our MongoDB {@link User}.
 *
 * This is needed so the {@link OAuth2AuthenticationSuccessHandler} can access
 * the user's email (to generate a JWT) without an extra database query.
 */
public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oAuth2User;
    private final User user;

    public CustomOAuth2User(OAuth2User oAuth2User, User user) {
        this.oAuth2User = oAuth2User;
        this.user = user;
    }

    // ── OAuth2User contract ───────────────────────────────────────────────────

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Derive authorities from our MongoDB User's roles (not from Google)
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    /** Returns the email – used as the name attribute for this principal. */
    @Override
    public String getName() {
        return user.getEmail();
    }

    // ── Convenience accessors ─────────────────────────────────────────────────

    public String getEmail() {
        return user.getEmail();
    }

    public User getUser() {
        return user;
    }
}
