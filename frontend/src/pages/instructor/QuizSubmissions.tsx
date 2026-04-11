import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  score: number;
  startedAt: string;
  completedAt: string;
}

function QuizSubmissions() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        // This endpoint needs to be implemented in the backend
        const response = await apiClient.get('/instructor/quizzes/attempts');
        setAttempts(response.data);
      } catch (error) {
        console.error("Failed to fetch quiz attempts", error);
        // Mock data for demonstration
        setAttempts([
          { id: '1', studentId: '101', quizId: 'q1', score: 85, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() },
          { id: '2', studentId: '102', quizId: 'q1', score: 92, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() },
        ]);
      }
    };

    fetchAttempts();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Submissions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 uppercase font-semibold text-sm">Attempt ID</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm">Student ID</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm">Quiz ID</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm">Score</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm">Started At</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm">Completed At</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {attempts.map((attempt) => (
              <tr key={attempt.id}>
                <td className="py-3 px-4">{attempt.id}</td>
                <td className="py-3 px-4">{attempt.studentId}</td>
                <td className="py-3 px-4">{attempt.quizId}</td>
                <td className="py-3 px-4">{attempt.score}</td>
                <td className="py-3 px-4">{new Date(attempt.startedAt).toLocaleString()}</td>
                <td className="py-3 px-4">{new Date(attempt.completedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuizSubmissions;
