package com.lms.assessment.service;

import com.lms.assessment.dto.*;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.Quiz;
import com.lms.assessment.model.QuizAnswer;
import com.lms.assessment.model.QuizAttempt;
import com.lms.assessment.model.QuizQuestion;
import com.lms.assessment.repository.QuizAttemptRepository;
import com.lms.assessment.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;

    public QuizServiceImpl(QuizRepository quizRepository,
                           QuizAttemptRepository attemptRepository) {
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
    }

    @Override
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

        return mapToQuizResponse(quizRepository.save(quiz));
    }

    @Override
    public QuizResponse getQuizById(String id) {
        return mapToQuizResponse(loadQuiz(id));
    }

    @Override
    public List<QuizResponse> getQuizzesByCourse(String courseId) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(this::mapToQuizResponse).collect(Collectors.toList());
    }

    @Override
    public List<QuizResponse> getPublishedQuizzesByCourse(String courseId) {
        return quizRepository.findByCourseIdAndPublishedTrue(courseId).stream()
                .map(this::mapToQuizResponse).collect(Collectors.toList());
    }

    @Override
    public QuizResponse updateQuiz(String id, CreateQuizRequest request) {
        Quiz quiz = loadQuiz(id);
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setTotalMarks(request.getTotalMarks());
        quiz.setMaxAttempts(request.getMaxAttempts());
        quiz.setAvailableFrom(request.getAvailableFrom());
        quiz.setAvailableUntil(request.getAvailableUntil());
        if (request.getPublished() != null) {
            quiz.setPublished(request.getPublished());
        }
        return mapToQuizResponse(quizRepository.save(quiz));
    }

    @Override
    public void deleteQuiz(String id) {
        Quiz quiz = loadQuiz(id);
        attemptRepository.deleteAll(attemptRepository.findByQuizId(id));
        quizRepository.delete(quiz);
    }

    @Override
    public QuizQuestionResponse addQuestion(CreateQuizQuestionRequest request) {
        Quiz quiz = loadQuiz(request.getQuizId());

        QuizQuestion question = QuizQuestion.builder()
                .id(UUID.randomUUID().toString())
                .questionText(request.getQuestionText())
                .questionType(request.getQuestionType())
                .options(request.getOptions())
                .correctAnswer(request.getCorrectAnswer())
                .marks(request.getMarks())
                .build();
        quiz.getQuestions().add(question);
        quizRepository.save(quiz);

        return mapToQuestionResponse(quiz.getId(), question);
    }

    @Override
    public List<QuizQuestionResponse> getQuestionsByQuiz(String quizId) {
        Quiz quiz = loadQuiz(quizId);
        return quiz.getQuestions().stream()
                .map(q -> mapToQuestionResponse(quiz.getId(), q))
                .collect(Collectors.toList());
    }

    @Override
    public QuizQuestionResponse updateQuestion(String questionId, CreateQuizQuestionRequest request) {
        Quiz quiz = loadQuiz(request.getQuizId());
        QuizQuestion question = quiz.getQuestions().stream()
                .filter(q -> questionId.equals(q.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", questionId));

        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(request.getQuestionType());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setMarks(request.getMarks());

        quizRepository.save(quiz);
        return mapToQuestionResponse(quiz.getId(), question);
    }

    @Override
    public void deleteQuestion(String questionId) {
        Quiz quiz = quizRepository.findAll().stream()
                .filter(q -> q.getQuestions().stream().anyMatch(qq -> questionId.equals(qq.getId())))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", questionId));
        quiz.getQuestions().removeIf(q -> questionId.equals(q.getId()));
        quizRepository.save(quiz);
    }

    @Override
    public QuizAttemptResponse startAttempt(StartQuizAttemptRequest request) {
        Quiz quiz = loadQuiz(request.getQuizId());

        if (Boolean.FALSE.equals(quiz.getPublished())) {
            throw new SubmissionException("Quiz is not published.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (quiz.getAvailableFrom() != null && now.isBefore(quiz.getAvailableFrom())) {
            throw new SubmissionException("Quiz is not available yet.");
        }
        if (quiz.getAvailableUntil() != null && now.isAfter(quiz.getAvailableUntil())) {
            throw new SubmissionException("Quiz is no longer available.");
        }

        List<QuizAttempt> existingAttempts =
                attemptRepository.findByQuizIdAndStudentId(quiz.getId(), request.getStudentId());

        Optional<QuizAttempt> inProgress = existingAttempts.stream()
                .filter(a -> "IN_PROGRESS".equals(a.getStatus()))
                .findFirst();
        if (inProgress.isPresent()) {
            return mapToAttemptResponse(inProgress.get());
        }

        if (quiz.getMaxAttempts() != null && existingAttempts.size() >= quiz.getMaxAttempts()) {
            throw new SubmissionException("Maximum attempts reached.");
        }

        QuizAttempt attempt = QuizAttempt.builder()
                .quizId(quiz.getId())
                .studentId(request.getStudentId())
                .attemptNumber(existingAttempts.size() + 1)
                .status("IN_PROGRESS")
                .startedAt(now)
                .build();

        return mapToAttemptResponse(attemptRepository.save(attempt));
    }

    @Override
    public QuizAnswerResponse submitAnswer(SubmitQuizAnswerRequest request) {
        QuizAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", request.getAttemptId()));

        if (!"IN_PROGRESS".equals(attempt.getStatus())) {
            throw new SubmissionException("Attempt is already completed.");
        }

        Quiz quiz = loadQuiz(attempt.getQuizId());
        QuizQuestion question = quiz.getQuestions().stream()
                .filter(q -> request.getQuestionId().equals(q.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("QuizQuestion", "id", request.getQuestionId()));

        boolean isCorrect = question.getCorrectAnswer() != null
                && question.getCorrectAnswer().equalsIgnoreCase(request.getGivenAnswer().trim());
        int awardedMarks = isCorrect ? question.getMarks() : 0;

        QuizAnswer answer = attempt.getAnswers().stream()
                .filter(a -> question.getId().equals(a.getQuestionId()))
                .findFirst()
                .orElseGet(() -> {
                    QuizAnswer fresh = QuizAnswer.builder()
                            .id(UUID.randomUUID().toString())
                            .questionId(question.getId())
                            .build();
                    attempt.getAnswers().add(fresh);
                    return fresh;
                });
        answer.setGivenAnswer(request.getGivenAnswer());
        answer.setCorrect(isCorrect);
        answer.setAwardedMarks(awardedMarks);

        QuizAttempt saved = attemptRepository.save(attempt);
        return mapToAnswerResponse(saved.getId(), answer);
    }

    @Override
    public QuizAttemptResponse completeAttempt(String attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", attemptId));

        if (!"IN_PROGRESS".equals(attempt.getStatus())) {
            throw new SubmissionException("Attempt is already completed.");
        }

        int totalObtained = attempt.getAnswers().stream()
                .mapToInt(a -> a.getAwardedMarks() != null ? a.getAwardedMarks() : 0)
                .sum();

        attempt.setObtainedMarks(totalObtained);
        attempt.setStatus("COMPLETED");
        attempt.setSubmittedAt(LocalDateTime.now());

        return mapToAttemptResponse(attemptRepository.save(attempt));
    }

    @Override
    public List<QuizAttemptResponse> getAttemptsByQuizAndStudent(String quizId, String studentId) {
        return attemptRepository.findByQuizIdAndStudentId(quizId, studentId).stream()
                .map(this::mapToAttemptResponse).collect(Collectors.toList());
    }

    private Quiz loadQuiz(String id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
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

    private QuizQuestionResponse mapToQuestionResponse(String quizId, QuizQuestion entity) {
        return QuizQuestionResponse.builder()
                .id(entity.getId())
                .quizId(quizId)
                .questionText(entity.getQuestionText())
                .questionType(entity.getQuestionType())
                .options(entity.getOptions())
                .marks(entity.getMarks())
                .build();
    }

    private QuizAttemptResponse mapToAttemptResponse(QuizAttempt entity) {
        return QuizAttemptResponse.builder()
                .id(entity.getId())
                .quizId(entity.getQuizId())
                .studentId(entity.getStudentId())
                .attemptNumber(entity.getAttemptNumber())
                .startedAt(entity.getStartedAt())
                .submittedAt(entity.getSubmittedAt())
                .obtainedMarks(entity.getObtainedMarks())
                .status(entity.getStatus())
                .build();
    }

    private QuizAnswerResponse mapToAnswerResponse(String attemptId, QuizAnswer entity) {
        return QuizAnswerResponse.builder()
                .id(entity.getId())
                .attemptId(attemptId)
                .questionId(entity.getQuestionId())
                .givenAnswer(entity.getGivenAnswer())
                .correct(entity.getCorrect())
                .awardedMarks(entity.getAwardedMarks())
                .build();
    }
}
