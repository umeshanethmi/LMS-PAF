import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
}

interface QuizAttemptState {
  attemptId: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: number };
}

function QuizAttempt() {
  const { quizId } = useParams<{ quizId: string }>();
  const [attemptState, setAttemptState] = useState<QuizAttemptState | null>(null);
  const studentId = "101"; // Hardcoded for now

  useEffect(() => {
    const startQuiz = async () => {
      if (quizId) {
        try {
          const startRes = await apiClient.post(`/student/quizzes/${quizId}/attempts/start`, { studentId });
          const questionsRes = await apiClient.get(`/student/quizzes/${quizId}/questions`);
          
          setAttemptState({
            attemptId: startRes.data.id,
            questions: questionsRes.data,
            currentQuestionIndex: 0,
            answers: {},
          });
        } catch (error) {
          console.error("Failed to start quiz", error);
          // Mock data
          setAttemptState({
            attemptId: 'attempt1',
            questions: [
              { id: 'q1', questionText: 'What is 2+2?', options: ['3', '4', '5'] },
              { id: 'q2', questionText: 'Capital of France?', options: ['London', 'Paris', 'Berlin'] }
            ],
            currentQuestionIndex: 0,
            answers: {},
          });
        }
      }
    };
    startQuiz();
  }, [quizId]);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (attemptState) {
      setAttemptState({
        ...attemptState,
        answers: { ...attemptState.answers, [questionId]: optionIndex },
      });
    }
  };

  const handleNextQuestion = () => {
    if (attemptState && attemptState.currentQuestionIndex < attemptState.questions.length - 1) {
      setAttemptState({ ...attemptState, currentQuestionIndex: attemptState.currentQuestionIndex + 1 });
    }
  };

  const handleSubmitQuiz = async () => {
    if (attemptState) {
      try {
        await apiClient.post(`/student/quizzes/attempts/${attemptState.attemptId}/submit`, { answers: attemptState.answers });
        alert('Quiz submitted successfully!');
      } catch (error) {
        console.error("Failed to submit quiz", error);
        alert('Failed to submit quiz.');
      }
    }
  };

  if (!attemptState) {
    return <div>Loading Quiz...</div>;
  }

  const currentQuestion = attemptState.questions[attemptState.currentQuestionIndex];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz {quizId}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl mb-4">{currentQuestion.questionText}</h2>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <div key={index}>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={index}
                  onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                  checked={attemptState.answers[currentQuestion.id] === index}
                  className="form-radio"
                />
                <span className="ml-2">{option}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6">
          {attemptState.currentQuestionIndex < attemptState.questions.length - 1 ? (
            <button onClick={handleNextQuestion} className="py-2 px-4 bg-blue-500 text-white rounded">
              Next Question
            </button>
          ) : (
            <button onClick={handleSubmitQuiz} className="py-2 px-4 bg-green-500 text-white rounded">
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizAttempt;
