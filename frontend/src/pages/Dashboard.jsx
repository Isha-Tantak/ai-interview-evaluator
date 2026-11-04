import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowUpRight, Award, BarChart3, BrainCircuit, Database,
  MessageSquareText, Play, RotateCw, Sparkles, Target
} from 'lucide-react';

const metrics = [
  { key: 'total_sessions', label: 'Practice sessions', icon: BarChart3, suffix: '', note: 'interviews started' },
  { key: 'total_evaluations', label: 'Answers reviewed', icon: MessageSquareText, suffix: '', note: 'responses evaluated' },
  { key: 'average_score', label: 'Average score', icon: Target, suffix: '/10', note: 'across your answers' },
  { key: 'cache_hit_rate', label: 'Instant reviews', icon: Database, suffix: '%', note: 'semantic cache rate' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () => {
    setLoading(true);
    setError('');
    api.get('/interview/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setError('We couldn’t load your overview. Check your connection and try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="page-enter space-y-8 sm:space-y-10">
      <section className="relative isolate overflow-hidden rounded-[1.6rem] border border-emerald-100/10 bg-[#17241d] px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,.2)] sm:px-10 sm:py-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full border border-emerald-100/[0.08] bg-[radial-gradient(circle_at_center,rgba(142,207,169,.11),rgba(142,207,169,0)_68%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-12 top-1/2 -z-10 hidden h-48 w-48 -translate-y-1/2 rounded-full border border-emerald-100/[0.08] sm:block" />
        <div className="relative max-w-2xl rise-in">
          <div className="eyebrow mb-4 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Your interview practice space</div>
          <h1 className="display-heading max-w-xl text-[2.4rem] text-[#f0f3ef] sm:text-[3.55rem]">
            Get sharper with <span className="text-[#a7e2c6]">every answer.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#a2b0a7] sm:text-base">
            Practice at your pace. Get thoughtful feedback. Turn each interview into a clearer next step.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/interview" className="button-primary">
              <Play className="h-4 w-4 fill-current" /> Start a practice session
            </Link>
            <Link to="/history" className="button-secondary">
              View your history <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-3 border-t border-white/[0.08] pt-5 sm:absolute sm:bottom-8 sm:right-10 sm:mt-0 sm:border-0 sm:pt-0">
          <div className="flex -space-x-2">
            <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#17241d] bg-[#2b4436] text-[#b8ebd0]"><BrainCircuit className="h-3.5 w-3.5" /></span>
            <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#17241d] bg-[#49362d] text-[#f0b09a]"><Award className="h-3.5 w-3.5" /></span>
          </div>
          <span className="text-xs text-[#9baaa0]">Private practice, powered by AI</span>
        </div>
      </section>

      <section aria-labelledby="progress-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">The bigger picture</p>
            <h2 id="progress-heading" className="text-lg font-semibold tracking-[-0.03em] text-[#e7eee8]">Your progress</h2>
          </div>
          {loading && <span className="text-xs text-[#839188]">Updating…</span>}
        </div>

        {error && (
          <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200/10 bg-rose-200/[0.04] px-4 py-3 text-sm text-[#f0b09a]">
            <span>{error}</span>
            <button type="button" onClick={loadStats} className="inline-flex items-center gap-2 text-xs font-semibold hover:text-white">
              <RotateCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ key, label, icon: Icon, suffix, note }, index) => (
            <article key={key} className={`surface-card rise-in stagger-${index + 1} group p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-100/20`}>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-medium text-[#a1afa6]">{label}</span>
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-100/[0.08] bg-emerald-100/[0.04] text-[#a7e2c6] transition group-hover:bg-emerald-100/[0.09]">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[2rem] font-semibold tracking-[-0.06em] text-[#eef3ee]">
                  {loading && !stats ? '—' : (stats?.[key] ?? 0)}
                </span>
                <span className="text-sm font-medium text-[#91a097]">{suffix}</span>
              </div>
              <p className="mt-1 text-[0.7rem] text-[#78877d]">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b soft-divider px-5 py-5 sm:px-6">
          <div>
            <p className="eyebrow mb-1">Keep your momentum</p>
            <h2 className="text-base font-semibold tracking-[-0.025em] text-[#e7eee8]">Recent sessions</h2>
          </div>
          <Link to="/history" className="inline-flex items-center gap-1 text-xs font-semibold text-[#a7e2c6] no-underline transition hover:text-white">
            All history <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {stats?.recent_sessions?.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {stats.recent_sessions.map((session, index) => (
              <div key={session.id} className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#22342a] text-xs font-bold text-[#a7e2c6]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#e2eae3]">{session.role}</p>
                    <p className="mt-1 text-xs text-[#85938a]">{session.difficulty} <span className="px-1 text-[#58675d]">·</span> {session.date}</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-5 sm:gap-8">
                  <div className="text-right">
                    <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[#75847a]">Questions</p>
                    <p className="mt-1 text-sm font-semibold text-[#dce5dd]">{session.question_count}</p>
                  </div>
                  <div className="min-w-[4rem] text-right">
                    <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[#75847a]">Average</p>
                    <p className="mt-1 text-sm font-semibold text-[#a7e2c6]">{session.average_score}<span className="ml-1 text-[0.68rem] font-medium text-[#7d8b81]">/10</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-[#9aada0]">
              <BarChart3 className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-[#dce5dd]">Your first session starts here.</p>
            <p className="mt-1 text-xs text-[#85938a]">Complete a practice interview and your progress will show up here.</p>
            <Link to="/interview" className="button-secondary mt-5">Start practicing <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-[#85938a]">Loading your recent sessions…</div>
        )}
      </section>
    </div>
  );
}
