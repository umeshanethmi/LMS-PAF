package com.lms.assessment.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public MongoClient mongoClient(@Value("${spring.data.mongodb.uri}") String connectionString) {
        return MongoClients.create(connectionString);
    }
}
