package com.inpatientcompanio.auth.application;

import com.inpatientcompanio.auth.domain.AccountStatus;
import com.inpatientcompanio.auth.domain.PasswordService;
import com.inpatientcompanio.auth.domain.PasswordStatus;
import com.inpatientcompanio.auth.dto.ResetPasswordRequest;
import com.inpatientcompanio.auth.dto.UpdateUserStatusRequest;
import com.inpatientcompanio.auth.dto.UserResponse;
import com.inpatientcompanio.auth.entity.SysUserEntity;
import com.inpatientcompanio.auth.repository.SysUserRepository;
import com.inpatientcompanio.common.exception.BusinessException;
import com.inpatientcompanio.common.exception.ErrorCode;
import com.inpatientcompanio.common.security.SecurityUtils;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAdminService {
  private final SysUserRepository userRepository;
  private final PasswordService passwordService;

  public UserAdminService(SysUserRepository userRepository, PasswordService passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  @Transactional
  public UserResponse resetPassword(Long userId, ResetPasswordRequest request) {
    SysUserEntity user = loadUser(userId);
    user.setPasswordHash(passwordService.encode(request.newPassword()));
    user.setPasswordStatus(PasswordStatus.INITIAL);
    user.setLoginFailCount(0);
    user.setLockedUntil(null);
    user.setAccountStatus(AccountStatus.ENABLED);
    user.setUpdatedBy(SecurityUtils.currentUser().userId());
    user.setUpdatedAt(LocalDateTime.now());
    userRepository.updateById(user);
    return UserResponse.from(user);
  }

  @Transactional
  public UserResponse updateStatus(Long userId, UpdateUserStatusRequest request) {
    SysUserEntity user = loadUser(userId);
    user.setAccountStatus(request.accountStatus());
    if (request.accountStatus() != AccountStatus.LOCKED) {
      user.setLockedUntil(null);
      user.setLoginFailCount(0);
    }
    user.setUpdatedBy(SecurityUtils.currentUser().userId());
    user.setUpdatedAt(LocalDateTime.now());
    userRepository.updateById(user);
    return UserResponse.from(user);
  }

  private SysUserEntity loadUser(Long userId) {
    SysUserEntity user = userRepository.selectById(userId);
    if (user == null || Integer.valueOf(1).equals(user.getDeleted())) {
      throw new BusinessException(ErrorCode.DATA_NOT_FOUND, "用户不存在");
    }
    return user;
  }
}
