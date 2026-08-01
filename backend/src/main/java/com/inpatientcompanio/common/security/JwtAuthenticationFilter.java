package com.inpatientcompanio.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inpatientcompanio.auth.domain.PasswordStatus;
import com.inpatientcompanio.auth.domain.TokenService;
import com.inpatientcompanio.common.ApiResponse;
import com.inpatientcompanio.common.exception.BusinessException;
import com.inpatientcompanio.common.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private static final List<String> INITIAL_PASSWORD_ALLOWED_PATHS = List.of(
      "/api/common/auth/me",
      "/api/common/auth/logout",
      "/api/common/auth/change-initial-password");

  private final TokenService tokenService;
  private final ObjectMapper objectMapper;

  public JwtAuthenticationFilter(TokenService tokenService, ObjectMapper objectMapper) {
    this.tokenService = tokenService;
    this.objectMapper = objectMapper;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String authorization = request.getHeader("Authorization");
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    try {
      CurrentUser currentUser = tokenService.parseAccessToken(authorization.substring(7));
      if (currentUser.passwordStatus() == PasswordStatus.INITIAL
          && !INITIAL_PASSWORD_ALLOWED_PATHS.contains(request.getRequestURI())) {
        throw new BusinessException(ErrorCode.AUTH_INITIAL_PASSWORD_REQUIRED);
      }

      UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
          currentUser,
          null,
          List.of(new SimpleGrantedAuthority("ROLE_" + currentUser.role().name())));
      SecurityContextHolder.getContext().setAuthentication(authentication);
      filterChain.doFilter(request, response);
    } catch (BusinessException exception) {
      SecurityContextHolder.clearContext();
      writeAuthError(response, exception);
    }
  }

  private void writeAuthError(HttpServletResponse response, BusinessException exception) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");
    objectMapper.writeValue(response.getWriter(), ApiResponse.fail(exception.getErrorCode().name(), exception.getMessage()));
  }
}
