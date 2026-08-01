package com.inpatientcompanio.common.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.inpatientcompanio.common.ApiResponse;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/common/prototype-sync")
public class PrototypeSyncController {
  private static final List<String> REQUIRED_ARRAY_FIELDS = List.of(
      "adminCareRequests",
      "adminSchedules",
      "adminRecords",
      "adminMessages",
      "adminReviews",
      "familyTasks",
      "familyRecords",
      "familyConversations",
      "familyPastServices",
      "caregiverTasks",
      "caregiverSchedules",
      "caregiverConversations",
      "caregiverReviews");

  private final AtomicReference<JsonNode> state = new AtomicReference<>();

  @GetMapping("/state")
  public ApiResponse<JsonNode> getState() {
    return ApiResponse.success(state.get());
  }

  @PutMapping("/state")
  public ApiResponse<JsonNode> updateState(@RequestBody JsonNode nextState) {
    if (!isCompleteState(nextState)) {
      return ApiResponse.success(state.get());
    }

    JsonNode snapshot = nextState.deepCopy();
    state.set(snapshot);
    return ApiResponse.success(snapshot);
  }

  private boolean isCompleteState(JsonNode nextState) {
    if (nextState == null || !nextState.isObject() || !nextState.path("revision").canConvertToLong()) {
      return false;
    }

    boolean hasSharedData = false;
    for (String field : REQUIRED_ARRAY_FIELDS) {
      JsonNode value = nextState.get(field);
      if (value == null || !value.isArray()) {
        return false;
      }
      hasSharedData = hasSharedData || value.size() > 0;
    }

    return hasSharedData;
  }
}
