import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Wrench, 
  User, 
  ArrowRight,
  ChevronRight,
  Building2
} from 'lucide-react';

const AuthSelectionPage = () => {
  const navigate = useNavigate();

  const options = [
    {
      role: 'Administrator',
      description: 'System control, user management, and campus oversight.',
      icon: ShieldCheck,
      path: '/admin-login',
      color: 'bg-indigo-600',
      hover: 'hover:border-indigo-500'
    },
    {
      role: 'Technician',
      description: 'Maintenance tasks, repair logs, and infrastructure support.',
      icon: Wrench,
      path: '/login',
      color: 'bg-blue-600',
      hover: 'hover:border-blue-500'
    },
    {
      role: 'Resident User',
      description: 'Incident reporting, status tracking, and campus updates.',
      icon: User,
      path: '/login',
      color: 'bg-emerald-600',
      hover: 'hover:border-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 font-inter">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest mb-6">
           <Building2 className="w-4 h-4" />
           Smart Campus Hub
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Welcome to the Gateway</h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          Please select your role to access the appropriate dashboard and management tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
        {options.map((opt) => (
          <div 
            key={opt.role}
            onClick={() => navigate(opt.path)}
            className={`group bg-white rounded-[2.5rem] border-2 border-transparent p-10 cursor-pointer shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 ${opt.hover}`}
          >
            <div className={`w-16 h-16 ${opt.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-2xl transition-transform group-hover:rotate-6`}>
              <opt.icon className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4">{opt.role}</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {opt.description}
            </p>

            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
              Access Portal 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
        LMS-PAF Integrated Infrastructure Management <span className="mx-2 text-slate-300">|</span> v2.0.4
      </div>
    </div>
  );
};

export default AuthSelectionPage;
