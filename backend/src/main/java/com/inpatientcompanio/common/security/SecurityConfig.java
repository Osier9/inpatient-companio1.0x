package com.inpatientcompanio.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inpatientcompanio.common.ApiResponse;
import com.inpatientcompanio.common.exception.ErrorCode;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtAuthenticationFilter jwtAuthenticationFilter,
      ObjectMapper objectMapper) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(requests -> requests
            .requestMatchers("/api/common/auth/login").permitAll()
            .requestMatchers("/api/common/auth/refresh").permitAll()
            .requestMatchers("/api/common/prototype-sync/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/family/**").hasRole("FAMILY")
            .requestMatchers("/api/caregiver/**").hasRole("CAREGIVER")
            .anyRequest().authenticated())
        .exceptionHandling(exceptions -> exceptions
            .authenticationEntryPoint((request, response, exception) -> {
              response.setStatus(401);
              response.setContentType(MediaType.APPLICATION_JSON_VALUE);
              response.setCharacterEncoding("UTF-8");
              objectMapper.writeValue(
                  response.getWriter(),
                  ApiResponse.fail(ErrorCode.AUTH_TOKEN_INVALID.name(), ErrorCode.AUTH_TOKEN_INVALID.message()));
            })
            .accessDeniedHandler((request, response, exception) -> {
              response.setStatus(403);
              response.setContentType(MediaType.APPLICATION_JSON_VALUE);
              response.setCharacterEncoding("UTF-8");
              objectMapper.writeValue(
                  response.getWriter(),
                  ApiResponse.fail(ErrorCode.AUTH_FORBIDDEN.name(), ErrorCode.AUTH_FORBIDDEN.message()));
            }))
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOriginPattern("http://192.168.*:*");
    configuration.addAllowedOriginPattern("http://10.*:*");
    configuration.addAllowedOriginPattern("http://172.16.*:*");
    configuration.addAllowedOriginPattern("http://172.17.*:*");
    configuration.addAllowedOriginPattern("http://172.18.*:*");
    configuration.addAllowedOriginPattern("http://172.19.*:*");
    configuration.addAllowedOriginPattern("http://172.20.*:*");
    configuration.addAllowedOriginPattern("http://172.21.*:*");
    configuration.addAllowedOriginPattern("http://172.22.*:*");
    configuration.addAllowedOriginPattern("http://172.23.*:*");
    configuration.addAllowedOriginPattern("http://172.24.*:*");
    configuration.addAllowedOriginPattern("http://172.25.*:*");
    configuration.addAllowedOriginPattern("http://172.26.*:*");
    configuration.addAllowedOriginPattern("http://172.27.*:*");
    configuration.addAllowedOriginPattern("http://172.28.*:*");
    configuration.addAllowedOriginPattern("http://172.29.*:*");
    configuration.addAllowedOriginPattern("http://172.30.*:*");
    configuration.addAllowedOriginPattern("http://172.31.*:*");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
