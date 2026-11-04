import React, { useState } from 'react';
import api from '../services/api';
import {
  ArrowRight, Award, Check, ChevronRight, CircleHelp, Lightbulb,
  LoaderCircle, MessageSquareText, Play, Send, Sparkles, Target, Zap
} from 'lucide-react';

const getErrorMessage = (error, fallback) => error.response?.data?.detail || fallback;

function ScoreCard({ label, value, primary = false }) {
  return (
    <div className={`rounded-xl border p-4 ${primary ? 'border-emerald-100/15 bg-emerald-100/[0.07]' : 'border-white/[0.07] bg-white/[0.025]'}`}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#91a097]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.05em] ${primary ? 'text-[#a7e2c6]' : 'text-[#e7eee8]'}`}>
        {value}<span className="ml-1 text-xs font-medium text-[#748279]">/10</span>
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={`h-full rounded-full ${primary ? 'bg-[#a7e2c6]' : 'bg-[#789f87]'}`} style={{ width: `${Math.min(100, Math.max(0, Number(value) * 10))}%` }} />
      </div>
    </div>
  );
}

export default function InterviewSession() {
  const [role, setRole] = useState('Senior Python Backend Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [pastQuestions, setPastQuestions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async (event) => {
    event.preventDefault();
    if (starting) return;
    setStarting(true);
    setError('');
    try {
      const response = await api.post('/interview/sessions', { role: role.trim(), difficulty });
      setSessionId(response.data.session_id);
      await fetchNextQuestion(response.data.session_id, []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not start the interview. Please try again.'));
    } finally {
      setStarting(false);
    }
  };

  const fetchNextQuestion = async (activeSessionId = sessionId, previousQuestions = pastQuestions) => {
    if (!activeSessionId || loadingQuestion || evaluating) return;
    setLoadingQuestion(true);
    setError('');
    try {
      const response = await api.post('/interview/question', {
        session_id: activeSessionId,
        previous_questions: previousQuestions,
      });
      const question = response.data.question?.trim();
      if (!question) throw new Error('The question service returned an empty question.');
      setCurrentQuestion(question);
      setPastQuestions((previous) => (
        previous.some((item) => item.toLowerCase() === question.toLowerCase())
          ? previous
          : [...previous, question]
      ));
      setCandidateAnswer('');
      setEvaluation(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, requestError.message || 'Could not generate the next question. Please try again.'));
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || !currentQuestion || evaluating || loadingQuestion) return;
    setEvaluating(true);
    setError('');
    try {
      const response = await api.post('/interview/evaluate', {
        session_id: sessionId,
        question: currentQuestion,
        candidate_answer: candidateAnswer,
      });
      setEvaluation(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Answer analysis failed. Your response is still here; please try again.'));
    } finally {
      setEvaluating(false);
    }
  };

  const handleSkipQuestion = () => {
    if (candidateAnswer.trim() && !window.confirm('Skip this question and discard your current answer?')) return;
    fetchNextQuestion();
  };

  if (!sessionId) {
    return (
      <div className="page-enter mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.88fr] lg:gap-16">
        <section className="rise-in">
          <p className="eyebrow mb-4 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Practice, not pressure</p>
          <h1 className="display-heading max-w-xl text-[2.6rem] text-[#edf2ed] sm:text-[3.6rem]">
            Make your next answer your <span className="text-[#a7e2c6]">best one.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[#9aa9a0] sm:text-base">
            Set the role and level. We’ll bring the questions; you bring your thinking. Get useful, specific feedback after every answer.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: CircleHelp, title: 'Questions tailored to your role', detail: 'Keep each practice relevant to the work you want.' },
              { icon: Target, title: 'Feedback you can act on', detail: 'See what landed and where to go deeper.' },
              { icon: MessageSquareText, title: 'Your pace, your practice', detail: 'Skip a question or take a moment to think.' },
            ].map(({ icon: Icon, title, detail }, index) => (
              <div key={title} className={`rise-in stagger-${index + 1} flex gap-3`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-100/[0.08] bg-emerald-100/[0.04] text-[#a7e2c6]"><Icon className="h-4 w-4" /></span>
                <div><p className="text-sm font-semibold text-[#dce5dd]">{title}</p><p className="mt-0.5 text-xs leading-5 text-[#849188]">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card rise-in stagger-2 p-6 sm:p-8">
          <div className="mb-7">
            <p className="eyebrow mb-2">Start a session</p>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#edf2ed]">Make it yours.</h2>
            <p className="mt-1.5 text-sm text-[#8e9d93]">Choose a role and a challenge level.</p>
          </div>
          <form onSubmit={handleStartSession} className="space-y-5">
            <div>
              <label htmlFor="target-role" className="field-label">Target role</label>
              <input
                id="target-role"
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="field-control"
                placeholder="e.g. Product designer"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="difficulty" className="field-label">Difficulty</label>
              <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="field-control">
                <option value="Junior">Junior</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Senior">Senior</option>
                <option value="Staff / Lead">Staff / Lead</option>
              </select>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#e6bd83]" />
              <p className="text-xs leading-5 text-[#9ba89f]">There’s no timer. Take the space you need to explain your reasoning.</p>
            </div>
            {error && <p role="alert" className="status-message">{error}</p>}
            <button type="submit" disabled={starting || !role.trim()} className="button-primary w-full">
              {starting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Setting up your interview…</> : <>Begin interview <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Practice session <span className="mx-1.5 text-[#57665d]">/</span> {difficulty}</p>
          <h1 className="text-2xl font-semibold tracking-[-0.045em] text-[#edf2ed] sm:text-3xl">{role}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-100/[0.1] bg-emerald-100/[0.04] px-3 py-1.5 text-xs font-medium text-[#a7e2c6]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a7e2c6]" /> In progress
        </div>
      </header>

      <div className="flex items-center gap-2" aria-label={`Question ${Math.max(1, pastQuestions.length)}`}>
        <span className="text-xs font-semibold text-[#a7e2c6]">QUESTION {String(Math.max(1, pastQuestions.length)).padStart(2, '0')}</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs text-[#748279]">One question at a time</span>
      </div>

      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(142,207,169,.1),transparent_68%)]" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#93a198]">
            <CircleHelp className="h-4 w-4 text-[#a7e2c6]" /> Your question
          </div>
          {currentQuestion
            ? <p className="max-w-3xl text-xl font-medium leading-[1.55] tracking-[-0.025em] text-[#eaf0ea] sm:text-[1.55rem]">{currentQuestion}</p>
            : <div className="flex items-center gap-3 py-4 text-sm text-[#94a198]"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /> Preparing your first question…</div>}
          {loadingQuestion && currentQuestion && (
            <p className="mt-4 flex items-center gap-2 text-xs text-[#829087]"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Finding your next question…</p>
          )}
        </div>
      </section>

      {error && <p role="alert" className="status-message">{error}</p>}

      {!evaluation && (
        <section className="surface-card p-5 sm:p-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <label htmlFor="candidate-answer" className="text-sm font-semibold text-[#e4ebe4]">Your answer</label>
              <p className="mt-1 text-xs text-[#849188]">Talk through your approach. Clear thinking matters more than perfect wording.</p>
            </div>
            <span className="shrink-0 text-[0.68rem] tabular-nums text-[#748279]">{candidateAnswer.length.toLocaleString()} / 12,000</span>
          </div>
          <textarea
            id="candidate-answer"
            rows={7}
            value={candidateAnswer}
            onChange={(event) => {
              setCandidateAnswer(event.target.value);
              if (error) setError('');
            }}
            disabled={loadingQuestion || evaluating || !currentQuestion}
            maxLength={12000}
            placeholder="Start with how you’d approach the problem…"
            className="field-control min-h-44 resize-y leading-6"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={handleSkipQuestion} disabled={loadingQuestion || evaluating} className="button-secondary">
              {loadingQuestion ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              {loadingQuestion ? 'Finding a question…' : currentQuestion ? 'Skip this question' : 'Retry question'}
            </button>
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={evaluating || loadingQuestion || !currentQuestion || !candidateAnswer.trim()}
              className="button-primary min-w-40"
            >
              {evaluating ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Reviewing…</> : <><Send className="h-4 w-4" /> Get feedback</>}
            </button>
          </div>
          {evaluating && <p className="mt-4 text-center text-xs text-[#89978e]">Giving your answer a thoughtful review. This can take a moment.</p>}
        </section>
      )}

      {evaluation && (
        <section className="page-enter surface-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b soft-divider px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-100/10 bg-emerald-100/[0.06] text-[#a7e2c6]"><Award className="h-5 w-5" /></span>
              <div><p className="eyebrow mb-1">Answer review</p><h2 className="text-base font-semibold text-[#e6ede7]">A moment to reflect</h2></div>
            </div>
            {evaluation.from_cache && <span className="flex items-center gap-1.5 rounded-full border border-amber-100/10 bg-amber-100/[0.04] px-2.5 py-1 text-[0.68rem] font-medium text-[#e4c28f]"><Zap className="h-3.5 w-3.5" /> Instant review</span>}
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <ScoreCard label="Overall" value={evaluation.score} primary />
              <ScoreCard label="Accuracy" value={evaluation.accuracy} />
              <ScoreCard label="Depth" value={evaluation.depth} />
              <ScoreCard label="Clarity" value={evaluation.clarity} />
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a7e2c6]"><Sparkles className="h-3.5 w-3.5" /> Thoughtful feedback</div>
              <p className="text-sm leading-6 text-[#c2cec5]">{evaluation.feedback}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-200/[0.1] bg-emerald-200/[0.035] p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#a7e2c6]"><Check className="h-4 w-4" /> What worked</h3>
                {evaluation.strengths?.length
                  ? <ul className="space-y-2">{evaluation.strengths.map((strength, index) => <li key={index} className="flex gap-2 text-sm leading-5 text-[#b8c8bd]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#8bca9f]" />{strength}</li>)}</ul>
                  : <p className="text-sm text-[#91a097]">Keep building on your approach.</p>}
              </div>
              <div className="rounded-xl border border-amber-100/[0.1] bg-amber-100/[0.025] p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#e4c28f]"><Lightbulb className="h-4 w-4" /> Try next time</h3>
                {evaluation.improvements?.length
                  ? <ul className="space-y-2">{evaluation.improvements.map((improvement, index) => <li key={index} className="flex gap-2 text-sm leading-5 text-[#c8c0ae]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#d2aa70]" />{improvement}</li>)}</ul>
                  : <p className="text-sm text-[#9b9586]">No specific improvements recorded.</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t soft-divider pt-5">
              <p className="text-xs text-[#859188]">Good practice is progress, not perfection.</p>
              <button type="button" onClick={() => fetchNextQuestion()} disabled={loadingQuestion} className="button-primary">
                {loadingQuestion ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <>Next question <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
