package com.lms.assessment.service;

import com.lms.assessment.dto.*;

import java.util.List;

public interface QuizService {
    QuizResponse createQuiz(CreateQuizRequest request);
    QuizResponse getQuizById(String id);
    List<QuizResponse> getQuizzesByCourse(String courseId);
    List<QuizResponse> getPublishedQuizzesByCourse(String courseId);

    QuizResponse updateQuiz(String id, CreateQuizRequest request);
    void deleteQuiz(String id);

    QuizQuestionResponse addQuestion(CreateQuizQuestionRequest request);
    QuizQuestionResponse updateQuestion(String questionId, CreateQuizQuestionRequest request);
    void deleteQuestion(String questionId);

    List<QuizQuestionResponse> getQuestionsByQuiz(String quizId);

    QuizAttemptResponse startAttempt(StartQuizAttemptRequest request);
    QuizAnswerResponse submitAnswer(SubmitQuizAnswerRequest request);
    QuizAttemptResponse completeAttempt(String attemptId);

    List<QuizAttemptResponse> getAttemptsByQuizAndStudent(String quizId, String studentId);
}
