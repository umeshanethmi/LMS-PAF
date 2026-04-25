import React from 'react';
// Triggering dev server re-evaluation
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import UserDashboard from './dashboards/UserDashboard';
import TechnicianDashboard from './dashboards/TechnicianDashboard';

const DashboardPage = ({ overrideRole }: { overrideRole?: 'USER' | 'ADMIN' | 'TECHNICIAN' }) => {
  const { role: authRole, setSimulationRole } = useAuth();
  
  React.useEffect(() => {
    if (overrideRole) {
      setSimulationRole(overrideRole);
    }
  }, [overrideRole, setSimulationRole]);

  const role = overrideRole || authRole;

  const renderDashboard = () => {
    switch (role) {
      case 'ADMIN': return <AdminDashboard />;
      case 'TECHNICIAN': return <TechnicianDashboard />;
      default: return <UserDashboard />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="space-y-8">
        <div>
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

