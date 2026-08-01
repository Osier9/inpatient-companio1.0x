package com.inpatientcompanio.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank String loginAccount,
    @NotBlank String password) {
}
