import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Award, Eye, EyeOff, KeyRound, Mail, User, Sparkles } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
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
      const res = await api.post('/auth/register', { full_name: fullName, email, password });
      login(res.data.access_token, res.data.user_name);
      navigate('/dashboard');
    } catch (error) {
      setErr(error.response?.data?.detail || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.78fr] lg:gap-16">
      <section className="rise-in hidden lg:block">
        <p className="eyebrow mb-4 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Start with one question</p>
        <h1 className="display-heading max-w-xl text-[3.6rem] text-[#edf2ed]">Your next step starts <span className="text-[#a7e2c6]">here.</span></h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-[#9aa9a0]">Create your space to practice, review your answers, and build momentum over time.</p>
        <div className="mt-9 flex items-center gap-3 border-t border-white/[0.08] pt-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-100/10 bg-emerald-100/[0.05] text-[#a7e2c6]"><Award className="h-5 w-5" /></span>
          <p className="text-xs leading-5 text-[#849188]">One account keeps your practice history in one place.</p>
        </div>
      </section>

      <section className="surface-card rise-in stagger-1 mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="mb-7">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-emerald-100/10 bg-emerald-100/[0.05] text-[#a7e2c6]"><Sparkles className="h-5 w-5" /></span>
          <p className="eyebrow mb-2">A fresh start</p>
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#edf2ed]">Create your account.</h2>
          <p className="mt-2 text-sm text-[#8f9e94]">Your next practice session is just ahead.</p>
        </div>

        {err && <div role="alert" className="status-message mb-5">{err}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="field-label">Your name</label>
            <div className="relative">
              <User aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8c82]" />
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                className="field-control has-leading-icon"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="register-email" className="field-label">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8c82]" />
              <input
                id="register-email"
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
            <label htmlFor="register-password" className="field-label">Password</label>
            <div className="relative">
              <KeyRound aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8c82]" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="field-control has-leading-icon has-trailing-action"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#829087] transition hover:text-[#dce5dd]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="button-primary mt-2 w-full">
            {loading ? 'Creating your account…' : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 border-t border-white/[0.07] pt-5 text-center text-xs text-[#89978e]">
          Already have an account? <Link to="/login" className="ml-1 font-semibold text-[#a7e2c6] no-underline hover:text-white">Sign in</Link>
        </p>
      </section>
    </div>
  );
}