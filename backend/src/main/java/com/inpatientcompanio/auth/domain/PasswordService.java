package com.inpatientcompanio.auth.domain;

import com.inpatientcompanio.common.exception.BusinessException;
import com.inpatientcompanio.common.exception.ErrorCode;
import java.util.regex.Pattern;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
  private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d).{8,20}$");
  private final PasswordEncoder passwordEncoder;

  public PasswordService(PasswordEncoder passwordEncoder) {
    this.passwordEncoder = passwordEncoder;
  }

  public String encode(String rawPassword) {
    validateStrength(rawPassword);
    return passwordEncoder.encode(rawPassword);
  }

  public boolean matches(String rawPassword, String passwordHash) {
    return passwordEncoder.matches(rawPassword, passwordHash);
  }

  public void validateStrength(String rawPassword) {
    if (rawPassword == null || !PASSWORD_PATTERN.matcher(rawPassword).matches()) {
      throw new BusinessException(ErrorCode.PARAM_INVALID, "密码需为 8-20 位，并同时包含字母和数字");
    }
  }
}
