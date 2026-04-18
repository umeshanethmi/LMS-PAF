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
  const { login, role } = useAuth();

  if (role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">You are logged in as <span className="font-semibold capitalize">{role}</span>.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LMS PAF</h1>
          <p className="text-gray-500 mt-2 text-sm">Learning Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Select your role to continue</p>

          <div className="space-y-3">
            <button
              onClick={() => login('instructor')}
              className="w-full flex items-center gap-4 px-5 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span className="text-2xl">👨‍🏫</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Login as Instructor</p>
                <p className="text-indigo-200 text-xs">Manage courses, resources & assessments</p>
              </div>
            </button>

            <button
              onClick={() => login('student')}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span className="text-2xl">🎓</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Login as Student</p>
                <p className="text-gray-400 text-xs">View tasks, quizzes & resources</p>
              </div>
            </button>
          </div>
        </div>
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
