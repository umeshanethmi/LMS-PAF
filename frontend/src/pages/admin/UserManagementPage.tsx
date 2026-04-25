import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  UserCheck, 
  Trash2, 
  Mail,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'TECHNICIAN';
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<User[]>('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await apiClient.patch(`/users/${userId}/role?role=${newRole}`);
      fetchUsers();
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await apiClient.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">User Management</h1>
          <p className="text-slate-500 font-medium">Manage campus staff roles and access levels.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-slate-900 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 group text-xs uppercase tracking-widest">
          <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredUsers.length} Users Total</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Information</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Access Level</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.username}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-transparent border-none font-bold text-sm text-slate-700 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <option value="ADMIN">ADMINistrator</option>
                      <option value="TECHNICIAN">TECHNICIAN Expert</option>
                      <option value="USER">Standard USER</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' :
                      user.role === 'TECHNICIAN' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {user.role === 'ADMIN' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
