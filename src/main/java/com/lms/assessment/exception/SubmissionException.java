package com.lms.assessment.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class SubmissionException extends RuntimeException {
    public SubmissionException(String message) {
        super(message);
    }
}
