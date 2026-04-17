import React from 'react';
// Triggering dev server re-evaluation
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import UserDashboard from './dashboards/UserDashboard';
import TechnicianDashboard from './dashboards/TechnicianDashboard';
import { ActivityFeed } from "../components/tickets/ActivityFeed";

const DashboardPage = ({ overrideRole }: { overrideRole?: 'user' | 'admin' | 'technician' }) => {
  const { role: authRole } = useAuth();
  const role = overrideRole || authRole;

  const renderDashboard = () => {
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'technician': return <TechnicianDashboard />;
      default: return <UserDashboard />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div>
            {renderDashboard()}
          </div>
        </div>
        
        <div className="xl:col-span-1 h-fit xl:sticky xl:top-8">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

