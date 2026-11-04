import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AlertTriangle, Calendar, ChevronDown, ChevronUp, Clock3, Trash2, Zap } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingSession, setDeletingSession] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/interview/history')
      .then(res => setHistory(res.data))
      .catch(() => setError('Could not load interview history. Please refresh the page to try again.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  const deleteSession = async () => {
    if (!sessionToDelete) return;
    const sessionId = sessionToDelete.session_id;
    setDeletingSession(sessionId);
    setError('');
    try {
      await api.delete(`/interview/sessions/${sessionId}`);
      setHistory((previous) => previous.filter((session) => session.session_id !== sessionId));
      setExpandedSession((previous) => previous === sessionId ? null : previous);
      setSessionToDelete(null);
    } catch (deleteError) {
      setError(deleteError.response?.data?.detail || 'Could not delete this session. Please try again.');
    } finally {
      setDeletingSession(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-[#89978e]" role="status">
        <span className="flex items-center gap-1.5"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></span>
        Loading your interview history…
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Your interview journey</p>
          <h1 className="display-heading text-3xl text-[#edf2ed] sm:text-4xl">History, at a glance.</h1>
          <p className="mt-2 text-sm text-[#95a39a]">Revisit the details, keep the lessons, and clear sessions you no longer need.</p>
        </div>
        <div className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-[#aebbb2]">
          {history.length} {history.length === 1 ? 'session' : 'sessions'}
        </div>
      </div>
      {error && <p role="alert" className="status-message">{error}</p>}
      {history.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-[#a7e2c6]">
            <Clock3 className="h-5 w-5" />
          </span>
          <h2 className="text-base font-semibold text-[#e2eae3]">{error ? 'History is unavailable' : 'Your story starts with one session.'}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#89978e]">{error ? 'Try refreshing this page in a moment.' : 'After your first practice interview, you’ll find your questions and feedback here.'}</p>
          {!error && <Link to="/interview" className="button-primary mt-5">Start a practice session</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((s, index) => (
            <article key={s.session_id} className={`surface-card rise-in stagger-${Math.min(index + 1, 4)} overflow-hidden transition duration-300 hover:border-emerald-100/20`}>
              <div className="flex items-center justify-between gap-3 p-4 sm:gap-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => toggleExpand(s.session_id)}
                  aria-expanded={expandedSession === s.session_id}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-100/[0.08] bg-emerald-100/[0.04] text-[#a7e2c6]">
                    <span className="text-xs font-bold">{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#e7eee8] sm:text-base">{s.role}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-[#8e9b92]">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(s.created_at).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span><span>{s.difficulty}</span>
                      <span aria-hidden="true">·</span><span>{s.evaluations.length} {s.evaluations.length === 1 ? 'answer' : 'answers'} reviewed</span>
                    </span>
                  </span>
                  <span className={`hidden text-[#7b8a80] transition-transform sm:block ${expandedSession === s.session_id ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionToDelete(s)}
                    disabled={deletingSession !== null}
                    aria-label={`Delete ${s.role} interview session`}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200/[0.08] text-[#bd9184] transition hover:border-rose-200/20 hover:bg-rose-200/[0.05] hover:text-[#f0a48f] disabled:opacity-50 sm:flex sm:w-auto sm:gap-1.5 sm:px-3"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden text-xs sm:inline">{deletingSession === s.session_id ? 'Deleting…' : 'Delete'}</span>
                  </button>
                  <button type="button" onClick={() => toggleExpand(s.session_id)} aria-label={expandedSession === s.session_id ? 'Collapse session' : 'Expand session'} className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.07] text-[#96a49b] sm:hidden">
                    {expandedSession === s.session_id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {expandedSession === s.session_id && (
                <div className="page-enter space-y-4 border-t soft-divider bg-black/[0.08] p-4 sm:p-5">
                  {s.evaluations.length === 0 && (
                    <p className="rounded-xl border border-white/[0.06] p-4 text-sm text-[#89978e]">No answers have been evaluated in this session.</p>
                  )}
                  {s.evaluations.map((e, idx) => (
                    <div key={e.id} className="rounded-xl border border-white/[0.07] bg-[#19241f] p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#a7e2c6]">Question {String(idx + 1).padStart(2, '0')}</span>
                        <div className="flex items-center gap-2">
                          {e.from_cache && (
                            <span className="flex items-center gap-1 rounded-full border border-amber-100/10 bg-amber-100/[0.04] px-2 py-1 text-[0.65rem] text-[#e4c28f]">
                              <Zap className="h-3 w-3" /> Instant review
                            </span>
                          )}
                          <span className="rounded-lg border border-emerald-100/10 bg-emerald-100/[0.05] px-2.5 py-1 text-xs font-semibold text-[#a7e2c6]">{e.score}<span className="ml-1 text-[#839188]">/10</span></span>
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium leading-6 text-[#e0e8e1]">{e.question}</p>
                      <div className="mt-3 rounded-lg border border-white/[0.05] bg-black/[0.13] p-3.5">
                        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#829087]">Your answer</p>
                        <p className="whitespace-pre-wrap text-xs leading-5 text-[#b3c0b7]">{e.candidate_answer}</p>
                      </div>
                      <div className="mt-3 rounded-lg border border-white/[0.05] p-3.5">
                        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#a7e2c6]">Feedback</p>
                        <p className="text-xs leading-5 text-[#aebbb2]">{e.feedback}</p>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                        <div>
                          <h3 className="mb-2 font-semibold text-[#a7e2c6]">What worked</h3>
                          {e.strengths?.length
                            ? <ul className="space-y-1.5 text-[#aebbb2]">{e.strengths.map((item, index) => <li key={index} className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8bca9f]" />{item}</li>)}</ul>
                            : <p className="text-[#829087]">No strengths recorded.</p>}
                        </div>
                        <div>
                          <h3 className="mb-2 font-semibold text-[#e4c28f]">Try next time</h3>
                          {e.improvements?.length
                            ? <ul className="space-y-1.5 text-[#bdb5a5]">{e.improvements.map((item, index) => <li key={index} className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#d2aa70]" />{item}</li>)}</ul>
                            : <p className="text-[#918a7c]">No improvements recorded.</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {sessionToDelete && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/65 p-4 backdrop-blur-sm" onMouseDown={(event) => {
          if (event.target === event.currentTarget && deletingSession === null) setSessionToDelete(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="delete-title" className="page-enter surface-card w-full max-w-md p-6 shadow-2xl sm:p-7">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-rose-200/10 bg-rose-200/[0.05] text-[#f0a48f]"><AlertTriangle className="h-5 w-5" /></span>
            <h2 id="delete-title" className="text-lg font-semibold text-[#edf2ed]">Delete this session?</h2>
            <p className="mt-2 text-sm leading-6 text-[#9aa9a0]">“{sessionToDelete.role}” and its {sessionToDelete.evaluations.length} {sessionToDelete.evaluations.length === 1 ? 'evaluation' : 'evaluations'} will be permanently removed.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setSessionToDelete(null)} disabled={deletingSession !== null} className="button-secondary">Keep session</button>
              <button type="button" onClick={deleteSession} disabled={deletingSession !== null} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-200/15 bg-rose-200/[0.08] px-4 text-sm font-semibold text-[#f0a48f] transition hover:bg-rose-200/[0.13] disabled:opacity-50">
                <Trash2 className="h-4 w-4" /> {deletingSession !== null ? 'Deleting…' : 'Delete session'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}