package com.lms.assessment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(scanBasePackages = {"com.lms", "com.smartcampus"})
@EnableJpaRepositories(basePackages = "com.lms.assessment.repository")
@EnableMongoRepositories(basePackages = "com.smartcampus.repository")
public class AssessmentServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(AssessmentServiceApplication.class, args);
	}
}
