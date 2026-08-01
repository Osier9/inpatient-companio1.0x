package com.inpatientcompanio.auth.dto;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    long accessExpiresAt,
    long refreshExpiresAt,
    UserResponse user) {
}
