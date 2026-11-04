import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Award, Eye, EyeOff, KeyRound, Mail, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user_name);
      navigate('/dashboard');
    } catch (error) {
      setErr(error.response?.data?.detail || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.78fr] lg:gap-16">
      <section className="rise-in hidden lg:block">
        <p className="eyebrow mb-4 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> A quieter kind of prep</p>
        <h1 className="display-heading max-w-xl text-[3.6rem] text-[#edf2ed]">Practice with <span className="text-[#a7e2c6]">purpose.</span></h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-[#9aa9a0]">Build confidence one question at a time. Your AI interviewer gives you space to think and feedback that helps you grow.</p>
        <div className="mt-9 flex items-center gap-3 border-t border-white/[0.08] pt-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-100/10 bg-emerald-100/[0.05] text-[#a7e2c6]"><Award className="h-5 w-5" /></span>
          <p className="text-xs leading-5 text-[#849188]">Your practice history stays connected to your account.</p>
        </div>
      </section>

      <section className="surface-card rise-in stagger-1 mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="mb-7">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-emerald-100/10 bg-emerald-100/[0.05] text-[#a7e2c6]"><Sparkles className="h-5 w-5" /></span>
          <p className="eyebrow mb-2">Welcome back</p>
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#edf2ed]">Pick up where you left off.</h2>
          <p className="mt-2 text-sm text-[#8f9e94]">Sign in to continue your interview practice.</p>
        </div>

        {err && <div role="alert" className="status-message mb-5">{err}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="field-label">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8c82]" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                className="field-control has-leading-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="field-label">Password</label>
            <div className="relative">
              <KeyRound aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8c82]" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="field-control has-leading-icon has-trailing-action"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#829087] transition hover:text-[#dce5dd]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="button-primary mt-2 w-full">
            {loading ? 'Signing in…' : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 border-t border-white/[0.07] pt-5 text-center text-xs text-[#89978e]">
          New to JudgeAI? <Link to="/register" className="ml-1 font-semibold text-[#a7e2c6] no-underline hover:text-white">Create an account</Link>
        </p>
      </section>
    </div>
  );
}