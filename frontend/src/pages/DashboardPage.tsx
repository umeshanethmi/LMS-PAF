import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import UserDashboard from './dashboards/UserDashboard';
import TechnicianDashboard from './dashboards/TechnicianDashboard';

const DashboardPage = ({ overrideRole }: { overrideRole?: 'USER' | 'ADMIN' | 'TECHNICIAN' }) => {
  const { user, simulationRole, setSimulationRole } = useAuth();
  
  React.useEffect(() => {
    if (overrideRole) {
      setSimulationRole(overrideRole);
    }
  }, [overrideRole, setSimulationRole]);

  const role = overrideRole || simulationRole || user?.role || 'USER';

  const renderDashboard = () => {
    switch (role.toUpperCase()) {
      case 'ADMIN': return <AdminDashboard />;
      case 'TECHNICIAN': return <TechnicianDashboard />;
      default: return <UserDashboard />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
