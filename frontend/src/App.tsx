import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import IncidentTicketsPage from './pages/maintenance/IncidentTicketsPage';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function Home() {
  const { login } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Home</h1>
      <div className="mt-4">
        <button onClick={() => login('user')} className="mr-4 py-2 px-4 bg-blue-500 text-white rounded">Login as User</button>
        <button onClick={() => login('admin')} className="py-2 px-4 bg-green-500 text-white rounded">Login as Admin/Technician</button>
      </div>
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
            {role && (
              <li>
                <Link to="/tickets" className="text-white">My Tickets</Link>
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
            <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
              <Route path="/tickets" element={<IncidentTicketsPage />} />
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