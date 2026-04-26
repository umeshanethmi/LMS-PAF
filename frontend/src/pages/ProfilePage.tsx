import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Camera, 
  Clock, 
  Lock,
  Smartphone,
  Phone,
  Building2,
  Quote,
  X,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, token, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    phone: '',
    department: '',
    bio: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync form data with user state
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        imageUrl: user.picture || '',
        phone: user.phone || '',
        department: user.department || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    // Phone validation (more robust regex)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    if (formData.phone && formData.phone.trim() !== "" && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    // URL validation (now supports data:image/base64 as well)
    const urlRegex = /^(https?:\/\/|data:image\/)/;
    if (formData.imageUrl && formData.imageUrl.trim() !== "" && !urlRegex.test(formData.imageUrl)) {
      newErrors.imageUrl = "Please enter a valid image URL or Data URI";
    }

    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = "Bio is too long (max 1000 chars)";
    }

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    
    if (!token) {
      setErrors({ submit: "You are not authenticated. Please login again." });
      return;
    }

    if (!validate()) {
      console.log("Validation failed");
      return;
    }
    
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        login(data.token);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
        const data = await response.json();
        console.error("Server validation failed:", data);
        setErrors({ submit: data.message || "Server rejected the update. Please check your inputs." });
      }
    } catch (error) {
      console.error('Network error during profile update:', error);
      setErrors({ submit: "Unable to reach the server. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Account Type', value: user?.provider === 'GOOGLE' ? 'Google SSO' : 'Local Account', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Global Role', value: user?.role || 'USER', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-8 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <p className="font-bold">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Header / Cover Section */}
      <div className="relative h-56 rounded-[40px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 overflow-hidden shadow-2xl shadow-indigo-100">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:32px_32px]"></div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="relative -mt-28 px-8">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-10">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-48 h-48 rounded-[32px] bg-white p-2 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <div className="w-full h-full rounded-[24px] bg-slate-50 flex items-center justify-center border-2 border-slate-100 overflow-hidden">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-24 h-24 text-slate-200" />
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-3 right-3 p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 shadow-xl hover:text-indigo-600 hover:scale-110 transition-all"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
                <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-indigo-100">
                  {user?.role}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-500 font-semibold">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">{user?.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">{user?.department || 'General Faculty'}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <Smartphone className="w-4 h-4 text-rose-500" />
                  <span className="text-sm">ID: {user?.id?.substring(0, 8)}...</span>
                </div>
              </div>

              {user?.bio && (
                <div className="mt-6 flex gap-3 text-slate-600 italic font-medium max-w-2xl">
                  <Quote className="w-8 h-8 text-indigo-200 shrink-0" />
                  <p className="text-lg leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 shrink-0">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-black hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-slate-100">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-5 p-2 rounded-3xl group">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-6`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8">
        {/* Bio Section */}
        <div className="bg-white rounded-[40px] border border-slate-200 p-10 space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">About Me</h2>
            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed">
            {user?.bio || "Tell the campus community about yourself, your research interests, or your role at the university."}
          </p>
        </div>

        {/* Security Summary */}
        <div className="bg-slate-900 rounded-[40px] p-10 text-white space-y-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6">Security Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">Password Strength</span>
                </div>
                <span className="text-emerald-400 text-xs font-black uppercase">Strong</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <span className="font-bold">Last Login</span>
                </div>
                <span className="text-slate-400 text-xs font-bold">Just Now</span>
              </div>
            </div>
            <Link to="/security" className="mt-8 w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-indigo-50 transition-colors block text-center">
              Account Security Dashboard
            </Link>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Update Profile</h2>
                <p className="text-slate-500 font-medium mt-1">Make your profile represent you across the campus.</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-3 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-100 transition-all"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {errors.submit && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 font-bold animate-in shake duration-300">
                <AlertCircle className="w-5 h-5" />
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.name ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-14 pr-5 py-5 bg-slate-50 border-2 rounded-[24px] outline-none transition-all text-slate-800 font-bold ${errors.name ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-50' : 'border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50'}`}
                      placeholder="Your full name"
                    />
                  </div>
                  {errors.name && <p className="text-rose-500 text-xs font-bold ml-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.phone ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                    <input 
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-14 pr-5 py-5 bg-slate-50 border-2 rounded-[24px] outline-none transition-all text-slate-800 font-bold ${errors.phone ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-50' : 'border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50'}`}
                      placeholder="+94 7X XXX XXXX"
                    />
                  </div>
                  {errors.phone && <p className="text-rose-500 text-xs font-bold ml-1">{errors.phone}</p>}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Faculty / Department</label>
                  <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 transition-all text-slate-800 font-bold"
                      placeholder="e.g. Faculty of Computing"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Profile Photo Link</label>
                  <div className="relative group">
                    <Camera className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.imageUrl ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                    <input 
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className={`w-full pl-14 pr-5 py-5 bg-slate-50 border-2 rounded-[24px] outline-none transition-all text-slate-800 font-bold ${errors.imageUrl ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-50' : 'border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50'}`}
                      placeholder="https://images.com/photo.jpg"
                    />
                  </div>
                  {errors.imageUrl && <p className="text-rose-500 text-xs font-bold ml-1">{errors.imageUrl}</p>}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Short Biography</label>
                <div className="relative group">
                  <Quote className={`absolute left-5 top-6 w-5 h-5 transition-colors ${errors.bio ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className={`w-full pl-14 pr-5 py-5 bg-slate-50 border-2 rounded-[24px] outline-none transition-all text-slate-800 font-bold resize-none ${errors.bio ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-50' : 'border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50'}`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                {errors.bio && <p className="text-rose-500 text-xs font-bold ml-1">{errors.bio}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-8 py-5 bg-slate-100 border border-slate-200 rounded-[24px] font-black text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
