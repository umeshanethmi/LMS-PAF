import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CreateAssignment from './pages/instructor/CreateAssignment';
import CreateQuiz from './pages/instructor/CreateQuiz';
import AssignmentSubmissions from './pages/instructor/AssignmentSubmissions';
import QuizSubmissions from './pages/instructor/QuizSubmissions';
import StudentTaskPortal from './pages/student/StudentTaskPortal';
import SubmitAssignment from './pages/student/SubmitAssignment';
import QuizAttempt from './pages/student/QuizAttempt';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function Home() {
  const { login } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Home</h1>
      <div className="mt-4">
        <button onClick={() => login('instructor')} className="mr-4 py-2 px-4 bg-blue-500 text-white rounded">Login as Instructor</button>
        <button onClick={() => login('student')} className="py-2 px-4 bg-green-500 text-white rounded">Login as Student</button>
      </div>
    </div>
  );
}

function InstructorDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
      <nav className="mt-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/instructor/create-assignment" className="text-blue-500 hover:underline">Create Assignment</Link>
          </li>
          <li>
            <Link to="/instructor/create-quiz" className="text-blue-500 hover:underline">Create Quiz</Link>
          </li>
          <li>
            <Link to="/instructor/assignment-submissions" className="text-blue-500 hover:underline">View Assignment Submissions</Link>
          </li>
          <li>
            <Link to="/instructor/quiz-submissions" className="text-blue-500 hover:underline">View Quiz Submissions</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <nav className="mt-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/student/course/1/tasks" className="text-blue-500 hover:underline">View Tasks for Course 1</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function App() {
  const { role, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4 flex justify-between">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-white">Home</Link>
            </li>
            {role === 'instructor' && (
              <li>
                <Link to="/instructor" className="text-white">Instructor</Link>
              </li>
            )}
            {role === 'student' && (
              <li>
                <Link to="/student" className="text-white">Student</Link>
              </li>
            )}
          </ul>
          {role && (
            <button onClick={logout} className="text-white">Logout</button>
          )}
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/instructor/create-assignment" element={<CreateAssignment />} />
              <Route path="/instructor/create-quiz" element={<CreateQuiz />} />
              <Route path="/instructor/assignment-submissions" element={<AssignmentSubmissions />} />
              <Route path="/instructor/quiz-submissions" element={<QuizSubmissions />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/course/:courseId/tasks" element={<StudentTaskPortal />} />
              <Route path="/student/assignment/:assignmentId" element={<SubmitAssignment />} />
              <Route path="/student/quiz/:quizId" element={<QuizAttempt />} />
            </Route>
          </Routes>
        </main>
        
        {/* Vite Community links moved inside the main component or can be deleted if not needed */}
        <section className="mt-10 border-t pt-4">
           <p>Join the Vite community</p>
           <ul className="flex space-x-4 list-none p-0">
             <li><a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer">GitHub</a></li>
             <li><a href="https://chat.vite.dev/" target="_blank" rel="noreferrer">Discord</a></li>
             <li><a href="https://x.com/vite_js" target="_blank" rel="noreferrer">X.com</a></li>
           </ul>
        </section>
      </div>
    </Router>
  );
}

export default App;