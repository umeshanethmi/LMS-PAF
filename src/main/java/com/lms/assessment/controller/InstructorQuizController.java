package com.lms.assessment.controller;

import com.lms.assessment.dto.*;
import com.lms.assessment.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/instructor/quizzes")
public class InstructorQuizController {

    private final QuizService quizService;

    public InstructorQuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody CreateQuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizResponse> updateQuiz(@PathVariable Long id, @Valid @RequestBody CreateQuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizResponse>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<QuizQuestionResponse> addQuestion(@PathVariable Long id, @Valid @RequestBody CreateQuizQuestionRequest request) {
        request.setQuizId(id);
        return ResponseEntity.ok(quizService.addQuestion(request));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuizQuestionResponse>> getQuestionsByQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuestionsByQuiz(id));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuizQuestionResponse> updateQuestion(@PathVariable Long questionId, @Valid @RequestBody CreateQuizQuestionRequest request) {
        return ResponseEntity.ok(quizService.updateQuestion(questionId, request));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        quizService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/attempts/student/{studentId}")
    public ResponseEntity<List<QuizAttemptResponse>> getStudentAttempts(@PathVariable Long id, @PathVariable Long studentId) {
        return ResponseEntity.ok(quizService.getAttemptsByQuizAndStudent(id, studentId));
    }
}
