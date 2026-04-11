package com.lms.assessment.service;

import com.lms.assessment.dto.*;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.*;
import com.lms.assessment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAnswerRepository answerRepository;

    @Autowired
    public QuizServiceImpl(QuizRepository quizRepository,
                           QuizQuestionRepository questionRepository,
                           QuizAttemptRepository attemptRepository,
                           QuizAnswerRepository answerRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
    }

    @Override
    @Transactional
    public QuizResponse createQuiz(CreateQuizRequest request) {
        Quiz quiz = Quiz.builder()
                .courseId(request.getCourseId())
                .createdByInstructorId(request.getCreatedByInstructorId())
                .title(request.getTitle())
                .description(request.getDescription())
                .totalMarks(request.getTotalMarks())
                .maxAttempts(request.getMaxAttempts())
                .availableFrom(request.getAvailableFrom())
                .availableUntil(request.getAvailableUntil())
                .published(request.getPublished() != null ? request.getPublished() : false)
                .build();

        Quiz saved = quizRepository.save(quiz);
        return mapToQuizResponse(saved);
    }

    @Override
    public QuizResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        return mapToQuizResponse(quiz);
    }

    @Override
    public List<QuizResponse> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(this::mapToQuizResponse).collect(Collectors.toList());
    }

    @Override
    public List<QuizResponse> getPublishedQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseIdAndPublishedTrue(courseId).stream()
                .map(this::mapToQuizResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizResponse updateQuiz(Long id, CreateQuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setTotalMarks(request.getTotalMarks());
        quiz.setMaxAttempts(request.getMaxAttempts());
        quiz.setAvailableFrom(request.getAvailableFrom());
        quiz.setAvailableUntil(request.getAvailableUntil());
        if (request.getPublished() != null) {
            quiz.setPublished(request.getPublished());
        }
        
        Quiz updated = quizRepository.save(quiz);
        return mapToQuizResponse(updated);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        
        // Cascading relies on @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
        // Which cleans up QuizQuestion, QuizAttempt, and their QuizAnswer entities from DB
        quizRepository.delete(quiz);
    }

    @Override
    @Transactional
    public QuizQuestionResponse addQuestion(CreateQuizQuestionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", request.getQuizId()));

        QuizQuestion question = QuizQuestion.builder()
                .quiz(quiz)
                .questionText(request.getQuestionText())
                .questionType(request.getQuestionType())
                .options(request.getOptions())
                .correctAnswer(request.getCorrectAnswer())
                .marks(request.getMarks())
                .build();

        QuizQuestion saved = questionRepository.save(question);
        return mapToQuestionResponse(saved);
    }

    @Override
    public List<QuizQuestionResponse> getQuestionsByQuiz(Long quizId) {
        return questionRepository.findByQuizId(quizId).stream()
                .map(this::mapToQuestionResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizQuestionResponse updateQuestion(Long questionId, CreateQuizQuestionRequest request) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", questionId));
        
        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(request.getQuestionType());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setMarks(request.getMarks());
        
        QuizQuestion updated = questionRepository.save(question);
        return mapToQuestionResponse(updated);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", questionId));
        
        questionRepository.delete(question);
    }

    @Override
    @Transactional
    public QuizAttemptResponse startAttempt(StartQuizAttemptRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", request.getQuizId()));

        if (!quiz.getPublished()) {
            throw new SubmissionException("Quiz is not published.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (quiz.getAvailableFrom() != null && now.isBefore(quiz.getAvailableFrom())) {
            throw new SubmissionException("Quiz is not available yet.");
        }
        if (quiz.getAvailableUntil() != null && now.isAfter(quiz.getAvailableUntil())) {
            throw new SubmissionException("Quiz is no longer available.");
        }

        List<QuizAttempt> existingAttempts = attemptRepository.findByQuizIdAndStudentId(quiz.getId(), request.getStudentId());
        
        // Find if left in progress
        Optional<QuizAttempt> inProgress = existingAttempts.stream()
                .filter(a -> "IN_PROGRESS".equals(a.getStatus()))
                .findFirst();
        if (inProgress.isPresent()) {
            return mapToAttemptResponse(inProgress.get());
        }

        if (existingAttempts.size() >= quiz.getMaxAttempts()) {
            throw new SubmissionException("Maximum attempts reached.");
        }

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .studentId(request.getStudentId())
                .attemptNumber(existingAttempts.size() + 1)
                .status("IN_PROGRESS")
                .build();

        QuizAttempt saved = attemptRepository.save(attempt);
        return mapToAttemptResponse(saved);
    }

    @Override
    @Transactional
    public QuizAnswerResponse submitAnswer(SubmitQuizAnswerRequest request) {
        QuizAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", request.getAttemptId()));

        if (!"IN_PROGRESS".equals(attempt.getStatus())) {
            throw new SubmissionException("Attempt is already completed.");
        }

        QuizQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", request.getQuestionId()));

        if (!question.getQuiz().getId().equals(attempt.getQuiz().getId())) {
            throw new SubmissionException("Question does not belong to the attempted quiz.");
        }

        // Auto-grade
        boolean isCorrect = question.getCorrectAnswer().equalsIgnoreCase(request.getGivenAnswer().trim());
        int awardedMarks = isCorrect ? question.getMarks() : 0;

        Optional<QuizAnswer> existingOpt = answerRepository.findByAttemptIdAndQuestionId(attempt.getId(), question.getId());
        QuizAnswer answer;

        if (existingOpt.isPresent()) {
            answer = existingOpt.get();
            answer.setGivenAnswer(request.getGivenAnswer());
            answer.setCorrect(isCorrect);
            answer.setAwardedMarks(awardedMarks);
        } else {
            answer = QuizAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .givenAnswer(request.getGivenAnswer())
                    .correct(isCorrect)
                    .awardedMarks(awardedMarks)
                    .build();
        }

        QuizAnswer saved = answerRepository.save(answer);
        return mapToAnswerResponse(saved);
    }

    @Override
    @Transactional
    public QuizAttemptResponse completeAttempt(Long attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", attemptId));

        if (!"IN_PROGRESS".equals(attempt.getStatus())) {
            throw new SubmissionException("Attempt is already completed.");
        }

        List<QuizAnswer> answers = answerRepository.findByAttemptId(attemptId);
        int totalObtained = answers.stream().mapToInt(QuizAnswer::getAwardedMarks).sum();

        attempt.setObtainedMarks(totalObtained);
        attempt.setStatus("COMPLETED");
        attempt.setSubmittedAt(LocalDateTime.now());

        QuizAttempt saved = attemptRepository.save(attempt);
        return mapToAttemptResponse(saved);
    }

    @Override
    public List<QuizAttemptResponse> getAttemptsByQuizAndStudent(Long quizId, Long studentId) {
        return attemptRepository.findByQuizIdAndStudentId(quizId, studentId).stream()
                .map(this::mapToAttemptResponse).collect(Collectors.toList());
    }

    private QuizResponse mapToQuizResponse(Quiz entity) {
        return QuizResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourseId())
                .createdByInstructorId(entity.getCreatedByInstructorId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .totalMarks(entity.getTotalMarks())
                .maxAttempts(entity.getMaxAttempts())
                .availableFrom(entity.getAvailableFrom())
                .availableUntil(entity.getAvailableUntil())
                .published(entity.getPublished())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private QuizQuestionResponse mapToQuestionResponse(QuizQuestion entity) {
        return QuizQuestionResponse.builder()
                .id(entity.getId())
                .quizId(entity.getQuiz().getId())
                .questionText(entity.getQuestionText())
                .questionType(entity.getQuestionType())
                .options(entity.getOptions())
                .marks(entity.getMarks())
                .build();
    }

    private QuizAttemptResponse mapToAttemptResponse(QuizAttempt entity) {
        return QuizAttemptResponse.builder()
                .id(entity.getId())
                .quizId(entity.getQuiz().getId())
                .studentId(entity.getStudentId())
                .attemptNumber(entity.getAttemptNumber())
                .startedAt(entity.getStartedAt())
                .submittedAt(entity.getSubmittedAt())
                .obtainedMarks(entity.getObtainedMarks())
                .status(entity.getStatus())
                .build();
    }

    private QuizAnswerResponse mapToAnswerResponse(QuizAnswer entity) {
        return QuizAnswerResponse.builder()
                .id(entity.getId())
                .attemptId(entity.getAttempt().getId())
                .questionId(entity.getQuestion().getId())
                .givenAnswer(entity.getGivenAnswer())
                .correct(entity.getCorrect())
                .awardedMarks(entity.getAwardedMarks())
                .build();
    }
}
