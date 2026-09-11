import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Terminal,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';

type AuthMode = 'signin' | 'register' | 'forgot_password';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');

  // Sign In form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SENIOR ANALYST' | 'ANALYST'>('SENIOR ANALYST');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAccountType, setRegAccountType] = useState<'PERSONAL' | 'ORGANIZATION'>('ORGANIZATION');
  const [regOrgName, setRegOrgName] = useState('');
  const [regDepartment, setRegDepartment] = useState('Blockchain Cybercrimes Unit');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation helper
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Handle Sign In submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    try {
      setLoading(true);

      // Convert role display format to API format
      const normalizedRole = selectedRole === 'SENIOR ANALYST' ? 'SENIOR_ANALYST' : selectedRole;

      const user = await login(email.trim(), password, normalizedRole);

      // Remember workstation preference
      if (rememberWorkstation) {
        localStorage.setItem('tracex_remember_workstation', 'true');
      } else {
        localStorage.removeItem('tracex_remember_workstation');
      }

      // Check for redirect location
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!regEmail.trim() || !isValidEmail(regEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (regAccountType === 'ORGANIZATION' && !regOrgName.trim()) {
      setErrorMessage('Please enter your organization or department name.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword,
        accountType: regAccountType,
        orgName: regAccountType === 'ORGANIZATION' ? regOrgName.trim() : undefined,
        department: regDepartment.trim()
      });

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotSuccessMessage(null);

    if (!forgotEmail.trim() || !isValidEmail(forgotEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill demo credentials
  const fillDemoAccount = (
    role: 'ADMIN' | 'SENIOR ANALYST' | 'ANALYST',
    demoEmail: string,
    demoPass = 'TraceX@2026'
  ) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSelectedRole(role);
    setErrorMessage(null);
  };

  return (
    <div
      className="min-h-screen w-full bg-[#050507] text-[#ececee] flex flex-col justify-between selection:bg-white selection:text-black font-sans relative overflow-x-hidden"
      id="tracex-auth-page"
    >
      {/* Background Subtle Gradient & Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full px-6 py-5 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-md flex items-center justify-between z-10">
        <Link
          to="/"
          className="flex items-center space-x-2.5 group cursor-pointer"
          title="Return to TRACE-X Landing Page"
        >
          <span className="text-white text-base font-light group-hover:rotate-45 transition-transform duration-300">
            ✳
          </span>
          <span className="text-xs font-mono tracking-[0.35em] text-white font-semibold">
            TRACE X
          </span>
          <span className="hidden sm:inline-block text-[9px] font-mono tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded ml-2">
            SECURE ACCESS GATEWAY
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center space-x-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to TRACE-X</span>
        </Link>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4 z-10">
        <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#09090d]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono font-bold text-lg mb-3 shadow-inner">
              TX
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white uppercase">
              {mode === 'signin' && 'Sign in to TRACE-X'}
              {mode === 'register' && 'Request Enterprise Access'}
              {mode === 'forgot_password' && 'Password Recovery'}
            </h1>
            <p className="text-xs font-mono text-neutral-400 mt-1 uppercase tracking-wider">
              Blockchain Forensic Intelligence
            </p>
          </div>

          {/* Navigation Tabs (Sign In / Register) */}
          {mode !== 'forgot_password' && (
            <div className="flex border-b border-neutral-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-mono uppercase tracking-wider border-b-2 font-medium transition-all ${
                  mode === 'signin'
                    ? 'border-white text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-mono uppercase tracking-wider border-b-2 font-medium transition-all ${
                  mode === 'register'
                    ? 'border-white text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Alert Box */}
          {errorMessage && (
            <div
              className="mb-5 p-3.5 rounded-lg border border-red-900/60 bg-red-950/40 text-red-300 text-xs flex items-start space-x-2.5"
              id="auth-error-alert"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-mono">
                <span className="font-semibold block uppercase text-[10px] tracking-wider text-red-400">
                  Authentication Refused
                </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Success Alert Box */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-mono">{successMessage}</div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 1. SIGN IN FORM */}
          {/* ==================================================== */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4" id="tracex-signin-form">
              {/* Email Address Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="analyst@agency.gov or user@domain.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    id="signin-email-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setForgotEmail(email);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    id="signin-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selector Dropdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                    Role Clearance <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Backend Verified
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white text-xs font-mono appearance-none focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all pr-9 cursor-pointer"
                    id="signin-role-select"
                  >
                    <option value="ADMIN">ADMIN — Full Command & Employee Control</option>
                    <option value="SENIOR ANALYST">SENIOR ANALYST — Deep Tracing & Investigation Lead</option>
                    <option value="ANALYST">ANALYST — Graph Tracing & Threat Monitoring</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 leading-tight">
                  Security notice: Selected role must correspond to your database credentials. Mismatches will be logged and rejected.
                </p>
              </div>

              {/* Remember Workstation Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="remember-workstation-toggle"
                  checked={rememberWorkstation}
                  onChange={e => setRememberWorkstation(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white"
                />
                <label
                  htmlFor="remember-workstation-toggle"
                  className="text-xs font-mono text-neutral-400 cursor-pointer select-none"
                >
                  Remember this workstation for 30 days
                </label>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 cursor-pointer"
                id="signin-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Quick Demo Credentials Assistant */}
              <div className="mt-6 pt-5 border-t border-neutral-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold flex items-center space-x-1">
                    <Terminal className="w-3 h-3 text-neutral-400" />
                    <span>Quick-Fill Demo Credentials</span>
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500">
                    Password: TraceX@2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('ADMIN', 'admin@trace-x.local')}
                    className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-mono font-bold text-white group-hover:text-cyan-400">
                      ADMIN
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 truncate">
                      admin@trace-x.local
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('SENIOR ANALYST', 'senior@trace-x.local')}
                    className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-mono font-bold text-white group-hover:text-cyan-400">
                      SR. ANALYST
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 truncate">
                      senior@trace-x.local
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('ANALYST', 'analyst@trace-x.local')}
                    className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-mono font-bold text-white group-hover:text-cyan-400">
                      ANALYST
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 truncate">
                      analyst@trace-x.local
                    </div>
                  </button>
                </div>

                {/* Secondary row with Disabled test account and Role Mismatch test note */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>Suspended account test:</span>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('ANALYST', 'disabled@trace-x.local')}
                    className="text-neutral-400 hover:text-red-400 transition-colors underline cursor-pointer"
                  >
                    disabled@trace-x.local
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* 2. REGISTRATION (CREATE ACCOUNT) FORM */}
          {/* ==================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5" id="tracex-register-form">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Work Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="name@organization.io"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>

              {/* Account Type Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegAccountType('ORGANIZATION')}
                    className={`p-2 rounded-lg border text-left text-xs font-mono transition-all ${
                      regAccountType === 'ORGANIZATION'
                        ? 'border-white bg-white/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-[11px]">ENTERPRISE UNIT</div>
                    <div className="text-[9px] text-neutral-400">Team / Agency Org</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegAccountType('PERSONAL')}
                    className={`p-2 rounded-lg border text-left text-xs font-mono transition-all ${
                      regAccountType === 'PERSONAL'
                        ? 'border-white bg-white/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-[11px]">INVESTIGATOR</div>
                    <div className="text-[9px] text-neutral-400">Solo Researcher</div>
                  </button>
                </div>
              </div>

              {/* Organization Name (if Enterprise) */}
              {regAccountType === 'ORGANIZATION' && (
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                    Organization Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regOrgName}
                      onChange={e => setRegOrgName(e.target.value)}
                      placeholder="Vanguard Cyber Intelligence Unit"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Password (min. 8 characters) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* 3. FORGOT PASSWORD FLOW */}
          {/* ==================================================== */}
          {mode === 'forgot_password' && (
            <div className="space-y-4" id="tracex-forgot-password-form">
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Enter your registered TRACE-X email address. A cryptographic password reset authorization link will be dispatched.
              </p>

              {forgotSuccessMessage ? (
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{forgotSuccessMessage}</span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    For local evaluation workspaces, default passwords match <span className="text-white font-bold">TraceX@2026</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setForgotSuccessMessage(null);
                    }}
                    className="w-full mt-2 py-2 rounded-lg bg-white text-black text-xs font-mono font-bold uppercase"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="analyst@agency.gov"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <span>Dispatching...</span> : <span>Send Reset Instructions</span>}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMessage(null);
                      }}
                      className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                    >
                      ← Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 / SHA-256 AUDITED</span>
            </span>
            <span>RESTRICTED ACCESS</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-white/[0.04] text-center text-[11px] font-mono text-neutral-500 z-10">
        TRACE-X Forensic Intelligence Platform &bull; Enterprise Cryptographic Suite
      </footer>
    </div>
  );
};
