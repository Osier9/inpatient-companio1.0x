package com.inpatientcompanio.auth.dto;

import com.inpatientcompanio.auth.domain.AccountStatus;
import com.inpatientcompanio.auth.domain.PasswordStatus;
import com.inpatientcompanio.auth.domain.UserRole;
import com.inpatientcompanio.auth.entity.SysUserEntity;

public record UserResponse(
    Long id,
    UserRole role,
    String name,
    String loginAccount,
    String phone,
    PasswordStatus passwordStatus,
    AccountStatus accountStatus,
    boolean mustChangePassword) {

  public static UserResponse from(SysUserEntity user) {
    return new UserResponse(
        user.getId(),
        user.getRole(),
        user.getName(),
        user.getLoginAccount(),
        user.getPhone(),
        user.getPasswordStatus(),
        user.getAccountStatus(),
        user.getPasswordStatus() == PasswordStatus.INITIAL);
  }
}
