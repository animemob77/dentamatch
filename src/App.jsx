import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, MapPin, User, Plus, MessageCircle, ShieldCheck, ChevronRight, 
  Info, ArrowLeft, Settings, Bell, LogOut, CheckCircle, X,
  Stethoscope, Camera, Facebook, Phone, Hash, Upload, ExternalLink, Trash2,
  GraduationCap, BookOpen, AlertTriangle, Image as ImageIcon, Star, Award, SearchCheck, Mail, Lock, 
  ShieldAlert, UserCheck, Clock, Loader2
} from 'lucide-react';

// --- Constants ---
const TREATMENT_TYPES = [
  "Prophylaxis (Cleaning)", "Restoration (Filling) - Class I", "Restoration (Filling) - Class II",
  "Extraction (Simple)", "Extraction (Surgical/Molar)", "Root Canal Therapy",
  "Complete Dentures", "Removable Partial Dentures", "Fixed Bridge/Crown",
  "Orthodontic Assessment", "Periodontal Treatment"
];

const ADMIN_PIN = "012201"; 

// --- Supabase Config ---
// In a real local setup, use import.meta.env.VITE_SUPABASE_URL
const SUPABASE_URL = "https://lnfcrhjxnjbtntuoalzn.supabase.co";
const SUPABASE_KEY = "sb_publishable_QbD2C93-sHZ6aw1pNBDbdw_NzXInFJM";

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

