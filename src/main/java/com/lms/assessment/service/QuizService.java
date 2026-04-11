package com.lms.assessment.service;

import com.lms.assessment.dto.*;

import java.util.List;

public interface QuizService {
    QuizResponse createQuiz(CreateQuizRequest request);
    QuizResponse getQuizById(Long id);
    List<QuizResponse> getQuizzesByCourse(Long courseId);
    List<QuizResponse> getPublishedQuizzesByCourse(Long courseId);
    
    QuizResponse updateQuiz(Long id, CreateQuizRequest request);
    void deleteQuiz(Long id);

    QuizQuestionResponse addQuestion(CreateQuizQuestionRequest request);
    QuizQuestionResponse updateQuestion(Long questionId, CreateQuizQuestionRequest request);
    void deleteQuestion(Long questionId);
    
    List<QuizQuestionResponse> getQuestionsByQuiz(Long quizId);

    QuizAttemptResponse startAttempt(StartQuizAttemptRequest request);
    QuizAnswerResponse submitAnswer(SubmitQuizAnswerRequest request);
    QuizAttemptResponse completeAttempt(Long attemptId);
    
    List<QuizAttemptResponse> getAttemptsByQuizAndStudent(Long quizId, Long studentId);
}
