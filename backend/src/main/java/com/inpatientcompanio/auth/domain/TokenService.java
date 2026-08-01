package com.inpatientcompanio.auth.domain;

import com.inpatientcompanio.common.exception.BusinessException;
import com.inpatientcompanio.common.exception.ErrorCode;
import com.inpatientcompanio.common.security.CurrentUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
  private final SecretKey secretKey;
  private final long accessTokenMinutes;
  private final long refreshTokenDays;

  public TokenService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.access-token-minutes}") long accessTokenMinutes,
      @Value("${app.jwt.refresh-token-days}") long refreshTokenDays) {
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessTokenMinutes = accessTokenMinutes;
    this.refreshTokenDays = refreshTokenDays;
  }

  public TokenPair issueTokens(CurrentUser user) {
    Instant now = Instant.now();
    Instant accessExpiresAt = now.plus(accessTokenMinutes, ChronoUnit.MINUTES);
    Instant refreshExpiresAt = now.plus(refreshTokenDays, ChronoUnit.DAYS);
    return new TokenPair(
        buildToken(user, "access", accessExpiresAt),
        buildToken(user, "refresh", refreshExpiresAt),
        accessExpiresAt.toEpochMilli(),
        refreshExpiresAt.toEpochMilli());
  }

  public CurrentUser parseAccessToken(String token) {
    Claims claims = parseClaims(token);
    if (!"access".equals(claims.get("type", String.class))) {
      throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }
    return toCurrentUser(claims);
  }

  public CurrentUser parseRefreshToken(String token) {
    Claims claims = parseClaims(token);
    if (!"refresh".equals(claims.get("type", String.class))) {
      throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }
    return toCurrentUser(claims);
  }

  private String buildToken(CurrentUser user, String type, Instant expiresAt) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(String.valueOf(user.userId()))
        .claim("type", type)
        .claim("role", user.role().name())
        .claim("name", user.name())
        .claim("passwordStatus", user.passwordStatus().name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiresAt))
        .signWith(secretKey)
        .compact();
  }

  private Claims parseClaims(String token) {
    try {
      return Jwts.parser()
          .verifyWith(secretKey)
          .build()
          .parseSignedClaims(token)
          .getPayload();
    } catch (JwtException | IllegalArgumentException exception) {
      throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }
  }

  private CurrentUser toCurrentUser(Claims claims) {
    return new CurrentUser(
        Long.valueOf(claims.getSubject()),
        UserRole.valueOf(claims.get("role", String.class)),
        claims.get("name", String.class),
        PasswordStatus.valueOf(claims.get("passwordStatus", String.class)));
  }

  public record TokenPair(String accessToken, String refreshToken, long accessExpiresAt, long refreshExpiresAt) {
  }
}
