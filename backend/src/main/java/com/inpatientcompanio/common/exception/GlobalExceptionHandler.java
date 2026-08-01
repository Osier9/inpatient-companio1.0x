package com.inpatientcompanio.common.exception;

import com.inpatientcompanio.common.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException exception) {
    HttpStatus status = exception.getErrorCode() == ErrorCode.AUTH_FORBIDDEN ? HttpStatus.FORBIDDEN : HttpStatus.OK;
    return ResponseEntity.status(status)
        .body(ApiResponse.fail(exception.getErrorCode().name(), exception.getMessage()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiResponse<Void>> handleAccessDenied() {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.fail(ErrorCode.AUTH_FORBIDDEN.name(), ErrorCode.AUTH_FORBIDDEN.message()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ApiResponse<Void> handleValidation(MethodArgumentNotValidException exception) {
    String message = exception.getBindingResult().getFieldErrors().stream()
        .map(error -> error.getField() + " " + error.getDefaultMessage())
        .collect(Collectors.joining("; "));
    return ApiResponse.fail(ErrorCode.PARAM_INVALID.name(), message);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ApiResponse<Void> handleConstraint(ConstraintViolationException exception) {
    return ApiResponse.fail(ErrorCode.PARAM_INVALID.name(), exception.getMessage());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleSystem(Exception exception) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.fail(ErrorCode.SYSTEM_ERROR.name(), exception.getMessage()));
  }
}
