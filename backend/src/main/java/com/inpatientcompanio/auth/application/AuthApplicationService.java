package com.inpatientcompanio.auth.application;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.inpatientcompanio.auth.domain.AccountStatus;
import com.inpatientcompanio.auth.domain.PasswordService;
import com.inpatientcompanio.auth.domain.PasswordStatus;
import com.inpatientcompanio.auth.domain.TokenService;
import com.inpatientcompanio.auth.dto.ChangePasswordRequest;
import com.inpatientcompanio.auth.dto.LoginRequest;
import com.inpatientcompanio.auth.dto.LoginResponse;
import com.inpatientcompanio.auth.dto.RefreshTokenRequest;
import com.inpatientcompanio.auth.dto.UserResponse;
import com.inpatientcompanio.auth.entity.SysUserEntity;
import com.inpatientcompanio.auth.repository.SysUserRepository;
import com.inpatientcompanio.common.exception.BusinessException;
import com.inpatientcompanio.common.exception.ErrorCode;
import com.inpatientcompanio.common.security.CurrentUser;
import com.inpatientcompanio.common.security.SecurityUtils;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthApplicationService {
  private static final int MAX_LOGIN_FAILURES = 5;
  private static final int LOCK_MINUTES = 15;

  private final SysUserRepository userRepository;
  private final PasswordService passwordService;
  private final TokenService tokenService;

  public AuthApplicationService(
      SysUserRepository userRepository,
      PasswordService passwordService,
      TokenService tokenService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  @Transactional
  public LoginResponse login(LoginRequest request) {
    SysUserEntity user = findByLoginAccount(request.loginAccount());
    ensureLoginAllowed(user);

    if (!passwordService.matches(request.password(), user.getPasswordHash())) {
      recordLoginFailure(user);
      throw new BusinessException(ErrorCode.AUTH_LOGIN_FAILED);
    }

    LocalDateTime now = LocalDateTime.now();
    user.setLoginFailCount(0);
    user.setLockedUntil(null);
    user.setLastLoginAt(now);
    user.setUpdatedAt(now);
    userRepository.updateById(user);

    return buildLoginResponse(user);
  }

  @Transactional(readOnly = true)
  public LoginResponse refresh(RefreshTokenRequest request) {
    CurrentUser tokenUser = tokenService.parseRefreshToken(request.refreshToken());
    SysUserEntity user = userRepository.selectById(tokenUser.userId());
    if (user == null || Integer.valueOf(1).equals(user.getDeleted())) {
      throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }
    ensureLoginAllowed(user);
    return buildLoginResponse(user);
  }

  @Transactional(readOnly = true)
  public UserResponse me() {
    SysUserEntity user = loadCurrentUserEntity();
    return UserResponse.from(user);
  }

  @Transactional
  public LoginResponse changeInitialPassword(ChangePasswordRequest request) {
    SysUserEntity user = loadCurrentUserEntity();
    if (user.getPasswordStatus() != PasswordStatus.INITIAL) {
      throw new BusinessException(ErrorCode.PARAM_INVALID, "当前账号无需首次改密");
    }
    changePassword(user, request);
    user.setPasswordStatus(PasswordStatus.NORMAL);
    userRepository.updateById(user);
    return buildLoginResponse(user);
  }

  @Transactional
  public void changePassword(ChangePasswordRequest request) {
    SysUserEntity user = loadCurrentUserEntity();
    changePassword(user, request);
    userRepository.updateById(user);
  }

  public void logout() {
    // Stateless JWT logout is handled by the client deleting local tokens.
  }

  private void changePassword(SysUserEntity user, ChangePasswordRequest request) {
    if (!passwordService.matches(request.currentPassword(), user.getPasswordHash())) {
      throw new BusinessException(ErrorCode.AUTH_LOGIN_FAILED, "当前密码错误");
    }
    user.setPasswordHash(passwordService.encode(request.newPassword()));
    user.setUpdatedAt(LocalDateTime.now());
    user.setUpdatedBy(user.getId());
  }

  private LoginResponse buildLoginResponse(SysUserEntity user) {
    CurrentUser currentUser = new CurrentUser(user.getId(), user.getRole(), user.getName(), user.getPasswordStatus());
    TokenService.TokenPair tokenPair = tokenService.issueTokens(currentUser);
    return new LoginResponse(
        tokenPair.accessToken(),
        tokenPair.refreshToken(),
        tokenPair.accessExpiresAt(),
        tokenPair.refreshExpiresAt(),
        UserResponse.from(user));
  }

  private SysUserEntity loadCurrentUserEntity() {
    Long userId = SecurityUtils.currentUser().userId();
    SysUserEntity user = userRepository.selectById(userId);
    if (user == null || Integer.valueOf(1).equals(user.getDeleted())) {
      throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }
    return user;
  }

  private SysUserEntity findByLoginAccount(String loginAccount) {
    SysUserEntity user = userRepository.selectOne(new LambdaQueryWrapper<SysUserEntity>()
        .eq(SysUserEntity::getLoginAccount, loginAccount)
        .eq(SysUserEntity::getDeleted, 0));
    if (user == null) {
      throw new BusinessException(ErrorCode.AUTH_LOGIN_FAILED);
    }
    return user;
  }

  private void ensureLoginAllowed(SysUserEntity user) {
    if (user.getAccountStatus() == AccountStatus.DISABLED) {
      throw new BusinessException(ErrorCode.AUTH_ACCOUNT_DISABLED);
    }
    if (user.getAccountStatus() == AccountStatus.LOCKED) {
      if (user.getLockedUntil() != null && user.getLockedUntil().isBefore(LocalDateTime.now())) {
        user.setAccountStatus(AccountStatus.ENABLED);
        user.setLoginFailCount(0);
        user.setLockedUntil(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.updateById(user);
        return;
      }
      throw new BusinessException(ErrorCode.AUTH_ACCOUNT_LOCKED);
    }
  }

  private void recordLoginFailure(SysUserEntity user) {
    int failures = (user.getLoginFailCount() == null ? 0 : user.getLoginFailCount()) + 1;
    user.setLoginFailCount(failures);
    if (failures >= MAX_LOGIN_FAILURES) {
      user.setAccountStatus(AccountStatus.LOCKED);
      user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
    }
    user.setUpdatedAt(LocalDateTime.now());
    userRepository.updateById(user);
  }
}
