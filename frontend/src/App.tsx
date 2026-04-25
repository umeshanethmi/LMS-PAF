import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import CreateAssignment from './pages/instructor/CreateAssignment';
import CreateQuiz from './pages/instructor/CreateQuiz';
import AssignmentSubmissions from './pages/instructor/AssignmentSubmissions';
import QuizSubmissions from './pages/instructor/QuizSubmissions';
import StudentTaskPortal from './pages/student/StudentTaskPortal';
import SubmitAssignment from './pages/student/SubmitAssignment';
import QuizAttempt from './pages/student/QuizAttempt';
import ResourceCatalogue from './pages/resources/ResourceCatalogue';
import ResourceDetail from './pages/resources/ResourceDetail';
import ResourceForm from './pages/resources/ResourceForm';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function Navbar() {
  const { role, logout } = useAuth();
  const location = useLocation();

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'bg-indigo-700 text-white'
          : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-white font-bold text-xl tracking-tight">LMS</span>
              <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">PAF</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLink('/', 'Home')}
              {role === 'instructor' && navLink('/instructor', 'Dashboard')}
              {role === 'student' && navLink('/student', 'Dashboard')}
              {role && navLink('/resources', 'Resources')}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {role && (
              <span className="text-indigo-200 text-sm hidden sm:block">
                Logged in as{' '}
                <span className="text-white font-semibold capitalize">{role}</span>
              </span>
            )}
            {role && (
              <button
                onClick={logout}
                className="bg-white text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const { login, role, user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">
            You are logged in as <span className="font-semibold">{user?.username}</span>
            {' '}({user?.role}).
          </p>
          <Link
            to={role === 'instructor' ? '/instructor' : '/student'}
            className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? 'Invalid email or password.'
        : 'Login failed. Make sure the backend is running.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LMS PAF</h1>
          <p className="text-gray-500 mt-2 text-sm">Learning Management System</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1">Use your email or username to continue</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email or username</label>
              <input
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@sliit.lk"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
            Try <code className="bg-gray-100 px-1 rounded">admin@sliit.lk / Admin123</code>,
            {' '}<code className="bg-gray-100 px-1 rounded">instructor / instructor123</code>, or
            {' '}<code className="bg-gray-100 px-1 rounded">student / student123</code>
          </p>
        </form>
      </div>
    </div>
  );
}

function InstructorDashboard() {
  const cards = [
    { to: '/instructor/create-assignment', icon: '📝', title: 'Create Assignment', desc: 'Add a new assignment for students' },
    { to: '/instructor/create-quiz', icon: '📋', title: 'Create Quiz', desc: 'Build a quiz with custom questions' },
    { to: '/instructor/assignment-submissions', icon: '📥', title: 'Assignment Submissions', desc: 'Review and grade submissions' },
    { to: '/instructor/quiz-submissions', icon: '📊', title: 'Quiz Results', desc: 'View student quiz attempts' },
    { to: '/resources', icon: '🏛️', title: 'Manage Resources', desc: 'Facilities & assets catalogue' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your courses, assessments, and resources</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <Link
              key={card.to}
              to={card.to}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <span className="text-3xl mb-3 block">{card.icon}</span>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const cards = [
    { to: '/student/course/1/tasks', icon: '📚', title: 'My Tasks', desc: 'View assignments and quizzes for Course 1' },
    { to: '/resources', icon: '🏛️', title: 'Browse Resources', desc: 'Find available facilities and equipment' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Access your courses, tasks, and campus resources</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(card => (
            <Link
              key={card.to}
              to={card.to}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <span className="text-3xl mb-3 block">{card.icon}</span>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
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
            <Route element={<ProtectedRoute allowedRoles={['instructor', 'student']} />}>
              <Route path="/resources" element={<ResourceCatalogue />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route path="/resources/new" element={<ResourceForm />} />
              <Route path="/resources/:id/edit" element={<ResourceForm />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
