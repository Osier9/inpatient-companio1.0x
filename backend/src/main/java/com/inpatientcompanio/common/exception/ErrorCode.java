package com.inpatientcompanio.common.exception;

public enum ErrorCode {
  AUTH_LOGIN_FAILED("账号或密码错误"),
  AUTH_ACCOUNT_LOCKED("账号已锁定，请稍后再试"),
  AUTH_ACCOUNT_DISABLED("账号已停用"),
  AUTH_INITIAL_PASSWORD_REQUIRED("首次登录必须修改初始密码"),
  AUTH_FORBIDDEN("暂无访问权限"),
  AUTH_TOKEN_INVALID("登录状态已失效，请重新登录"),
  PARAM_INVALID("请求参数不合法"),
  DATA_NOT_FOUND("数据不存在"),
  SYSTEM_ERROR("系统繁忙，请稍后再试");

  private final String message;

  ErrorCode(String message) {
    this.message = message;
  }

  public String message() {
    return message;
  }
}
