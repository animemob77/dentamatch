import React, { useState, useEffect, useMemo } from 'react';
// Using CDN import for preview compatibility
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { 
  Search, 
  MapPin, 
  User, 
  Plus, 
  MessageCircle, 
  ShieldCheck, 
  ChevronRight, 
  Info, 
  ArrowLeft,
  Settings,
  Bell, 
  LogOut,
  CheckCircle,
  Menu,
  X,
  Stethoscope,
  Camera,
  Facebook,
  Phone,
  Hash,
  Upload,
  ExternalLink,
  Trash2,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Image as ImageIcon,
  Star,
  Award,
  SearchCheck
} from 'lucide-react';

// --- Supabase Client Initialization ---
const supabaseUrl = "https://lnfcrhjxnjbtntuoalzn.supabase.co";
const supabaseAnonKey = "sb_publishable_QbD2C93-sHZ6aw1pNBDbdw_NzXInFJM";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Constants & Data ---
const TREATMENT_TYPES = [
  "Prophylaxis (Cleaning)",
  "Restoration (Filling) - Class I",
  "Restoration (Filling) - Class II",
  "Extraction (Simple)",
  "Extraction (Surgical/Molar)",
  "Root Canal Therapy",
  "Complete Dentures",
  "Removable Partial Dentures",
  "Fixed Bridge/Crown",
  "Orthodontic Assessment",
  "Periodontal Treatment"
];

const INITIAL_CASES = [
  {
    id: '1',
    studentId: 's1',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=200',
    treatment: "Prophylaxis (Cleaning)",
    location: 'University Dental Clinic, Manila',
    datePosted: '2023-10-25',
    description: 'Looking for 1 patient for my requirement in Periodontics. The procedure is free. You will be helping me finish my clinical hours!',
    messengerLink: 'https://m.me/alexrivera',
    school: 'University of the East',
    course: 'Doctor of Dental Medicine',
    selectedTeeth: [3, 4, 5],
    images: [],
    verificationCode: "ALEX-2024",
    reviews: [
      { id: 101, name: "Maria K.", rating: 5, comment: "Very gentle and professional! Alex explained every step.", date: "2023-11-01" }
    ]
  }
];

// --- Sub-components ---

const ToothChart = ({ selectedTeeth, onToggleTooth }) => {
  const upperArch = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerArch = Array.from({ length: 16 }, (_, i) => 32 - i);

  const renderTooth = (num) => {
    const isSelected = selectedTeeth.includes(num);
    return (
      <button
        key={num}
        onClick={() => onToggleTooth(num)}
        type="button"
        className={`w-8 h-10 flex flex-col items-center justify-center rounded-lg border transition-all ${
          isSelected 
            ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-200 scale-105 z-10' 
            : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300'
        }`}
      >
        <span className="text-[10px] font-bold">{num}</span>
        <div className={`w-3 h-4 mt-1 rounded-sm border-2 ${isSelected ? 'border-white bg-white/20' : 'border-slate-200'}`}></div>
      </button>
    );
  };

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 overflow-x-auto">
      <div className="min-w-[500px]">
        <div className="flex justify-center gap-1.5 mb-8">
          {upperArch.map(renderTooth)}
        </div>
        <div className="flex justify-center gap-1.5">
          {lowerArch.map(renderTooth)}
        </div>
        <div className="flex justify-between mt-4 px-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          <span>Upper Arch</span>
          <span>Lower Arch</span>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ user, setView, onLogout }) => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200">
          <Stethoscope className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">DentaMatch</span>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button onClick={() => setView('studentDash')} className="text-slate-600 font-semibold text-sm hover:text-blue-600 transition">
              My Profile
            </button>
            <button onClick={onLogout} className="flex items-center gap-1 text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <button onClick={() => setView('choice')} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            Get Started
          </button>
        )}
      </div>
    </div>
  </nav>
);