// --- Main App Implementation ---

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [supabase, setSupabase] = useState(null);
  
  // UI States
  const [selectedCase, setSelectedCase] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [globalReviewSearch, setGlobalReviewSearch] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [foundCase, setFoundCase] = useState(null);

  // Signup Image files
  const [idFile, setIdFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Admin States
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [pendingAccounts, setPendingAccounts] = useState([]);

  // 1. Dynamic Supabase Loader (for Preview)
  useEffect(() => {
    const loadSupabase = async () => {
      if (window.supabase) {
        initSupabase();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = initSupabase;
      document.body.appendChild(script);
    };

    const initSupabase = () => {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      setSupabase(client);
    };

    loadSupabase();
  }, []);

  // 2. Auth & Data Listeners
  useEffect(() => {
    if (!supabase) return;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthStateChange(session);
      await fetchCases();
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthStateChange(session);
    });

    init();
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAuthStateChange = async (session) => {
    setUser(session?.user || null);
    if (session?.user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
    } else {
      setProfile(null);
    }
  };

  const fetchCases = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('cases')
      .select('*, profiles(*), reviews(*)')
      .order('created_at', { ascending: false });
    if (data) setCases(data);
  };

  // 3. Admin & Logo Logic
  const handleLogoClick = () => {
    setView('landing');
    setLogoClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdminLogin(true);
        return 0;
      }
      return newCount;
    });
    setTimeout(() => setLogoClicks(0), 2000);
  };

  const fetchPendingAccounts = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('is_approved', false);
    if (data) setPendingAccounts(data);
  };

  const approveAccount = async (id) => {
    if (!supabase) return;
    setIsProcessing(true);
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id);
    if (error) alert(error.message);
    else {
      alert("Account Approved! Verification confirmation sent to student.");
      fetchPendingAccounts();
    }
    setIsProcessing(false);
  };

  // --- Handlers ---
  const handleSignUp = async (formData) => {
    if (!supabase) return;

    // VALIDATION
    const required = ['fullName', 'school', 'course', 'studentNumber', 'email', 'fbLink', 'contactNumber', 'password'];
    for (let f of required) { if (!formData[f]) return alert(`Missing: ${f.replace(/([A-Z])/g, ' $1').toLowerCase()}`); }
    if (!idFile || !profileFile) return alert("Please upload both Student ID and Profile Photo.");

    setIsProcessing(true);

    try {
      // 1. Sign Up Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Upload Images
      const uploadImg = async (file, path) => {
        const ext = file.name.split('.').pop();
        const fileName = `${userId}-${path}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('verifications').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('verifications').getPublicUrl(fileName);
        return publicUrl;
      };

      // In a real deployment with storage set up, these would run. 
      // For this preview/alpha without bucket setup, we will use placeholders if upload fails to unblock testing.
      let idUrl = "", avatarUrl = "";
      try {
         idUrl = await uploadImg(idFile, 'id');
         avatarUrl = await uploadImg(profileFile, 'avatar');
      } catch (e) {
         console.warn("Storage not configured yet, using local preview");
         idUrl = idPreview;
         avatarUrl = profilePreview;
      }

      // 3. Create Profile
      const vCode = formData.fullName.substring(0,4).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 8999);
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: userId,
        email: formData.email,
        full_name: formData.fullName,
        student_number: formData.studentNumber,
        school: formData.school,
        course: formData.course,
        fb_link: formData.fbLink,
        contact_number: formData.contactNumber,
        verification_code: vCode,
        id_url: idUrl,
        avatar_url: avatarUrl,
        is_approved: false
      }]);
      if (profileError) throw profileError;

      alert("Application submitted! We will email you once verified.");
      setView('landing');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (email, password) => {
    if (!supabase || !email || !password) return alert("Check credentials.");
    setIsProcessing(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else setView('studentDash');
    setIsProcessing(false);
  };

  const handleForgotPassword = async (email) => {
    if (!supabase || !email) return alert("Email required.");
    setIsProcessing(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) alert(error.message);
    else alert("Reset link sent!");
    setIsProcessing(false);
  };

  const handlePostCase = async (formData) => {
    if (!supabase || !user) return;
    if (!profile?.is_approved) return alert("Pending Review: Post access disabled until verified.");
    if (!formData.location || !formData.description || formData.selectedTeeth.length === 0) return alert("Missing details.");

    setIsProcessing(true);
    const { error } = await supabase.from('cases').insert([{
      student_id: user.id,
      treatment: formData.treatment,
      location: formData.location,
      description: formData.description,
      selected_teeth: formData.selectedTeeth
    }]);

    if (error) alert(error.message);
    else { setIsPostModalOpen(false); fetchCases(); }
    setIsProcessing(false);
  };

  const handleAddReview = async (caseId, review) => {
    if (!supabase || !review.name || !review.comment) return alert("Missing details.");
    setIsProcessing(true);
    const { error } = await supabase.from('reviews').insert([{
      case_id: caseId,
      patient_name: review.name,
      rating: review.rating,
      comment: review.comment
    }]);
    if (error) alert(error.message);
    else { alert("Review posted!"); fetchCases(); setGlobalReviewSearch(false); setFoundCase(null); }
    setIsProcessing(false);
  };

  const handleFileChange = (e, fileSetter, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      fileSetter(file);
      const reader = new FileReader();
      reader.onload = (event) => previewSetter(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSearchByCode = () => {
    const matched = cases.find(c => c.profiles?.verification_code === searchCode.toUpperCase());
    if (matched) setFoundCase(matched);
    else alert("No student found with that code.");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-[0.3em]">DentaMatch Loading</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {isProcessing && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-[48px] shadow-2xl flex flex-col items-center animate-scale-up">
             <Loader2 className="text-blue-600 animate-spin mb-4" size={48} />
             <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Processing...</p>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center px-4">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={handleLogoClick}>
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200"><Stethoscope className="text-white w-5 h-5" /></div>
            <span className="font-bold text-xl tracking-tight text-slate-800">DentaMatch</span>
          </div>
          <div className="flex items-center gap-4">
            {adminAuthenticated && <button onClick={() => { setView('adminDash'); fetchPendingAccounts(); }} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={14}/> Admin Panel</button>}
            {user ? (
              <>
                <button onClick={() => setView('studentDash')} className="text-slate-600 font-semibold text-sm hover:text-blue-600 transition">Dashboard</button>
                <button onClick={() => { setAdminAuthenticated(false); supabase.auth.signOut(); }} className="flex items-center gap-1 text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition"><LogOut size={16} /><span className="hidden sm:inline">Logout</span></button>
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
      
      <main className="max-w-6xl mx-auto min-h-[calc(100vh-160px)] px-4">
        {view === 'landing' && (
          <div className="animate-fade-in">
            <section className="bg-gradient-to-b from-blue-50 to-white py-20 text-center rounded-b-[64px]">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">Realize a Dream, <br/><span className="text-blue-600">Get Free Dental Care.</span></h1>
              <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed px-4">Connecting passionate dental students with community members for supervised clinical care. Helping students graduate while providing free procedures.</p>
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center px-4">
                  <button onClick={() => setView('marketplace')} className="flex-1 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition active:scale-95">I Need Dental Care</button>
                  <button onClick={() => setView('studentWarning')} className="flex-1 bg-white border-2 border-slate-200 text-slate-700 px-10 py-5 rounded-3xl font-black text-lg hover:bg-slate-50 transition active:scale-95 shadow-sm">I'm a Dental Student</button>
                </div>
                <button onClick={() => setGlobalReviewSearch(true)} className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest hover:underline mt-4"><Star size={18} className="text-amber-400" fill="currentColor" /> Leave a Review for a Student</button>
              </div>
            </section>

            <section className="py-20 px-4">
              <div className="grid md:grid-cols-3 gap-10">
                <div className="group p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="font-black text-xl mb-3 text-slate-800">Professional Quality</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">Every procedure is meticulously supervised by licensed dentists and university professors.</p>
                </div>
                <div className="group p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <User size={32} />
                  </div>
                  <h3 className="font-black text-xl mb-3 text-slate-800">Helping a Student</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">You help students complete mandatory clinical requirements to earn their Doctorate degree.</p>
                </div>
                <div className="group p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <MapPin size={32} />
                  </div>
                  <h3 className="font-black text-xl mb-3 text-slate-800">Direct Connect</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">No complex forms. Find a case, click a button, and chat with the student directly on Messenger.</p>
                </div>
              </div>
            </section>
          </div>
        )}
        
        {view === 'adminDash' && adminAuthenticated && (
          <div className="py-12 animate-fade-in">
            <button onClick={() => setView('landing')} className="flex items-center gap-2 text-slate-400 mb-8 font-black text-xs uppercase hover:text-slate-800"><ArrowLeft size={16}/> EXIT ADMIN PANEL</button>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Pending Verifications</h1>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2"><Clock size={14} className="text-amber-500"/> {pendingAccounts.length} students waiting for verification</p>
              </div>
              <button onClick={fetchPendingAccounts} className="p-3 bg-white border rounded-2xl shadow-sm hover:bg-slate-50 transition"><Settings size={20} className="text-slate-400" /></button>
            </div>
            
            <div className="grid gap-6">
              {pendingAccounts.map(acc => (
                <div key={acc.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex gap-6 items-center flex-1">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl overflow-hidden flex items-center justify-center text-blue-600">
                      {acc.avatar_url ? <img src={acc.avatar_url} className="w-full h-full object-cover" /> : acc.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">{acc.full_name}</h3>
                      <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{acc.school} • {acc.course}</p>
                      <p className="text-slate-400 text-xs mt-1">Institutional ID: {acc.student_number}</p>
                      <div className="flex gap-4 mt-3">
                        <a href={acc.fb_link} target="_blank" className="text-blue-600 flex items-center gap-1 font-bold text-xs hover:underline"><ExternalLink size={14}/> Messenger Profile</a>
                        {acc.id_url && <a href={acc.id_url} target="_blank" className="text-amber-600 flex items-center gap-1 font-bold text-xs hover:underline"><ImageIcon size={14}/> View ID Upload</a>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => approveAccount(acc.id)} className="flex-1 md:flex-none bg-green-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:bg-green-600 transition active:scale-95"><UserCheck size={18}/> APPROVE & EMAIL</button>
                    <button className="flex-1 md:flex-none bg-red-50 text-red-500 px-8 py-4 rounded-2xl font-black hover:bg-red-500 hover:text-white transition active:scale-95"><Trash2 size={18}/> REJECT</button>
                  </div>
                </div>
              ))}
              {pendingAccounts.length === 0 && (
                <div className="text-center py-20 bg-white border-4 border-dashed border-slate-50 rounded-[56px]">
                  <CheckCircle size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 font-black uppercase tracking-widest">No pending applications.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-[48px] border shadow-sm animate-fade-in">
            <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest text-slate-800">Student Login</h2>
            <div className="space-y-4">
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><input type="email" id="l-email" placeholder="Institutional Email" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" /></div>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><input type="password" id="l-pass" placeholder="Password" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" /></div>
              <button onClick={() => handleLogin(document.getElementById('l-email').value, document.getElementById('l-pass').value)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase tracking-widest mt-4 hover:bg-blue-700 transition">Login</button>
              <div className="flex flex-col gap-3 mt-4 text-center">
                <button onClick={() => setView('forgotPassword')} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Forgot Password?</button>
                <button onClick={() => setView('choice')} className="text-slate-400 font-bold text-xs uppercase tracking-widest">New student? Apply here</button>
              </div>
            </div>
          </div>
        )}

        {view === 'forgotPassword' && (
          <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-[48px] border shadow-sm animate-fade-in">
            <button onClick={() => setView('login')} className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase mb-8 hover:text-slate-800"><ArrowLeft size={14}/> Back to Login</button>
            <h2 className="text-2xl font-black text-center mb-4 uppercase tracking-widest text-slate-800">Reset Access</h2>
            <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">Enter your institutional email. We will send you a recovery link.</p>
            <div className="space-y-4">
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><input type="email" id="f-email" placeholder="Email Address" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" /></div>
              <button onClick={() => handleForgotPassword(document.getElementById('f-email').value)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg uppercase tracking-widest mt-4 hover:bg-slate-800 transition">Send Reset Link</button>
            </div>
          </div>
        )}

        {view === 'choice' && (
          <div className="max-w-md mx-auto mt-16 text-center animate-fade-in">
            <h2 className="text-3xl font-black mb-8 text-slate-800">Tell us who you are</h2>
            <div className="grid gap-6">
              <button onClick={() => setView('studentWarning')} className="group p-8 bg-white border-2 border-slate-200 rounded-[40px] hover:border-blue-500 hover:shadow-xl transition-all text-left flex items-center justify-between">
                <div><h3 className="font-bold text-xl text-slate-800 mb-1">I am a Student</h3><p className="text-slate-500 text-sm">Post requirements to find patients</p></div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><ChevronRight /></div>
              </button>
              <button onClick={() => setView('marketplace')} className="group p-8 bg-white border-2 border-slate-200 rounded-[40px] hover:border-blue-500 hover:shadow-xl transition-all text-left flex items-center justify-between">
                <div><h3 className="font-bold text-xl text-slate-800 mb-1">I am a Patient</h3><p className="text-slate-500 text-sm">Find accessible dental services</p></div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><ChevronRight /></div>
              </button>
            </div>
          </div>
        )}
        
        {view === 'studentWarning' && (
          <div className="max-w-xl mx-auto mt-16 text-center animate-fade-in">
            <div className="bg-white p-12 rounded-[56px] border shadow-2xl">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={48} />
              </div>
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Dental Students Only</h2>
              <p className="text-slate-500 mb-10 leading-relaxed font-bold">Registration requires university verification. If you are seeking dental treatment, please use the Marketplace view instead.</p>
              <div className="flex flex-col gap-4">
                <button onClick={() => setView('signup')} className="bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 uppercase tracking-widest shadow-xl">Apply for Access</button>
                <button onClick={() => setView('marketplace')} className="bg-blue-50 text-blue-600 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm">I'm looking for care</button>
              </div>
            </div>
          </div>
        )}
        
        {view === 'signup' && (
          <div className="max-w-xl mx-auto mt-12 bg-white p-10 rounded-[56px] border shadow-sm animate-fade-in pb-20">
            <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-[0.2em] text-slate-800">Student Application</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-3xl mb-4">
                 <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1"><ShieldCheck size={14} /> Verification Process</h5>
                 <p className="text-[11px] text-blue-800 leading-relaxed">Your account will be manually reviewed by an admin. Once approved, you will receive an email confirmation and can start posting cases.</p>
              </div>
              <input type="text" id="s-name" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" id="s-school" placeholder="School" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
                <input type="text" id="s-course" placeholder="Course (e.g. DMD)" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" id="s-id" placeholder="Student ID #" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
                <input type="email" id="s-email" placeholder="Institutional Email" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
              </div>
              <input type="text" id="s-fb" placeholder="Facebook Profile Link" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
              <input type="text" id="s-phone" placeholder="Contact Number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
              <input type="password" id="s-pass" placeholder="Create Password" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-500" />
              
              {/* RESTORED: ID & Picture Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div 
                  onClick={() => document.getElementById('id-upload-input').click()}
                  className={`border-2 border-dashed p-6 rounded-3xl text-center cursor-pointer transition group ${idFile ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <input type="file" id="id-upload-input" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setIdFile, setIdPreview)} />
                  {idPreview ? <img src={idPreview} className="w-12 h-12 object-cover rounded-lg mx-auto mb-2" /> : <Upload className="text-slate-300 group-hover:text-blue-500 mb-2 mx-auto" size={24} />}
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${idFile ? 'text-green-600' : 'text-slate-400'}`}>
                    {idFile ? 'ID Uploaded' : 'Student ID (Uniform Shot)'}
                  </p>
                </div>
                
                <div 
                  onClick={() => document.getElementById('profile-upload-input').click()}
                  className={`border-2 border-dashed p-6 rounded-3xl text-center cursor-pointer transition group ${profileFile ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <input type="file" id="profile-upload-input" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setProfileFile, setProfilePreview)} />
                  {profilePreview ? <img src={profilePreview} className="w-12 h-12 object-cover rounded-lg mx-auto mb-2" /> : <Camera className="text-slate-300 group-hover:text-blue-500 mb-2 mx-auto" size={24} />}
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${profileFile ? 'text-green-600' : 'text-slate-400'}`}>
                    {profileFile ? 'Photo Selected' : 'Current Profile Photo'}
                  </p>
                </div>
              </div>

              <button onClick={() => handleSignUp({
                fullName: document.getElementById('s-name').value,
                school: document.getElementById('s-school').value,
                course: document.getElementById('s-course').value,
                studentNumber: document.getElementById('s-id').value,
                email: document.getElementById('s-email').value,
                fbLink: document.getElementById('s-fb').value,
                contactNumber: document.getElementById('s-phone').value,
                password: document.getElementById('s-pass').value
              })} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl uppercase tracking-widest mt-6 hover:bg-blue-700 transition">Submit Application</button>
            </div>
          </div>
        )}
        
        {view === 'marketplace' && (
          <div className="py-12 animate-fade-in">
            <h1 className="text-3xl font-black mb-2">Available Slots</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Supervised Clinical Requirements</p>
            <div className="relative mb-12 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition" size={20}/>
              <input type="text" id="m-search" className="w-full pl-14 p-5 bg-white border rounded-[28px] font-medium shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition" placeholder="Search by treatment or campus location..." />
            </div>
            <div className="grid gap-6">
              {cases.map(c => (
                <div key={c.id} onClick={() => { setSelectedCase(c); setView('caseDetail'); }} className="bg-white p-6 rounded-[40px] border flex flex-col sm:flex-row justify-between items-center group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all gap-6">
                  <div className="flex gap-6 items-center w-full">
                    <div className="w-24 h-24 bg-slate-50 rounded-[32px] overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center text-blue-600 font-black text-2xl uppercase">
                      {c.treatment.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-black group-hover:text-blue-600 transition">{c.treatment}</h3>
                        <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">FREE</span>
                      </div>
                      <p className="text-slate-500 font-bold text-sm flex items-center gap-1.5 mt-1"><MapPin size={16} className="text-blue-400"/> {c.location}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.profiles?.full_name} • {c.profiles?.school}</span>
                        {c.reviews?.length > 0 && <span className="text-amber-500 font-black text-xs flex items-center gap-1"><Star size={12} fill="currentColor"/> {c.reviews.length} REVIEW(S)</span>}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-200 group-hover:text-blue-600 transition hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {view === 'caseDetail' && selectedCase && (
          <div className="py-12 max-w-2xl mx-auto animate-fade-in pb-32">
            <button onClick={() => setView('marketplace')} className="flex items-center gap-2 text-slate-400 mb-8 font-black text-xs tracking-widest uppercase hover:text-slate-800"><ArrowLeft size={16}/> Back to Marketplace</button>
            <div className="bg-white rounded-[56px] border shadow-sm overflow-hidden p-10">
              <h1 className="text-4xl font-black mb-4 leading-tight">{selectedCase.treatment}</h1>
              <p className="text-slate-500 font-bold mb-10 text-lg">Managed by <span className="text-blue-600">{selectedCase.profiles?.full_name}</span></p>
              
              {selectedCase.selected_teeth?.length > 0 && (
                <div className="mb-10">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Target Teeth (FDI)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.selected_teeth.map(t => <span key={t} className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border border-blue-100 shadow-sm">{t}</span>)}
                  </div>
                </div>
              )}

              <div className="space-y-6 mb-12">
                <div className="flex gap-5 items-start"><div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0"><MapPin className="text-blue-500" size={24}/></div><div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Clinic Site</p><p className="font-bold text-slate-700 text-lg">{selectedCase.location}</p></div></div>
                <div className="flex gap-5 items-start"><div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0"><Info className="text-blue-500" size={24}/></div><div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Description</p><p className="font-medium text-slate-600 leading-relaxed">{selectedCase.description}</p></div></div>
              </div>
              
              <div className="bg-slate-900 text-white p-8 rounded-[40px] mb-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                 <h4 className="font-black text-xl mb-3 flex items-center gap-3"><ShieldCheck size={22} className="text-blue-400"/> Patient Warning</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">This is a <span className="text-white font-bold">teaching clinic environment</span>. Procedures are free because they help students graduate. Expect longer appointment times as faculty check every step.</p>
              </div>
              
              <a href={selectedCase.profiles?.fb_link || '#'} target="_blank" className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-3">CONNECT VIA MESSENGER <MessageCircle size={24}/></a>
              <button onClick={() => setShowReviewModal(true)} className="w-full text-blue-600 font-black uppercase text-xs tracking-widest mt-8 hover:underline">Write a Review</button>
            </div>
            
            {/* Reviews Section */}
            {selectedCase.reviews?.length > 0 && (
              <div className="mt-12 bg-white rounded-[48px] border p-12 shadow-sm">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Award className="text-blue-600" /> Verified Reviews</h3>
                <div className="space-y-8">
                  {selectedCase.reviews.map((r, i) => (
                    <div key={i} className="border-b last:border-0 pb-6">
                      <p className="font-black text-slate-800 mb-1">{r.patient_name}</p>
                      <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_,star) => <Star key={star} size={14} fill={star < r.rating ? "#f59e0b" : "none"} className={star < r.rating ? "text-amber-500" : "text-slate-200"}/>)}</div>
                      <p className="text-slate-500 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {view === 'studentDash' && profile && (
          <div className="py-16 animate-fade-in pb-32">
            {!profile.is_approved && (
              <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] mb-8 flex items-center gap-6">
                <Clock className="text-amber-500 shrink-0" size={32} />
                <div>
                  <h4 className="font-black text-amber-800 uppercase tracking-widest text-sm">Account Pending Verification</h4>
                  <p className="text-amber-700 text-sm font-medium">An admin is currently reviewing your ID and campus credentials. Once verified, you will receive an email confirmation and can start posting requirements.</p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-[56px] border p-10 sm:p-16 shadow-sm mb-12">
              <div className="flex flex-col sm:flex-row items-center gap-12">
                <div className="w-44 h-44 bg-blue-600 rounded-[44px] flex items-center justify-center text-white text-6xl font-black shadow-2xl ring-8 ring-slate-50">{profile.full_name?.charAt(0)}</div>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-4xl font-black text-slate-800 leading-tight uppercase tracking-tight mb-2">{profile.full_name}</h1>
                  <p className="text-slate-400 font-bold uppercase text-xs mb-8 tracking-widest flex items-center justify-center sm:justify-start gap-2"><GraduationCap size={16}/> {profile.course} • {profile.school}</p>
                  <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 inline-block text-left">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">Clinic Review Code</p>
                    <p className="text-3xl font-black text-blue-800 tracking-[0.2em]">{profile.verification_code}</p>
                  </div>
                </div>
                <button 
                  disabled={!profile.is_approved}
                  onClick={() => setIsPostModalOpen(true)} 
                  className={`px-10 py-5 rounded-[28px] font-black shadow-xl transition flex items-center gap-3 active:scale-95 uppercase tracking-widest text-sm ${profile.is_approved ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  <Plus size={24}/> New Post
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <div className="bg-white p-8 rounded-[40px] border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Cases</p>
                <p className="text-4xl font-black text-slate-800">{cases.filter(c => c.student_id === user.id).length}</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reviews</p>
                <p className="text-4xl font-black text-slate-800">{cases.filter(c => c.student_id === user.id).reduce((acc, c) => acc + (c.reviews?.length || 0), 0)}</p>
              </div>
            </div>

            <h3 className="font-black text-xl uppercase tracking-widest mb-6 px-4">Manage Posts</h3>
            <div className="grid gap-4 px-2">
              {cases.filter(c => c.student_id === user.id).map(c => (
                <div key={c.id} className="bg-white p-6 rounded-[32px] border flex justify-between items-center group shadow-sm hover:shadow-md transition">
                  <div className="flex gap-5 items-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black tracking-tighter">DMD</div>
                    <div><h4 className="font-black text-lg group-hover:text-blue-600 transition">{c.treatment}</h4><p className="text-slate-400 text-sm font-bold flex items-center gap-1"><MapPin size={14}/> {c.location}</p></div>
                  </div>
                  <button onClick={async () => { 
                    setIsProcessing(true);
                    await supabase.from('cases').delete().eq('id', c.id); 
                    fetchCases(); 
                    setIsProcessing(false);
                  }} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition"><Trash2 size={20}/></button>
                </div>
              ))}
              {cases.filter(c => c.student_id === user.id).length === 0 && <div className="text-center py-20 bg-white border-4 border-dashed border-slate-50 rounded-[56px] text-slate-300 font-bold uppercase tracking-[0.2em]">No clinical requirements posted</div>}
            </div>
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 text-center animate-scale-up">
            <ShieldAlert size={48} className="mx-auto text-blue-600 mb-6" />
            <h3 className="text-3xl font-black mb-2">Admin Terminal</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-8">Authorization Required</p>
            <input type="password" id="admin-pin" placeholder="PIN" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-center tracking-[1em] mb-4" />
            <button onClick={() => {
              if (document.getElementById('admin-pin').value === ADMIN_PIN) {
                setAdminAuthenticated(true);
                setShowAdminLogin(false);
                setView('adminDash');
                fetchPendingAccounts();
              } else {
                alert("ACCESS DENIED");
                setShowAdminLogin(false);
              }
            }} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition">Unlock Controls</button>
            <button onClick={() => setShowAdminLogin(false)} className="mt-4 text-slate-300 text-xs font-bold uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      {/* Extended Footer */}
      <footer className="py-20 text-center border-t border-slate-200 bg-white mt-12">
        <div className="inline-flex flex-col items-center gap-4">
           <div className="bg-blue-50 p-3 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform" onClick={handleLogoClick}>
             <Stethoscope size={32} className="text-blue-600" />
           </div>
           <span className="text-2xl font-black text-slate-300 uppercase tracking-tighter">DentaMatch</span>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed px-4">Philippines' Leading Educational Dental Marketplace</p>
        </div>
      </footer>

      {/* Post Modal */}
      <PostModal onOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onAdd={handlePostCase} />

      {/* Review Modal */}
      {globalReviewSearch && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          {!foundCase ? (
            <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl animate-scale-up text-center relative">
               <button onClick={() => setGlobalReviewSearch(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition"><X /></button>
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><SearchCheck size={36} /></div>
               <h3 className="text-2xl font-black mb-3">Find Your Student</h3>
               <p className="text-slate-500 text-sm mb-8 leading-relaxed">Enter the verification code given to you by the student dentist after your session.</p>
               <div className="space-y-4">
                  <input type="text" placeholder="CODE (e.g. ALEX-1234)" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-center tracking-widest uppercase focus:ring-2 focus:ring-blue-500" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
                  <button onClick={handleSearchByCode} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Locate Student</button>
               </div>
            </div>
          ) : (
            <ReviewEntryModal studentName={foundCase.profiles?.full_name} verificationCode={foundCase.profiles?.verification_code} onClose={() => { setGlobalReviewSearch(false); setFoundCase(null); setSearchCode(''); }} onSubmit={(rev) => handleAddReview(foundCase.id, rev)} />
          )}
        </div>
      )}

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

function PostModal({ onOpen, onClose, onAdd }) {
  const [f, setF] = useState({ treatment: TREATMENT_TYPES[0], location: '', description: '', selectedTeeth: [] });
  if (!onOpen) return null;

  const toggleTooth = (num) => {
    setF(prev => ({
      ...prev,
      selectedTeeth: prev.selectedTeeth.includes(num)
        ? prev.selectedTeeth.filter(t => t !== num)
        : [...prev.selectedTeeth, num]
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[56px] my-8 overflow-hidden animate-scale-up shadow-2xl">
        <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
          <div><h2 className="text-2xl font-black">Post Case</h2><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">New Clinical Requirement</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full"><X/></button>
        </div>
        <div className="p-10 space-y-10 h-[60vh] overflow-y-auto scrollbar-hide">
           <div>
             <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Treatment Type</label>
             <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500" value={f.treatment} onChange={x => setF({...f, treatment: x.target.value})}>
               {TREATMENT_TYPES.map(t => <option key={t}>{t}</option>)}
             </select>
           </div>
           
           <div>
             <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Target Teeth (FDI Notation)</label>
             <ToothChart selectedTeeth={f.selectedTeeth} onToggleTooth={toggleTooth} />
           </div>

           <div>
             <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Clinic Site & Details</label>
             <input type="text" id="p-location" placeholder="Clinic Location (e.g. Manila Campus)" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none mb-4 focus:ring-2 focus:ring-blue-500" onChange={x => setF({...f, location: x.target.value})}/>
             <textarea id="p-desc" placeholder="Requirements (e.g. molar extraction, cleaning...)" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none rows-4 focus:ring-2 focus:ring-blue-500" rows="4" onChange={x => setF({...f, description: x.target.value})}></textarea>
           </div>
        </div>
        <div className="p-10 pt-0">
          <button onClick={() => onAdd(f)} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-blue-700 transition uppercase tracking-widest text-sm">Publish Clinical Post</button>
        </div>
      </div>
    </div>
  );
}

function ReviewEntryModal({ studentName, verificationCode, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', rating: 5, comment: '', code: '' });
  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[120] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl animate-scale-up relative">
        <h3 className="text-2xl font-black mb-2 text-slate-900">Review {studentName}</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Clinical Verification Required</p>
        <div className="space-y-5">
          <input type="text" placeholder="Your Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500" onChange={e => setForm({...form, name: e.target.value})} />
          <div className="flex gap-2 justify-center">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setForm({...form, rating: s})}><Star size={28} fill={s <= form.rating ? "#f59e0b" : "none"} className={s <= form.rating ? "text-amber-500" : "text-slate-200"}/></button>)}</div>
          <input type="text" placeholder="Verification Code" className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-center uppercase tracking-widest border-2 border-blue-100 focus:ring-2 focus:ring-blue-400" onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
          <textarea placeholder="Tell us about your experience..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none rows-3 focus:ring-2 focus:ring-blue-500" rows="3" onChange={e => setForm({...form, comment: e.target.value})}></textarea>
          <div className="flex gap-3 pt-4"><button onClick={() => { if(form.code !== verificationCode) return alert("Wrong code!"); onSubmit(form); }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">SUBMIT REVIEW</button><button onClick={onClose} className="px-6 font-bold text-slate-300">CANCEL</button></div>
        </div>
      </div>
    </div>
  );
}