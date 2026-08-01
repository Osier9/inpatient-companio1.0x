package com.inpatientcompanio;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.inpatientcompanio.**.repository")
@SpringBootApplication
public class InpatientCompanioApplication {

  public static void main(String[] args) {
    SpringApplication.run(InpatientCompanioApplication.class, args);
  }
}
