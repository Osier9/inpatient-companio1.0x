package com.inpatientcompanio.auth.controller;

import com.inpatientcompanio.auth.application.UserAdminService;
import com.inpatientcompanio.auth.dto.ResetPasswordRequest;
import com.inpatientcompanio.auth.dto.UpdateUserStatusRequest;
import com.inpatientcompanio.auth.dto.UserResponse;
import com.inpatientcompanio.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class UserAdminController {
  private final UserAdminService userAdminService;

  public UserAdminController(UserAdminService userAdminService) {
    this.userAdminService = userAdminService;
  }

  @PostMapping("/{id}/reset-password")
  public ApiResponse<UserResponse> resetPassword(
      @PathVariable Long id,
      @Valid @RequestBody ResetPasswordRequest request) {
    return ApiResponse.success(userAdminService.resetPassword(id, request));
  }

  @PatchMapping("/{id}/status")
  public ApiResponse<UserResponse> updateStatus(
      @PathVariable Long id,
      @Valid @RequestBody UpdateUserStatusRequest request) {
    return ApiResponse.success(userAdminService.updateStatus(id, request));
  }
}