const LandingPage = ({ setView, onOpenReview }) => (
  <div className="animate-fade-in">
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          Realize a Dream, <br />
          <span className="text-blue-600">Get Free Dental Care.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          DentaMatch connects passionate dental students with community members. 
          Patients receive high-quality supervised treatments for free, 
          while students fulfill their clinical requirements.
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl">
            <button onClick={() => setView('marketplace')} className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
              I Need Dental Care
            </button>
            <button onClick={() => setView('studentWarning')} className="flex-1 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              I'm a Dental Student
            </button>
          </div>
          <button 
            onClick={onOpenReview}
            className="group flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest mt-4 hover:bg-blue-50 px-6 py-3 rounded-full transition-all"
          >
            <Star size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" fill="currentColor" />
            Leave a Review for a Student
          </button>
        </div>
      </div>
    </section>
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-10">
        <div className="group p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
            <ShieldCheck size={32} />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">Professional Quality</h3>
          <p className="text-slate-500 leading-relaxed text-sm">Every procedure is meticulously supervised by licensed dentists and professors.</p>
        </div>
        <div className="group p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
            <Info size={32} />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">Helping a Student</h3>
          <p className="text-slate-500 leading-relaxed text-sm">You help students complete their mandatory clinical cases to earn their doctorate degree.</p>
        </div>
        <div className="group p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
            <MapPin size={32} />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">Direct Connect</h3>
          <p className="text-slate-500 leading-relaxed text-sm">No complex forms. Find a case, click a button, and chat with the student directly on Messenger.</p>
        </div>
      </div>
    </section>
  </div>
);

const UserChoice = ({ setView }) => (
  <div className="max-w-md mx-auto mt-16 px-4 text-center animate-fade-in">
    <h2 className="text-3xl font-bold mb-8 text-slate-800">Tell us who you are</h2>
    <div className="grid gap-6">
      <button 
        onClick={() => setView('studentWarning')}
        className="group p-8 bg-white border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all text-left flex items-center justify-between"
      >
        <div>
          <h3 className="font-bold text-xl text-slate-800 mb-1">I am a Student</h3>
          <p className="text-slate-500 text-sm">I need to find patients for my cases</p>
        </div>
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <ChevronRight />
        </div>
      </button>

      <button 
        onClick={() => setView('marketplace')}
        className="group p-8 bg-white border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all text-left flex items-center justify-between"
      >
        <div>
          <h3 className="font-bold text-xl text-slate-800 mb-1">I am a Patient</h3>
          <p className="text-slate-500 text-sm">I want to find free dental services</p>
        </div>
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <ChevronRight />
        </div>
      </button>
    </div>
  </div>
);

