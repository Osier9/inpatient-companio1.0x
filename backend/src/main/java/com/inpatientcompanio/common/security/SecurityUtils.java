package com.inpatientcompanio.common.security;

import com.inpatientcompanio.common.exception.BusinessException;
import com.inpatientcompanio.common.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
  private SecurityUtils() {
  }

  public static CurrentUser currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof CurrentUser currentUser)) {
      throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }
    return currentUser;
  }
}
