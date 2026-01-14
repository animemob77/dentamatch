import React, { useState, useEffect, useMemo } from 'react';
// CDN import for Supabase to ensure preview functionality
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { 
  Search, MapPin, User, Plus, MessageCircle, ShieldCheck, ChevronRight, 
  Info, ArrowLeft, Settings, LogOut, CheckCircle, X, Stethoscope, 
  Camera, Facebook, Phone, Hash, Upload, ExternalLink, Trash2, 
  GraduationCap, BookOpen, AlertTriangle, Star, Award, SearchCheck, Mail, Lock
} from 'lucide-react';

// --- Supabase Client Initialization ---
const supabaseUrl = "https://lnfcrhjxnjbtntuoalzn.supabase.co";
const supabaseAnonKey = "sb_publishable_QbD2C93-sHZ6aw1pNBDbdw_NzXInFJM";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Constants ---
const TREATMENT_TYPES = [
  "Prophylaxis (Cleaning)", "Restoration (Filling) - Class I", "Restoration (Filling) - Class II",
  "Extraction (Simple)", "Extraction (Surgical/Molar)", "Root Canal Therapy",
  "Complete Dentures", "Removable Partial Dentures", "Fixed Bridge/Crown",
  "Orthodontic Assessment", "Periodontal Treatment"
];

// --- Sub-components ---

