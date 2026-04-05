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

    @GetMapping("/{id}/attempts/student/{studentId}")
    public ResponseEntity<List<QuizAttemptResponse>> getStudentAttempts(@PathVariable Long id, @PathVariable Long studentId) {
        return ResponseEntity.ok(quizService.getAttemptsByQuizAndStudent(id, studentId));
    }
}
