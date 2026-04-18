import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
}

interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
}

function StudentTaskPortal() {
  const { courseId } = useParams<{ courseId: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (courseId) {
        try {
          const assignmentRes = await apiClient.get(`/student/assignments/course/${courseId}`);
          setAssignments(assignmentRes.data);

          const quizRes = await apiClient.get(`/student/quizzes/course/${courseId}`);
          setQuizzes(quizRes.data);
        } catch (error) {
          console.error("Failed to fetch tasks", error);
          // Mock data for demonstration
          setAssignments([
            { id: 'a1', title: 'History Paper', dueDate: new Date().toISOString() },
          ]);
          setQuizzes([
            { id: 'q1', title: 'Math Quiz 1', timeLimit: 30 },
          ]);
        }
      }
    };

    fetchTasks();
  }, [courseId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks for Course {courseId}</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Assignments</h2>
        <ul className="space-y-2">
          {assignments.map(assignment => (
            <li key={assignment.id} className="p-4 bg-white rounded-lg shadow">
              <Link to={`/student/assignment/${assignment.id}`} className="text-blue-600 hover:underline">
                {assignment.title} - Due: {new Date(assignment.dueDate).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Quizzes</h2>
        <ul className="space-y-2">
          {quizzes.map(quiz => (
            <li key={quiz.id} className="p-4 bg-white rounded-lg shadow">
              <Link to={`/student/quiz/${quiz.id}`} className="text-blue-600 hover:underline">
                {quiz.title} - Time Limit: {quiz.timeLimit} minutes
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudentTaskPortal;
