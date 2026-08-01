package com.inpatientcompanio.auth.controller;

import com.inpatientcompanio.auth.application.AuthApplicationService;
import com.inpatientcompanio.auth.dto.ChangePasswordRequest;
import com.inpatientcompanio.auth.dto.LoginRequest;
import com.inpatientcompanio.auth.dto.LoginResponse;
import com.inpatientcompanio.auth.dto.RefreshTokenRequest;
import com.inpatientcompanio.auth.dto.UserResponse;
import com.inpatientcompanio.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/common/auth")
public class AuthController {
  private final AuthApplicationService authApplicationService;

  public AuthController(AuthApplicationService authApplicationService) {
    this.authApplicationService = authApplicationService;
  }

  @PostMapping("/login")
  public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.success(authApplicationService.login(request));
  }

  @PostMapping("/refresh")
  public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
    return ApiResponse.success(authApplicationService.refresh(request));
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout() {
    authApplicationService.logout();
    return ApiResponse.success(null);
  }

  @GetMapping("/me")
  public ApiResponse<UserResponse> me() {
    return ApiResponse.success(authApplicationService.me());
  }

  @PostMapping("/change-initial-password")
  public ApiResponse<LoginResponse> changeInitialPassword(@Valid @RequestBody ChangePasswordRequest request) {
    return ApiResponse.success(authApplicationService.changeInitialPassword(request));
  }

  @PostMapping("/change-password")
  public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
    authApplicationService.changePassword(request);
    return ApiResponse.success(null);
  }
}