const ToothChart = ({ selectedTeeth, onToggleTooth }) => {
  const upperArch = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerArch = Array.from({ length: 16 }, (_, i) => 32 - i);
  const renderTooth = (num) => (
    <button key={num} onClick={() => onToggleTooth(num)} type="button"
      className={`w-8 h-10 flex flex-col items-center justify-center rounded-lg border transition-all ${selectedTeeth.includes(num) ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>
      <span className="text-[10px] font-bold">{num}</span>
      <div className={`w-3 h-4 mt-1 rounded-sm border-2 ${selectedTeeth.includes(num) ? 'border-white' : 'border-slate-200'}`}></div>
    </button>
  );
  return (
    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 overflow-x-auto">
      <div className="min-w-[500px] py-2">
        <div className="flex justify-center gap-1 mb-6">{upperArch.map(renderTooth)}</div>
        <div className="flex justify-center gap-1">{lowerArch.map(renderTooth)}</div>
      </div>
    </div>
  );
};

const Navbar = ({ user, setView, onLogout }) => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center">
    <div className="max-w-6xl mx-auto px-4 w-full flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200"><Stethoscope className="text-white w-5 h-5" /></div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">DentaMatch</span>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button onClick={() => setView('studentDash')} className="text-slate-600 font-semibold text-sm hover:text-blue-600">Dashboard</button>
            <button onClick={onLogout} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition"><LogOut size={16} /></button>
          </>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setView('login')} className="text-slate-600 font-bold text-sm px-4 py-2 hover:bg-slate-50 rounded-full transition">Login</button>
            <button onClick={() => setView('choice')} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition">Sign Up</button>
          </div>
        )}
      </div>
    </div>
  </nav>
);

const LandingPage = ({ setView, onOpenReview }) => (
  <div className="animate-fade-in pb-12">
    <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">Realize a Dream, <br/><span className="text-blue-600">Get Free Dental Care.</span></h1>
      <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">Connecting passionate dental students with the community for supervised, high-quality clinical care in the Philippines.</p>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
          <button onClick={() => setView('marketplace')} className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition active:scale-95">I Need Dental Care</button>
          <button onClick={() => setView('studentWarning')} className="flex-1 bg-white border-2 border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition active:scale-95 text-slate-700">I'm a Dental Student</button>
        </div>
        <button onClick={onOpenReview} className="text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:underline">
          <Star size={14} className="text-amber-400" fill="currentColor"/> Leave a Review for a Student
        </button>
      </div>
    </section>
  </div>
);

// --- Main App Implementation ---

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [globalReviewSearch, setGlobalReviewSearch] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [foundCase, setFoundCase] = useState(null);

  useEffect(() => {
    fetchCases();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchCases = async () => {
    const { data, error } = await supabase.from('cases').select('*, profiles(*), reviews(*)').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setCases(data || []);
  };

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
  };

  const handleSignUp = async (formData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    if (authData.user) {
      const vCode = formData.fullName.substring(0,4).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 8999);
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        full_name: formData.fullName,
        student_number: formData.studentNumber,
        school: formData.school,
        course: formData.course,
        fb_link: formData.fbLink,
        contact_number: formData.contactNumber,
        verification_code: vCode
      }]);

      if (profileError) {
        alert("Error creating profile: " + profileError.message);
      } else {
        alert("Registration successful!");
        setView('studentDash');
      }
    }
  };

  const handleLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else setView('studentDash');
  };

  const handlePostCase = async (formData) => {
    const { error } = await supabase.from('cases').insert([{
      student_id: user.id,
      treatment: formData.treatment,
      location: formData.location,
      description: formData.description,
      selected_teeth: formData.selectedTeeth,
      images: [] 
    }]);

    if (error) alert(error.message);
    else {
      setIsPostModalOpen(false);
      fetchCases();
    }
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
      setGlobalReviewSearch(false);
      setFoundCase(null);
    }
  };

  const handleSearchByCode = () => {
    const matched = cases.find(c => c.profiles?.verification_code === searchCode.toUpperCase());
    if (matched) setFoundCase(matched);
    else alert("No student found with that code.");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-blue-600 animate-pulse tracking-widest">DENTAMATCH ALPHA...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar user={user} setView={setView} onLogout={handleLogout} />
      
      <main className="max-w-6xl mx-auto px-4 min-h-[calc(100vh-160px)]">
        {view === 'landing' && <LandingPage setView={setView} onOpenReview={() => setGlobalReviewSearch(true)} />}
        
        {view === 'login' && <LoginView onLogin={handleLogin} onSwitch={() => setView('choice')} />}

        {view === 'choice' && <UserChoiceView setView={setView} />}

        {view === 'studentWarning' && <StudentWarningView setView={setView} />}

        {view === 'signup' && <SignUpView onComplete={handleSignUp} />}
        
        {view === 'marketplace' && <MarketplaceView cases={cases} onSelectCase={(c) => { setSelectedCase(c); setView('caseDetail'); }} />}
        
        {view === 'caseDetail' && selectedCase && (
          <CaseDetailView caseData={selectedCase} onBack={() => setView('marketplace')} onAddReview={handleAddReview} />
        )}

        {view === 'studentDash' && profile && (
          <StudentDashView profile={profile} cases={cases.filter(c => c.student_id === user.id)} onNewPost={() => setIsPostModalOpen(true)} onRemove={async (id) => { await supabase.from('cases').delete().eq('id', id); fetchCases(); }} />
        )}
      </main>

      <PostModal onOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onAdd={handlePostCase} />

      {globalReviewSearch && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          {!foundCase ? (
            <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl text-center relative animate-scale-up">
               <button onClick={() => setGlobalReviewSearch(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X /></button>
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><SearchCheck size={36} /></div>
               <h3 className="text-2xl font-black mb-3">Find Your Student</h3>
               <p className="text-slate-500 text-sm mb-8">Enter the verification code given by the student dentist.</p>
               <input type="text" placeholder="ENTER CODE" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-center mb-4 uppercase" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
               <button onClick={handleSearchByCode} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">LOCATE STUDENT</button>
            </div>
          ) : (
            <ReviewEntryModal studentName={foundCase.profiles?.full_name} verificationCode={foundCase.profiles?.verification_code} onClose={() => { setGlobalReviewSearch(false); setFoundCase(null); }} onSubmit={(rev) => handleAddReview(foundCase.id, rev)} />
          )}
        </div>
      )}

      <footer className="py-8 text-center border-t border-slate-200 mt-20">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Philippines' Educational Dental Marketplace</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}

// --- View Components ---

function LoginView({ onLogin, onSwitch }) {
  const [e, setE] = useState('');
  const [p, setP] = useState('');
  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-[48px] border shadow-sm animate-fade-in">
      <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest">Welcome Back</h2>
      <div className="space-y-4">
        <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><input type="email" placeholder="Email Address" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setE(x.target.value)}/></div>
        <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><input type="password" placeholder="Password" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setP(x.target.value)}/></div>
        <button onClick={() => onLogin(e, p)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase tracking-widest mt-4">Login</button>
        <button onClick={onSwitch} className="w-full text-slate-400 font-bold text-sm mt-2">New student? Sign up here</button>
      </div>
    </div>
  );
}

function SignUpView({ onComplete }) {
  const [f, setF] = useState({ fullName: '', school: '', course: '', email: '', password: '', studentNumber: '', fbLink: '', contactNumber: '' });
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-10 rounded-[48px] border shadow-sm animate-fade-in pb-20">
      <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-widest">Student Registration</h2>
      <div className="space-y-4">
        <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, fullName: x.target.value})}/>
        <div className="grid grid-cols-2 gap-4">
          <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, email: x.target.value})}/>
          <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, password: x.target.value})}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="School" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, school: x.target.value})}/>
          <input type="text" placeholder="Course (e.g. DMD)" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, course: x.target.value})}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Student #" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, studentNumber: x.target.value})}/>
          <input type="text" placeholder="Contact #" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, contactNumber: x.target.value})}/>
        </div>
        <input type="text" placeholder="Facebook Profile Link" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" onChange={x => setF({...f, fbLink: x.target.value})}/>
        <button onClick={() => onComplete(f)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl uppercase tracking-widest mt-4 hover:bg-blue-700">Register & Apply</button>
      </div>
    </div>
  );
}

function MarketplaceView({ cases, onSelectCase }) {
  const [q, setQ] = useState('');
  const filtered = cases.filter(c => c.treatment?.toLowerCase().includes(q.toLowerCase()) || c.location?.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="py-12 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-3xl font-black mb-2">Available Care</h1>
        <p className="text-slate-500 text-sm mb-6">Clinic sessions supervised by university instructors.</p>
        <div className="relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/><input type="text" className="w-full pl-14 p-5 bg-white border rounded-[28px] font-medium shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500" placeholder="Search by procedure or city..." onChange={e => setQ(e.target.value)}/></div>
      </div>
      <div className="grid gap-6">
        {filtered.map(c => (
          <div key={c.id} onClick={() => onSelectCase(c)} className="bg-white p-6 rounded-[40px] border flex flex-col sm:flex-row gap-6 cursor-pointer hover:shadow-xl transition group">
            <div className="w-28 h-28 rounded-[32px] overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
              <img src={'https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Clinic" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-2"><h3 className="font-black text-xl group-hover:text-blue-600 transition">{c.treatment}</h3><span className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-black">FREE</span></div>
              <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-4"><MapPin size={16} className="text-blue-500"/> {c.location}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.profiles?.full_name}</span>
                {c.reviews?.length > 0 && <span className="text-amber-500 font-black text-xs flex items-center gap-1"><Star size={12} fill="currentColor"/> {c.reviews.length} REVIEW(S)</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CaseDetailView({ caseData, onBack, onAddReview }) {
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  return (
    <div className="py-12 max-w-2xl mx-auto animate-fade-in pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-8 font-black text-xs uppercase tracking-widest hover:text-slate-800"><ArrowLeft size={16}/> BACK</button>
      <div className="bg-white rounded-[56px] border shadow-sm overflow-hidden mb-12">
        <div className="h-44 bg-gradient-to-br from-blue-600 to-indigo-800 relative">
          <div className="bg-white p-2 rounded-[40px] absolute -bottom-16 left-10 shadow-2xl ring-8 ring-white">
            <img src={'https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=200'} className="w-32 h-32 rounded-[32px] object-cover" alt="Student" />
          </div>
        </div>
        <div className="pt-24 p-12">
          <h1 className="text-4xl font-black mb-3 leading-tight">{caseData.treatment}</h1>
          <p className="text-slate-500 mb-10 font-bold text-lg">By {caseData.profiles?.full_name} • <span className="text-blue-600">{caseData.profiles?.school}</span></p>
          <div className="space-y-6 mb-12">
            <div className="flex gap-4 items-center"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><MapPin className="text-blue-500" size={20}/></div><p className="font-bold">{caseData.location}</p></div>
            <div className="flex gap-4 items-start"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><Info className="text-blue-500" size={20}/></div><p className="font-medium text-slate-600 leading-relaxed">{caseData.description}</p></div>
          </div>
          <div className="bg-slate-900 text-white p-8 rounded-[40px] mb-8 relative overflow-hidden">
             <h4 className="font-black text-xl mb-2 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-400"/> Patient Notice</h4>
             <p className="text-slate-400 text-sm">Teaching clinic setting. Appointments are free but may take longer for instructor verification.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl hover:bg-blue-700 active:scale-95 transition">GET THIS SERVICE</button>
          <button onClick={() => setShowReviewModal(true)} className="w-full text-blue-600 font-black uppercase text-xs tracking-widest mt-6 hover:underline">Write a Review</button>
        </div>
      </div>
      
      {caseData.reviews?.length > 0 && (
        <div className="bg-white rounded-[48px] border p-12 shadow-sm">
           <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Award className="text-blue-600"/> Verified Patient Experience</h3>
           <div className="space-y-8">
              {caseData.reviews.map(r => (
                <div key={r.id} className="border-b last:border-0 pb-6"><p className="font-black mb-1">{r.patient_name}</p><div className="flex gap-0.5 mb-2">{[...Array(5)].map((_,i) => <Star key={i} size={14} fill={i < r.rating ? "#f59e0b" : "none"} className={i < r.rating ? "text-amber-500" : "text-slate-200"}/>)}</div><p className="text-slate-500 italic">"{r.comment}"</p></div>
              ))}
           </div>
        </div>
      )}

      {showReviewModal && <ReviewEntryModal studentName={caseData.profiles?.full_name} verificationCode={caseData.profiles?.verification_code} onClose={() => setShowReviewModal(false)} onSubmit={(rev) => onAddReview(caseData.id, rev)} />}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-12 text-center animate-scale-up">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[36px] flex items-center justify-center mx-auto mb-8 shadow-inner"><MessageCircle size={48} /></div>
            <h3 className="text-3xl font-black mb-4">Chat to Schedule</h3>
            <p className="text-slate-500 mb-8 font-medium">Redirecting you to Facebook Messenger. Mention DentaMatch to the student!</p>
            <a href={caseData.profiles?.fb_link || '#'} target="_blank" className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black block shadow-lg hover:bg-blue-700 transition uppercase tracking-widest text-sm">Open Messenger</a>
            <button onClick={() => setShowModal(false)} className="mt-6 text-slate-300 font-black uppercase text-[10px] tracking-widest hover:text-slate-500">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentDashView({ profile, cases, onNewPost, onRemove }) {
  return (
    <div className="py-16 animate-fade-in pb-32">
      <div className="bg-white rounded-[56px] border p-10 sm:p-16 shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row items-center gap-12">
          <div className="w-40 h-40 bg-blue-600 rounded-[42px] flex items-center justify-center text-white text-5xl font-black shadow-2xl ring-8 ring-slate-50">{profile.full_name?.charAt(0)}</div>
          <div className="text-center sm:text-left">
             <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Welcome, {profile.full_name}</h1>
             <p className="text-slate-400 font-bold uppercase text-xs mb-6 tracking-widest">{profile.course} • {profile.school}</p>
             <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 inline-block">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">Clinic Verification Code</p>
                <p className="text-3xl font-black text-blue-800 tracking-[0.2em]">{profile.verification_code}</p>
             </div>
          </div>
        </div>
        <div className="mt-12 pt-12 border-t flex flex-col sm:flex-row gap-4">
           <button onClick={onNewPost} className="bg-blue-600 text-white px-10 py-5 rounded-[28px] font-black shadow-xl hover:bg-blue-700 flex items-center justify-center gap-3 uppercase tracking-widest text-sm transition"><Plus size={20}/> Post Requirement</button>
        </div>
      </div>
      <div className="grid gap-4 px-4">
         <h3 className="font-black text-xl mb-4 uppercase tracking-widest text-slate-800">My Active Posts</h3>
         {cases.map(c => (
           <div key={c.id} className="bg-white p-6 rounded-[32px] border flex justify-between items-center group shadow-sm hover:shadow-md transition">
              <div><h4 className="font-black text-lg group-hover:text-blue-600">{c.treatment}</h4><p className="text-slate-400 text-sm font-bold">{c.location}</p></div>
              <button onClick={() => onRemove(c.id)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition"><Trash2 size={20}/></button>
           </div>
         ))}
      </div>
    </div>
  );
}

function UserChoiceView({ setView }) {
  return (
    <div className="max-w-md mx-auto mt-16 text-center animate-fade-in">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Get Started</h2>
      <div className="grid gap-4">
        <button onClick={() => setView('studentWarning')} className="p-10 bg-white border-2 rounded-[40px] flex justify-between items-center hover:border-blue-500 transition group shadow-sm">
           <div className="text-left"><h3 className="font-bold text-xl mb-1">I am a Student</h3><p className="text-slate-400 text-sm">Post my requirements</p></div>
           <ChevronRight className="text-slate-200 group-hover:text-blue-500" />
        </button>
        <button onClick={() => setView('marketplace')} className="p-10 bg-white border-2 rounded-[40px] flex justify-between items-center hover:border-blue-500 transition group shadow-sm">
           <div className="text-left"><h3 className="font-bold text-xl mb-1">I am a Patient</h3><p className="text-slate-400 text-sm">Find dental assistance</p></div>
           <ChevronRight className="text-slate-200 group-hover:text-blue-500" />
        </button>
      </div>
    </div>
  );
}

function StudentWarningView({ setView }) {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center animate-fade-in">
      <div className="bg-white p-12 rounded-[56px] border shadow-2xl">
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black mb-4 uppercase">Verification Required</h2>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">This flow is for licensed dental students only. You will need to provide school verification to post cases.</p>
        <div className="flex flex-col gap-4">
          <button onClick={() => setView('signup')} className="bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 uppercase tracking-widest text-sm">Start Application</button>
          <button onClick={() => setView('marketplace')} className="bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm">I'm just browsing</button>
        </div>
      </div>
    </div>
  );
}

function PostModal({ onOpen, onClose, onAdd }) {
  const [f, setF] = useState({ treatment: TREATMENT_TYPES[0], location: '', description: '', selectedTeeth: [] });
  if (!onOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[56px] my-8 overflow-hidden animate-scale-up shadow-2xl">
        <div className="p-10 border-b flex justify-between items-center"><div><h2 className="text-2xl font-black">Post Case</h2><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">New Clinical Requirement</p></div><button onClick={onClose}><X/></button></div>
        <div className="p-10 space-y-8 h-[60vh] overflow-y-auto">
           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" value={f.treatment} onChange={x => setF({...f, treatment: x.target.value})}>{TREATMENT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
           <ToothChart selectedTeeth={f.selectedTeeth} onToggleTooth={t => setF({...f, selectedTeeth: f.selectedTeeth.includes(t) ? f.selectedTeeth.filter(y => y !== t) : [...f.selectedTeeth, t]})}/>
           <input type="text" placeholder="Clinic Location" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" onChange={x => setF({...f, location: x.target.value})}/>
           <textarea placeholder="Description & Requirements" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" rows="3" onChange={x => setF({...f, description: x.target.value})}></textarea>
        </div>
        <div className="p-10 pt-0"><button onClick={() => onAdd(f)} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl">PUBLISH CLINICAL REQUIREMENT</button></div>
      </div>
    </div>
  );
}

const ReviewEntryModal = ({ studentName, verificationCode, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', rating: 5, comment: '', code: '' });
  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl animate-scale-up relative">
        <h3 className="text-2xl font-black mb-2 text-slate-900">Review {studentName}</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Verification Required</p>
        <div className="space-y-5">
          <input type="text" placeholder="Your Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" onChange={e => setForm({...form, name: e.target.value})} />
          <div className="flex gap-2">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setForm({...form, rating: s})}><Star size={28} fill={s <= form.rating ? "#f59e0b" : "none"} className={s <= form.rating ? "text-amber-500" : "text-slate-200"}/></button>)}</div>
          <input type="text" placeholder="Verification Code" className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-center uppercase tracking-widest border-2 border-blue-100" onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
          <textarea placeholder="Share your experience..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" rows="3" onChange={e => setForm({...form, comment: e.target.value})}></textarea>
          <div className="flex gap-3 pt-4"><button onClick={() => { if(form.code !== verificationCode) return alert("Wrong code!"); onSubmit(form); }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">SUBMIT</button><button onClick={onClose} className="px-6 font-bold text-slate-300">CANCEL</button></div>
        </div>
      </div>
    </div>
  );
};