const StudentWarning = ({ setView }) => (
  <div className="max-w-xl mx-auto mt-16 px-4 animate-fade-in text-center">
    <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-200 shadow-xl">
      <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4">Are you a student?</h2>
      <p className="text-slate-500 mb-10 leading-relaxed">
        This section is specifically for <span className="font-bold text-slate-800 uppercase tracking-tight">Dental Students</span> who need to post clinical requirements. 
        If you are a <span className="font-bold text-blue-600 uppercase tracking-tight">Patient</span> looking for care, please go to the Marketplace.
      </p>
      <div className="flex flex-col gap-4">
        <button onClick={() => setView('signup')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">Yes, I am a Student</button>
        <button onClick={() => setView('marketplace')} className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold text-lg hover:bg-blue-100 transition">No, I'm looking for dental care</button>
      </div>
    </div>
  </div>
);

const StudentSignUp = ({ onComplete }) => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    studentNumber: '', 
    school: '', 
    course: '', 
    fbLink: '', 
    contactNumber: '', 
    idPhoto: null 
  });

  return (
    <div className="max-w-lg mx-auto mt-8 px-4 animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-200">2</div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Registration</h2>
            <p className="text-slate-500 text-sm">Tell us about your academic background.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Juan Dela Cruz" 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">School Attending</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. CEU, UP, UE" 
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Course</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. DMD" 
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Student Number</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="2024-XXXX" 
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({...formData, studentNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Contact No.</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="0912..." 
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Facebook Profile URL</label>
              <div className="relative">
                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="https://facebook.com/..." 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.fbLink}
                  onChange={(e) => setFormData({...formData, fbLink: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Student ID (Uniform Shot)</label>
              <div className="border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <Upload className="text-slate-300 group-hover:text-blue-500 mb-2 mx-auto" size={32} />
                <p className="text-sm font-bold text-slate-500">Tap to Upload Photo</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-tighter">Required: Wearing School Uniform</p>
              </div>
            </div>
          </div>

          <button onClick={() => onComplete(formData)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100">REQUEST APPROVAL</button>
          <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">DentaMatch admins will manually review your profile within 24 hours.</p>
        </div>
      </div>
    </div>
  );
};

const Marketplace = ({ cases, onSelectCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredCases = useMemo(() => cases.filter(c => c.treatment.toLowerCase().includes(searchTerm.toLowerCase()) || c.location.toLowerCase().includes(searchTerm.toLowerCase())), [cases, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Available Cases</h1>
        <p className="text-slate-500 text-sm mb-6">Browse open slots for supervised care.</p>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by treatment or city clinic..." 
            className="w-full pl-12 pr-4 py-5 bg-white rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition shadow-sm font-medium" 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-6">
        {filteredCases.map((c) => (
          <div key={c.id} onClick={() => onSelectCase(c)} className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col sm:flex-row gap-5 group">
            <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-3xl overflow-hidden shrink-0 border border-slate-100">
              <img src={c.studentAvatar || 'https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-xl text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{c.treatment}</h3>
                <div className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm">FREE</div>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-3 font-medium"><MapPin size={16} className="text-blue-500" /> {c.location}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center"><User size={12} className="text-blue-600" /></div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{c.studentName || c.profiles?.full_name}</span>
                </div>
                {c.reviews?.length > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star size={12} fill="currentColor" /> {c.reviews.length} Review{c.reviews.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CaseDetail = ({ caseData, onBack, onAddReview }) => {
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-8 font-bold text-sm hover:text-slate-800"><ArrowLeft size={18} /> BACK TO LIST</button>
      
      <div className="bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-sm mb-12">
        <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-end relative">
          <div className="bg-white p-2 rounded-[32px] shadow-2xl absolute -bottom-16 left-8 ring-8 ring-white">
            <img src={caseData.studentAvatar || 'https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=200'} className="w-28 h-28 rounded-[24px] object-cover" alt="Avatar" />
          </div>
        </div>
        
        <div className="pt-24 p-8 sm:p-12">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Requirement</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 text-xs">Posted recently</span>
            </div>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
            >
              Write Review
            </button>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 leading-tight">{caseData.treatment}</h1>
          
          <div className="mb-10 space-y-1">
            <p className="text-slate-600 text-lg flex items-center gap-2">
              Supervised by <span className="text-blue-600 font-black">{caseData.studentName || caseData.profiles?.full_name}</span>
            </p>
            <div className="text-slate-400 text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
              <GraduationCap size={16} className="text-blue-300" />
              <span>{caseData.school || caseData.profiles?.school}</span>
            </div>
          </div>

          {caseData.selected_teeth?.length > 0 && (
            <div className="mb-10">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Target Teeth (FDI Notation)</p>
               <div className="flex flex-wrap gap-2">
                 {caseData.selected_teeth.map(t => <span key={t} className="bg-blue-50 text-blue-600 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border border-blue-100 shadow-sm">{t}</span>)}
               </div>
            </div>
          )}

          <div className="space-y-8 mb-12">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                <MapPin className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-xs uppercase tracking-widest mb-1">Clinic Location</p>
                <p className="text-slate-600 text-lg font-medium">{caseData.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                <Info className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-xs uppercase tracking-widest mb-1">Case Description</p>
                <p className="text-slate-600 leading-relaxed text-lg">{caseData.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[40px] mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h4 className="font-black text-xl mb-3 flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg"><ShieldCheck size={20} className="text-white" /></div>
              <span>Patient Notice</span>
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              By inquiring, you understand that this is a <span className="text-white font-bold">teaching clinic environment</span>. 
              Procedures are free because they are part of a student's education. Expect longer appointment times as every step is checked by an instructor.
            </p>
          </div>

          <button onClick={() => setShowModal(true)} className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
            I WANT THIS SERVICE <ExternalLink size={20} />
          </button>
        </div>
      </div>

      {showReviewModal && (
        <ReviewEntryModal 
          studentName={caseData.studentName || caseData.profiles?.full_name}
          verificationCode={caseData.verificationCode || caseData.profiles?.verification_code}
          onClose={() => setShowReviewModal(false)}
          onSubmit={(review) => onAddReview(caseData.id, review)}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 text-center shadow-2xl animate-scale-up">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner"><MessageCircle size={44} /></div>
            <h3 className="text-3xl font-black mb-4 text-slate-900">Connect to Chat</h3>
            <p className="text-slate-500 mb-10 text-sm leading-relaxed px-2">You are moving to Facebook Messenger. Tell the student you found them on DentaMatch!</p>
            <a href={caseData.messengerLink || caseData.profiles?.fb_link} target="_blank" className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black block shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95" onClick={() => setShowModal(false)}>OPEN MESSENGER</a>
            <button onClick={() => setShowModal(false)} className="w-full text-slate-400 py-3 font-black text-xs uppercase tracking-widest mt-4 hover:text-slate-600 transition">CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewEntryModal = ({ studentName, verificationCode, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', rating: 5, comment: '', code: '' });

  const handleSubmit = () => {
    if (form.code !== verificationCode) {
      alert("Invalid Verification Code. Please check the code given to you by your student dentist.");
      return;
    }
    onSubmit({
      name: form.name || "Anonymous",
      rating: form.rating,
      comment: form.comment
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[80] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl animate-scale-up relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition"><X /></button>
        <h3 className="text-2xl font-black mb-2 text-slate-900">Review for {studentName}</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 px-1">Clinic Verification Required</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Your Name</label>
            <input type="text" placeholder="e.g. Maria Clara" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Overall Satisfaction</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setForm({...form, rating: star})}>
                  <Star size={28} fill={star <= form.rating ? "#f59e0b" : "transparent"} className={star <= form.rating ? "text-amber-500" : "text-slate-200"} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-blue-600">Enter Verification Code</label>
            <input type="text" placeholder="CODE-1234" className="w-full p-4 bg-blue-50 text-blue-700 rounded-2xl border-2 border-blue-100 font-black text-center tracking-widest focus:ring-2 focus:ring-blue-400 uppercase" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Your Experience</label>
            <textarea rows="3" placeholder="Tell us how the student handled your case..." className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">SUBMIT REVIEW</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostModal = ({ onOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ treatment: TREATMENT_TYPES[0], location: '', description: '', messenger: '', selectedTeeth: [], images: [] });

  if (!onOpen) return null;

  const toggleTooth = (num) => {
    setFormData(prev => ({
      ...prev,
      selectedTeeth: prev.selectedTeeth.includes(num)
        ? prev.selectedTeeth.filter(t => t !== num)
        : [...prev.selectedTeeth, num]
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[48px] my-8 overflow-hidden shadow-2xl animate-scale-up">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-20">
          <div><h2 className="text-2xl font-black text-slate-800">Post Case Requirement</h2><p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Fill in the details for your clinical requirement</p></div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition"><X /></button>
        </div>
        <div className="p-8 sm:p-10 space-y-8 h-[70vh] overflow-y-auto scrollbar-hide">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Type of Treatment Required</label>
            <select 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500"
              value={formData.treatment}
              onChange={(e) => setFormData({...formData, treatment: e.target.value})}
            >
              {TREATMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Select Target Teeth (FDI Notation)</label>
            <ToothChart selectedTeeth={formData.selectedTeeth} onToggleTooth={toggleTooth} />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Clinic Location</label>
              <input type="text" placeholder="e.g. UE Clinic, Manila" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, location: e.target.value})}/>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Messenger Link</label>
              <input type="text" placeholder="https://m.me/..." className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, messenger: e.target.value})}/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Brief Description</label>
            <textarea rows="3" placeholder="Additional requirements..." className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
        </div>
        <div className="p-8 pt-0 sticky bottom-0 bg-white">
          <button onClick={() => { onAdd(formData); onClose(); }} className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-xl hover:bg-slate-800 transition shadow-2xl active:scale-95">PUBLISH CASE</button>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = ({ userData, cases, onNewPost, onRemoveCase }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-20">
      <div className="bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-sm mb-10">
        <div className="h-56 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-800 relative">
          <button className="absolute bottom-6 right-6 bg-white/20 hover:bg-white/40 text-white p-3 rounded-2xl backdrop-blur-xl border border-white/30 transition shadow-sm"><Settings size={20} /></button>
        </div>
        
        <div className="px-8 pb-10 flex flex-col sm:flex-row items-end gap-8 -mt-16 relative">
          <div className="relative shrink-0">
            <div className="w-44 h-44 rounded-[42px] bg-white p-2 shadow-2xl ring-8 ring-white/50">
              <img src={'https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=200'} className="w-full h-full rounded-[34px] object-cover" alt="Profile" />
            </div>
            <div className="absolute bottom-4 right-4 bg-green-500 w-8 h-8 rounded-full border-[6px] border-white shadow-md"></div>
          </div>
          
          <div className="flex-1 pb-4">
            <h2 className="text-4xl font-black text-slate-800 leading-tight">{userData?.full_name || 'Alex Rivera'}</h2>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-blue-100">Student Dentist</span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="text-slate-500 font-bold text-sm flex items-center gap-1.5"><GraduationCap size={16} className="text-blue-500" /> {userData?.school || 'UE'}</span>
              </div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-1"><BookOpen size={14} className="text-slate-300" /> {userData?.course || 'DMD'}</div>
            </div>
          </div>
          
          <button onClick={onNewPost} className="bg-blue-600 text-white px-10 py-5 rounded-[28px] font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-100 flex items-center gap-3 mb-4 w-full sm:w-auto justify-center active:scale-95">
            <Plus size={24} /> <span>POST CASE</span>
          </button>
        </div>

        <div className="border-t border-slate-50 bg-slate-50/50 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
             <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-200">
               <Award size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Verification Code for Patients</p>
               <p className="text-xl font-black text-blue-800 tracking-widest">{userData?.verification_code || "ALEX-2024"}</p>
             </div>
           </div>
        </div>
      </div>
      
      <div className="space-y-6 px-4">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-4">
          <span>My Requirements</span> 
          <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black tracking-tighter">{cases.length}</span>
        </h3>
        {cases.length > 0 ? (
          <div className="grid gap-5">
            {cases.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-[32px] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black tracking-tighter border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">DMD</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-snug group-hover:text-blue-600 transition-colors">{c.treatment}</h4>
                    <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-1 font-medium"><MapPin size={14} className="text-blue-400" /> {c.location}</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => onRemoveCase(c.id)} className="flex-1 sm:flex-none p-3.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition active:scale-95"><Trash2 size={22} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[56px] border-4 border-dashed border-slate-50 text-center">
            <Plus className="text-slate-200 mx-auto mb-6" size={48} />
            <h4 className="font-black text-2xl text-slate-800 mb-3 uppercase tracking-tighter">Your Feed is Empty</h4>
            <button onClick={onNewPost} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-xl active:scale-95 uppercase tracking-widest text-xs">Create First Post</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [globalReviewSearch, setGlobalReviewSearch] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [foundCase, setFoundCase] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth and Data Loading
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(prof);
      }
      await fetchCases();
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(prof);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchCases = async () => {
    const { data } = await supabase.from('cases').select('*, profiles(*)').order('created_at', { ascending: false });
    if (data) setCases(data);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setView('landing'); };
  
  const handleStudentSignUp = async (formData) => { 
    alert("In the full alpha release, we use Supabase Auth for student registration.");
    // Manual local session override for alpha simulation
    setUser({ id: 'dummy' });
    setProfile({
      full_name: formData.fullName,
      school: formData.school,
      course: formData.course,
      verification_code: formData.fullName.substring(0,4).toUpperCase() + "-" + Math.floor(Math.random() * 9000)
    });
    setView('studentDash'); 
  };

  const handleAddCase = async (formData) => {
    if (!user) return;
    const { error } = await supabase.from('cases').insert([{
      student_id: user.id === 'dummy' ? null : user.id, // For demo purposes
      treatment: formData.treatment,
      location: formData.location,
      description: formData.description,
      selected_teeth: formData.selectedTeeth,
      messenger_link: formData.messenger
    }]);
    
    if (error) alert(error.message);
    else fetchCases();
  };

  const handleRemoveCase = async (id) => { 
    await supabase.from('cases').delete().eq('id', id);
    fetchCases();
  };

  const handleAddReview = async (caseId, review) => {
    const { error } = await supabase.from('reviews').insert([{
      case_id: caseId,
      patient_name: review.name,
      rating: review.rating,
      comment: review.comment
    }]);
    
    if (error) alert(error.message);
    else {
      alert("Review submitted!");
      fetchCases();
    }
  };

  const handleSearchByCode = () => {
    const matched = cases.find(c => (c.verificationCode || c.profiles?.verification_code) === searchCode.toUpperCase());
    if (matched) setFoundCase(matched);
    else alert("No student found with that code.");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-blue-600">DENTAMATCH LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar user={user} onLogout={handleLogout} setView={setView} />
      
      <main className="max-w-6xl mx-auto min-h-[calc(100vh-160px)]">
        {view === 'landing' && <LandingPage setView={setView} onOpenReview={() => setGlobalReviewSearch(true)} />}
        {view === 'choice' && <UserChoice setView={setView} />}
        {view === 'studentWarning' && <StudentWarning setView={setView} />}
        {view === 'signup' && <StudentSignUp onComplete={handleStudentSignUp} />}
        {view === 'marketplace' && <Marketplace cases={cases} onSelectCase={(c) => { setSelectedCase(c); setView('caseDetail'); }} />}
        {view === 'caseDetail' && selectedCase && <CaseDetail caseData={selectedCase} onBack={() => setView('marketplace')} onAddReview={handleAddReview} />}
        {view === 'studentDash' && profile && <StudentDashboard userData={profile} cases={cases.filter(c => c.student_id === user.id)} onNewPost={() => setIsPostModalOpen(true)} onRemoveCase={handleRemoveCase} />}
      </main>
      
      <PostModal onOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onAdd={handleAddCase} />
      
      {globalReviewSearch && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          {!foundCase ? (
            <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl animate-scale-up text-center relative">
               <button onClick={() => setGlobalReviewSearch(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition"><X /></button>
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <SearchCheck size={36} />
               </div>
               <h3 className="text-2xl font-black mb-3">Find Your Student</h3>
               <p className="text-slate-500 text-sm mb-8 leading-relaxed">Enter the verification code given to you by the student dentist after your clinical session.</p>
               <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="ENTER CODE (e.g. ALEX-2024)" 
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-center tracking-widest focus:ring-2 focus:ring-blue-500 uppercase"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                  <button 
                    onClick={handleSearchByCode}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Locate Student
                  </button>
               </div>
            </div>
          ) : (
            <ReviewEntryModal 
              studentName={foundCase.studentName || foundCase.profiles?.full_name}
              verificationCode={foundCase.verificationCode || foundCase.profiles?.verification_code}
              onClose={() => { setGlobalReviewSearch(false); setFoundCase(null); setSearchCode(''); }}
              onSubmit={(review) => handleAddReview(foundCase.id, review)}
            />
          )}
        </div>
      )}

      <footer className="py-8 text-center border-t border-slate-200 bg-white mt-12">
        <div className="inline-flex items-center gap-2 cursor-pointer group mb-2" onClick={() => { const pin = prompt("Admin PIN:"); if (pin === "1234") alert("Admin Active"); }}>
          <Stethoscope size={20} className="text-blue-600" />
          <span className="text-lg font-black text-slate-300 group-hover:text-blue-600 transition-colors uppercase">DentaMatch</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Philippines' Educational Dental Marketplace</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}