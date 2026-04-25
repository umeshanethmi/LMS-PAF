package com.lms.assessment.controller;

import com.lms.assessment.dto.*;
import com.lms.assessment.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/student/quizzes")
public class StudentQuizController {

    private final QuizService quizService;

    public StudentQuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizResponse>> getQuizzesByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(quizService.getPublishedQuizzesByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable String id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> getQuestionsByQuiz(@PathVariable String id) {
        return ResponseEntity.ok(quizService.getQuestionsByQuiz(id));
    }

    @PostMapping("/{id}/attempts/start")
    public ResponseEntity<QuizAttemptResponse> startAttempt(@PathVariable String id, @Valid @RequestBody StartQuizAttemptRequest request) {
        request.setQuizId(id);
        return ResponseEntity.ok(quizService.startAttempt(request));
    }

    @PostMapping("/attempts/{attemptId}/answers")
    public ResponseEntity<QuizAnswerResponse> submitAnswer(@PathVariable String attemptId, @Valid @RequestBody SubmitQuizAnswerRequest request) {
        request.setAttemptId(attemptId);
        return ResponseEntity.ok(quizService.submitAnswer(request));
    }

    @PostMapping("/attempts/{attemptId}/complete")
    public ResponseEntity<QuizAttemptResponse> completeAttempt(@PathVariable String attemptId) {
        return ResponseEntity.ok(quizService.completeAttempt(attemptId));
    }

    @GetMapping("/{id}/attempts/student/{studentId}")
    public ResponseEntity<List<QuizAttemptResponse>> getAttempts(@PathVariable String id, @PathVariable String studentId) {
        return ResponseEntity.ok(quizService.getAttemptsByQuizAndStudent(id, studentId));
    }
}
