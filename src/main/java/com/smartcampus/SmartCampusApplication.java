package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

// We scan only com.lms.assessment because the parallel com.smartcampus stack
// duplicates @Bean SecurityFilterChain, @RestController("/api/auth"), and
// @RestController("/api/notifications") — loading both would crash Spring with
// duplicate bean / ambiguous mapping errors. The smartcampus classes stay on
// the classpath (so SmartCampusGlobalExceptionHandler can reference shared
// exception types) but are not registered as beans.
@SpringBootApplication(scanBasePackages = "com.lms.assessment")
@EnableMongoRepositories(basePackages = "com.lms.assessment.repository")
public class SmartCampusApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }
}
