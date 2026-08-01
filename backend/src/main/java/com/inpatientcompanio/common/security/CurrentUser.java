package com.inpatientcompanio.common.security;

import com.inpatientcompanio.auth.domain.PasswordStatus;
import com.inpatientcompanio.auth.domain.UserRole;

public record CurrentUser(Long userId, UserRole role, String name, PasswordStatus passwordStatus) {
}
