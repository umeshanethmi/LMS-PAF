package com.lms.assessment.controller;

import com.lms.assessment.dto.*;
import com.lms.assessment.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/quizzes")
public class StudentQuizController {

    private final QuizService quizService;

    public StudentQuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizResponse>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> getQuestionsByQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuestionsByQuiz(id));
    }

    @PostMapping("/{id}/attempts/start")
    public ResponseEntity<QuizAttemptResponse> startAttempt(@PathVariable Long id, @RequestBody StartQuizAttemptRequest request) {
        request.setQuizId(id);
        return ResponseEntity.ok(quizService.startAttempt(request));
    }

    @PostMapping("/attempts/{attemptId}/answers")
    public ResponseEntity<QuizAnswerResponse> submitAnswer(@PathVariable Long attemptId, @RequestBody SubmitQuizAnswerRequest request) {
        request.setAttemptId(attemptId);
        return ResponseEntity.ok(quizService.submitAnswer(request));
    }

    @PostMapping("/attempts/{attemptId}/complete")
    public ResponseEntity<QuizAttemptResponse> completeAttempt(@PathVariable Long attemptId) {
        return ResponseEntity.ok(quizService.completeAttempt(attemptId));
    }

    @GetMapping("/{id}/attempts/student/{studentId}")
    public ResponseEntity<List<QuizAttemptResponse>> getAttempts(@PathVariable Long id, @PathVariable Long studentId) {
        return ResponseEntity.ok(quizService.getAttemptsByQuizAndStudent(id, studentId));
    }
}
