package com.inpatientcompanio.auth.application;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.inpatientcompanio.auth.domain.AccountStatus;
import com.inpatientcompanio.auth.domain.PasswordService;
import com.inpatientcompanio.auth.domain.PasswordStatus;
import com.inpatientcompanio.auth.domain.UserRole;
import com.inpatientcompanio.auth.entity.SysUserEntity;
import com.inpatientcompanio.auth.repository.SysUserRepository;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AuthDataInitializer implements CommandLineRunner {
  private final SysUserRepository userRepository;
  private final PasswordService passwordService;

  public AuthDataInitializer(SysUserRepository userRepository, PasswordService passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  @Override
  public void run(String... args) {
    createUserIfMissing(UserRole.ADMIN, "系统管理员", "admin", "13800000000", "Admin2026");
    createUserIfMissing(UserRole.FAMILY, "李女士", "13800006666", "13800006666", "Family2026");
    createUserIfMissing(UserRole.CAREGIVER, "王秀兰", "HG1007", "13800001111", "Care2026");
  }

  private void createUserIfMissing(
      UserRole role,
      String name,
      String loginAccount,
      String phone,
      String initialPassword) {
    Long count = userRepository.selectCount(new LambdaQueryWrapper<SysUserEntity>()
        .eq(SysUserEntity::getLoginAccount, loginAccount)
        .eq(SysUserEntity::getDeleted, 0));
    if (count != null && count > 0) {
      return;
    }

    LocalDateTime now = LocalDateTime.now();
    SysUserEntity user = new SysUserEntity();
    user.setRole(role);
    user.setName(name);
    user.setLoginAccount(loginAccount);
    user.setPhone(phone);
    user.setPasswordHash(passwordService.encode(initialPassword));
    user.setPasswordStatus(PasswordStatus.INITIAL);
    user.setAccountStatus(AccountStatus.ENABLED);
    user.setLoginFailCount(0);
    user.setCreatedAt(now);
    user.setUpdatedAt(now);
    user.setCreatedBy(0L);
    user.setUpdatedBy(0L);
    user.setDeleted(0);
    userRepository.insert(user);
  }
}
