package com.smartcampus.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Central Spring Security configuration.
 *
 * Key design decisions:
 *  - STATELESS sessions: no HttpSession is created; authentication is
 *    entirely JWT-driven.
 *  - CSRF disabled: safe for REST APIs consumed by SPAs using Bearer tokens.
 *  - Method-level security enabled: @PreAuthorize annotations on controllers
 *    enforce role-based access control (ADMIN / USER / TECHNICIAN).
 *  - OAuth2 login: delegates user info loading to {@link CustomOAuth2UserService}
 *    and post-login redirect to {@link OAuth2AuthenticationSuccessHandler}.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)   // enables @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // ── Security Filter Chain ─────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ── CORS ─────────────────────────────────────────────────────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── CSRF ─────────────────────────────────────────────────────────
            // Disabled for stateless REST API; protect with JWT instead
            .csrf(AbstractHttpConfigurer::disable)

            // ── Session management ────────────────────────────────────────────
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Authorization rules ───────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                    // Public endpoints – no token required
                    .requestMatchers(
                            "/",
                            "/error",
                            "/favicon.ico",
                            "/oauth2/**",
                            "/login/**",
                            "/api/auth/login",
                            "/api/auth/register"
                    ).permitAll()

                    // Allow preflight OPTIONS requests through
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // All other API endpoints require authentication
                    .anyRequest().authenticated()
            )

            // ── OAuth2 Login ──────────────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(userInfo ->
                            userInfo.userService(customOAuth2UserService))
                    .successHandler(oAuth2AuthenticationSuccessHandler)
            )

            // ── JWT Filter ────────────────────────────────────────────────────
            // Insert before Spring's own username/password filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ── CORS Configuration ────────────────────────────────────────────────────

    /**
     * CORS policy: allow the React dev server (port 3000) to call the backend.
     * Restrict and harden for production deployments.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow common local dev ports
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:517*", 
            "http://127.0.0.1:517*"
        ));
        
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type", "Origin", "Accept", "X-Requested-With"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Authorization"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
