package com.lms.assessment.service;

import com.lms.assessment.dto.*;

import java.util.List;

public interface QuizService {
    QuizResponse createQuiz(CreateQuizRequest request);
    QuizResponse getQuizById(Long id);
    List<QuizResponse> getQuizzesByCourse(Long courseId);

    QuizQuestionResponse addQuestion(CreateQuizQuestionRequest request);
    List<QuizQuestionResponse> getQuestionsByQuiz(Long quizId);

    QuizAttemptResponse startAttempt(StartQuizAttemptRequest request);
    QuizAnswerResponse submitAnswer(SubmitQuizAnswerRequest request);
    QuizAttemptResponse completeAttempt(Long attemptId);
    
    List<QuizAttemptResponse> getAttemptsByQuizAndStudent(Long quizId, Long studentId);
}
