package com.inpatientcompanio.auth.dto;

import com.inpatientcompanio.auth.domain.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(@NotNull AccountStatus accountStatus) {
}
