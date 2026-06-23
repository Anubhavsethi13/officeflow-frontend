import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Lock,
  MessagesSquare,
  MonitorCheck,
  Play,
  RotateCcw,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useHiringStore } from "@/lib/hiring-store";
import { downloadOMRSheetPdf } from "@/lib/omr-pdf";
import {
  ASSESSMENT_PAPER,
  DEPARTMENT_PAPERS,
  EXAM_PAPERS,
  getDepartmentPaper,
  getPaperById,
  scorePaper,
  type ExamDepartment,
  type ExamOptionLabel,
  type ExamPaper,
} from "@/lib/hiring-exam-papers";
import type { HiringStage } from "@/lib/hiring-data";

export const Route = createFileRoute("/hiring/exam-center")({
  head: () => ({ meta: [{ title: "Exam Center - Hiring" }] }),
  component: ExamCenter,
});

type AttemptResult = ReturnType<typeof scorePaper> & {
  submittedAt: string;
  answers: Record<number, ExamOptionLabel>;
  notes: Record<number, string>;
};

const makeAttemptKey = (candidateId: string, paperId: string) => `${candidateId}:${paperId}`;

const formatSubmittedAt = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const departmentOptions = DEPARTMENT_PAPERS.map((paper) => paper.department);

function ExamCenter() {
  const { candidates, addAnswerSheet, updateCandidateStage } = useHiringStore();
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id ?? "");
  const [selectedDepartment, setSelectedDepartment] = useState<ExamDepartment>("Software");
  const [activePaperId, setActivePaperId] = useState(ASSESSMENT_PAPER.id);
  const [runningPaperId, setRunningPaperId] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answersByAttempt, setAnswersByAttempt] = useState<Record<string, Record<number, ExamOptionLabel>>>({});
  const [notesByAttempt, setNotesByAttempt] = useState<Record<string, Record<number, string>>>({});
  const [resultsByAttempt, setResultsByAttempt] = useState<Record<string, AttemptResult>>({});
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);

  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId);
  const departmentPaper = useMemo(() => getDepartmentPaper(selectedDepartment), [selectedDepartment]);
  const activePaper = getPaperById(activePaperId) ?? ASSESSMENT_PAPER;
  const activeAttemptKey = makeAttemptKey(selectedCandidateId, activePaper.id);
  const activeAnswers = answersByAttempt[activeAttemptKey] ?? {};
  const activeNotes = notesByAttempt[activeAttemptKey] ?? {};
  const activeResult = resultsByAttempt[activeAttemptKey];
  const activeQuestion = activePaper.questions[questionIndex] ?? activePaper.questions[0];
  const isRunning = runningPaperId === activePaper.id && !activeResult;

  const assessmentResult = resultsByAttempt[makeAttemptKey(selectedCandidateId, ASSESSMENT_PAPER.id)];
  const departmentResult = resultsByAttempt[makeAttemptKey(selectedCandidateId, departmentPaper.id)];
  const canOpenDepartmentPaper = Boolean(assessmentResult);
  const canStartPractical = Boolean(departmentResult);
  const answeredOptionQuestions = activePaper.questions.filter((question) =>
    question.options.length > 0 && activeAnswers[question.number]
  ).length;
  const optionQuestionCount = activePaper.questions.filter((question) => question.options.length > 0).length;
  const unansweredCount = optionQuestionCount - answeredOptionQuestions;
  const scoredCount = activePaper.questions.filter((question) => question.scored).length;

  useEffect(() => {
    if (!selectedCandidateId && candidates.length > 0) setSelectedCandidateId(candidates[0].id);
  }, [candidates, selectedCandidateId]);

  useEffect(() => {
    if (!selectedCandidate) return;
    const matchingPaper = getDepartmentPaper(selectedCandidate.department);
    setSelectedDepartment(matchingPaper.department);
  }, [selectedCandidate]);

  useEffect(() => {
    setQuestionIndex(0);
  }, [activePaperId, selectedCandidateId]);

  const startPaper = (paper: ExamPaper) => {
    if (!selectedCandidateId) return;
    if (paper.round === "department" && !assessmentResult) return;

    setActivePaperId(paper.id);
    setRunningPaperId(paper.id);
    setQuestionIndex(0);

    if (paper.round === "assessment") {
      updateCandidateStage(selectedCandidateId, "Aptitude Test");
    }
  };

  const setAnswer = (questionNumber: number, answer: ExamOptionLabel) => {
    setAnswersByAttempt((state) => ({
      ...state,
      [activeAttemptKey]: {
        ...(state[activeAttemptKey] ?? {}),
        [questionNumber]: answer,
      },
    }));
  };

  const setNote = (questionNumber: number, note: string) => {
    setNotesByAttempt((state) => ({
      ...state,
      [activeAttemptKey]: {
        ...(state[activeAttemptKey] ?? {}),
        [questionNumber]: note,
      },
    }));
  };

  const resetAttempt = () => {
    setAnswersByAttempt((state) => ({ ...state, [activeAttemptKey]: {} }));
    setNotesByAttempt((state) => ({ ...state, [activeAttemptKey]: {} }));
    setResultsByAttempt((state) => {
      const next = { ...state };
      delete next[activeAttemptKey];
      return next;
    });
    setRunningPaperId(activePaper.id);
    setQuestionIndex(0);
  };

  const submitPaper = () => {
    if (!selectedCandidateId || unansweredCount > 0) return;

    const score = scorePaper(activePaper, activeAnswers);
    const submittedAt = new Date().toISOString();
    setResultsByAttempt((state) => ({
      ...state,
      [activeAttemptKey]: {
        ...score,
        answers: activeAnswers,
        notes: activeNotes,
        submittedAt,
      },
    }));
    setRunningPaperId(null);

    addAnswerSheet({
      code: `AS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      candidateId: selectedCandidateId,
      testType: activePaper.title,
      status: score.total > 0 ? "Auto-checked" : "Needs Review",
      marks: `${score.correct}/${score.total}`,
      confidence: score.total > 0 ? 100 : 0,
    });

    if (activePaper.round === "department") {
      updateCandidateStage(selectedCandidateId, "Practical Test");
    }
  };

  const moveCandidateToStage = (stage: HiringStage) => {
    if (!selectedCandidateId) return;
    updateCandidateStage(selectedCandidateId, stage);
  };

  const copyPublicExamLink = async () => {
    const publicPath = "/public/hiring-exam";
    const link = typeof window === "undefined" ? publicPath : `${window.location.origin}${publicPath}`;
    await navigator.clipboard.writeText(link);
    setPublicLinkCopied(true);
    window.setTimeout(() => setPublicLinkCopied(false), 1800);
  };

  return (
    <HiringLayout title="Exam Center" subtitle="Assessment, department paper, practical test, interview, and HR discussion">
      <div className="grid xl:grid-cols-[320px_1fr] gap-5">
        <aside className="space-y-4">
          <div className="glass-strong rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Users className="size-4 text-[color:var(--secondary)]" />
              Candidate
            </div>
            <label className="block text-xs text-muted-foreground">
              Name
              <select
                value={selectedCandidateId}
                onChange={(event) => setSelectedCandidateId(event.target.value)}
                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground focus:outline-none focus:border-pink-500"
              >
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id} className="bg-slate-900">
                    {candidate.name} ({candidate.jobTitle})
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs text-muted-foreground">
              Department paper
              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value as ExamDepartment)}
                className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground focus:outline-none focus:border-pink-500"
              >
                {departmentOptions.map((department) => (
                  <option key={department} value={department} className="bg-slate-900">
                    {department}
                  </option>
                ))}
              </select>
            </label>
            {selectedCandidate && (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">{selectedCandidate.candidateCode}</div>
                <div className="mt-1">{selectedCandidate.department} - {selectedCandidate.stage}</div>
              </div>
            )}
          </div>

          <div className="glass-strong rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Trophy className="size-4 text-amber-300" />
              Round Flow
            </div>
            <RoundStep
              number="1"
              title="Assessment Paper"
              detail={`${ASSESSMENT_PAPER.totalMarks} marks - first for every candidate`}
              done={Boolean(assessmentResult)}
              active={isRunning && activePaper.id === ASSESSMENT_PAPER.id}
              locked={false}
              actionLabel={assessmentResult ? "View" : "Start"}
              onAction={() => assessmentResult ? setActivePaperId(ASSESSMENT_PAPER.id) : startPaper(ASSESSMENT_PAPER)}
            />
            <RoundStep
              number="2"
              title="Department Paper"
              detail={`${departmentPaper.department} - ${departmentPaper.totalMarks} marks`}
              done={Boolean(departmentResult)}
              active={isRunning && activePaper.id === departmentPaper.id}
              locked={!canOpenDepartmentPaper}
              actionLabel={departmentResult ? "View" : "Start"}
              onAction={() => departmentResult ? setActivePaperId(departmentPaper.id) : startPaper(departmentPaper)}
            />
            <RoundStep
              number="3"
              title="Practical System Test"
              detail="Hands-on task after department paper"
              done={selectedCandidate?.stage === "Face-to-Face Interview" || selectedCandidate?.stage === "Final HR Round"}
              active={selectedCandidate?.stage === "Practical Test"}
              locked={!canStartPractical}
              actionLabel="Start"
              onAction={() => moveCandidateToStage("Practical Test")}
            />
            <RoundStep
              number="4"
              title="Face-to-Face Interview"
              detail="Technical or manager discussion"
              done={selectedCandidate?.stage === "Final HR Round"}
              active={selectedCandidate?.stage === "Face-to-Face Interview"}
              locked={!canStartPractical}
              actionLabel="Move"
              onAction={() => moveCandidateToStage("Face-to-Face Interview")}
            />
            <RoundStep
              number="5"
              title="HR Discussion"
              detail="Final HR round"
              done={selectedCandidate?.stage === "Final HR Round"}
              active={selectedCandidate?.stage === "Final HR Round"}
              locked={!canStartPractical}
              actionLabel="Move"
              onAction={() => moveCandidateToStage("Final HR Round")}
            />
          </div>
        </aside>

        <div className="space-y-5 min-w-0">
          <div className="glass-strong rounded-2xl border border-white/10 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-display font-semibold">
                  <Link2 className="size-4 text-[color:var(--secondary)]" />
                  Public candidate exam link
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Candidates verify by registered name and email, then take round 1 and round 2 without logging in.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/public/hiring-exam"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs hover:bg-white/10"
                >
                  <ExternalLink className="size-3" /> Open
                </a>
                <button
                  onClick={copyPublicExamLink}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 text-xs font-medium text-white"
                >
                  <Copy className="size-3" /> {publicLinkCopied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
            <Stat label="Assessment" value={assessmentResult ? `${assessmentResult.correct}/${assessmentResult.total}` : "Pending"} icon={FileText} />
            <Stat label="Department" value={departmentResult ? `${departmentResult.correct}/${departmentResult.total}` : departmentPaper.department} icon={UserCheck} />
            <Stat label="Current Stage" value={selectedCandidate?.stage ?? "-"} icon={MonitorCheck} />
            <Stat label="Papers Loaded" value={`${EXAM_PAPERS.length}`} icon={CheckCircle2} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <PaperCard
              paper={ASSESSMENT_PAPER}
              result={assessmentResult}
              locked={false}
              active={activePaper.id === ASSESSMENT_PAPER.id}
              onStart={() => startPaper(ASSESSMENT_PAPER)}
              onView={() => setActivePaperId(ASSESSMENT_PAPER.id)}
            />
            <PaperCard
              paper={departmentPaper}
              result={departmentResult}
              locked={!canOpenDepartmentPaper}
              active={activePaper.id === departmentPaper.id}
              onStart={() => startPaper(departmentPaper)}
              onView={() => setActivePaperId(departmentPaper.id)}
            />
          </div>

          <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-display text-lg font-semibold">{activePaper.title}</div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-muted-foreground">
                    {activePaper.department}
                  </span>
                  {activeResult && (
                    <span className={`rounded-full px-2 py-1 text-[10px] ${activeResult.passed ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                      {activeResult.passed ? "Passed" : "Below pass mark"}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{activePaper.description}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadOMRSheetPdf(activePaper.title, activePaper.questions.length)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs hover:bg-white/10"
                >
                  <Download className="size-3" /> OMR
                </button>
                {activeResult ? (
                  <button
                    onClick={resetAttempt}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs hover:bg-white/10"
                  >
                    <RotateCcw className="size-3" /> Retake
                  </button>
                ) : (
                  <button
                    onClick={() => startPaper(activePaper)}
                    disabled={activePaper.round === "department" && !canOpenDepartmentPaper}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play className="size-3" /> {isRunning ? "Running" : "Start"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_220px]">
              <div className="p-4 lg:p-6">
                {!isRunning && !activeResult ? (
                  <EmptyTestState paper={activePaper} locked={activePaper.round === "department" && !canOpenDepartmentPaper} />
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {activePaper.durationMinutes} min</span>
                      <span>{scoredCount} scored marks</span>
                      <span>{answeredOptionQuestions}/{optionQuestionCount} answered</span>
                      {activeResult && <span>Submitted {formatSubmittedAt(activeResult.submittedAt)}</span>}
                    </div>

                    {activeResult && (
                      <div className="grid sm:grid-cols-3 gap-3">
                        <ResultTile label="Score" value={`${activeResult.correct}/${activeResult.total}`} />
                        <ResultTile label="Percentage" value={`${activeResult.percentage}%`} />
                        <ResultTile label="Pass Mark" value={`${activePaper.passingMarks}/${activePaper.totalMarks}`} />
                      </div>
                    )}

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Question {activeQuestion.number} of {activePaper.questions.length}
                          </div>
                          {activeQuestion.section && (
                            <div className="mt-1 text-xs text-[color:var(--secondary)]">{activeQuestion.section}</div>
                          )}
                        </div>
                        {!activeQuestion.scored && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] text-amber-300">Interview review</span>
                        )}
                      </div>
                      <div className="mt-4 text-base font-medium leading-relaxed">{activeQuestion.text}</div>

                      {activeQuestion.options.length > 0 && (
                        <div className="mt-4 grid gap-2">
                          {activeQuestion.options.map((option) => {
                            const selected = activeAnswers[activeQuestion.number] === option.label;
                            const isCorrect = activeResult && activeQuestion.correctAnswer === option.label;
                            const isWrongSelection = activeResult && selected && activeQuestion.correctAnswer !== option.label;
                            return (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() => !activeResult && setAnswer(activeQuestion.number, option.label)}
                                className={`flex min-h-11 items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                                  selected ? "border-cyan-400 bg-cyan-500/15 text-cyan-100" : "border-white/10 bg-black/15 hover:bg-white/10"
                                } ${isCorrect ? "border-emerald-400 bg-emerald-500/15 text-emerald-100" : ""} ${isWrongSelection ? "border-rose-400 bg-rose-500/15 text-rose-100" : ""}`}
                              >
                                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-current text-xs font-semibold">{option.label}</span>
                                <span>{option.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {(activeQuestion.requiresReason || activeQuestion.options.length === 0) && (
                        <label className="mt-4 block text-xs text-muted-foreground">
                          Candidate note
                          <textarea
                            value={activeNotes[activeQuestion.number] ?? ""}
                            onChange={(event) => setNote(activeQuestion.number, event.target.value)}
                            disabled={Boolean(activeResult)}
                            rows={4}
                            className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-foreground focus:outline-none focus:border-pink-500 disabled:opacity-75"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
                        disabled={questionIndex === 0}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="size-4" /> Previous
                      </button>
                      <div className="flex flex-wrap gap-2">
                        {!activeResult && unansweredCount > 0 && (
                          <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500/10 px-3 text-xs text-amber-200">
                            <AlertCircle className="size-4" /> {unansweredCount} unanswered
                          </span>
                        )}
                        {!activeResult && (
                          <button
                            onClick={submitPaper}
                            disabled={unansweredCount > 0}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-4" /> Submit Paper
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setQuestionIndex((index) => Math.min(activePaper.questions.length - 1, index + 1))}
                        disabled={questionIndex === activePaper.questions.length - 1}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 p-4 lg:border-l lg:border-t-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Questions</div>
                <div className="mt-3 grid grid-cols-5 gap-2 lg:grid-cols-4">
                  {activePaper.questions.map((question, index) => {
                    const selected = questionIndex === index;
                    const answered = Boolean(activeAnswers[question.number]) || Boolean(activeNotes[question.number]);
                    return (
                      <button
                        key={question.number}
                        onClick={() => setQuestionIndex(index)}
                        className={`h-8 rounded-lg text-xs tabular-nums ${
                          selected ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white" : answered ? "bg-emerald-500/15 text-emerald-200" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        {question.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <ActionRoundCard
              icon={MonitorCheck}
              title="Practical System Test"
              detail="Unlocked after the department paper is submitted."
              disabled={!canStartPractical}
              onClick={() => moveCandidateToStage("Practical Test")}
            />
            <ActionRoundCard
              icon={MessagesSquare}
              title="Face-to-Face Interview"
              detail="Use the scored papers and personality notes for discussion."
              disabled={!canStartPractical}
              onClick={() => moveCandidateToStage("Face-to-Face Interview")}
            />
            <ActionRoundCard
              icon={UserCheck}
              title="HR Discussion"
              detail="Final HR conversation after interview feedback."
              disabled={!canStartPractical}
              onClick={() => moveCandidateToStage("Final HR Round")}
            />
          </div>
        </div>
      </div>
    </HiringLayout>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
  return (
    <div className="glass-strong rounded-2xl border border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 truncate font-display text-lg font-semibold">{value}</div>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
          <Icon className="size-4 text-[color:var(--secondary)]" />
        </div>
      </div>
    </div>
  );
}

function PaperCard({
  paper,
  result,
  locked,
  active,
  onStart,
  onView,
}: {
  paper: ExamPaper;
  result?: AttemptResult;
  locked: boolean;
  active: boolean;
  onStart: () => void;
  onView: () => void;
}) {
  return (
    <div className={`glass-strong rounded-2xl border p-4 ${active ? "border-cyan-400/50" : "border-white/10"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{paper.department} - {paper.mode}</div>
          <div className="mt-1 font-display font-semibold">{paper.title}</div>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
          {locked ? <Lock className="size-4 text-white" /> : <FileText className="size-4 text-white" />}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {paper.durationMinutes} min</span>
        <span>{paper.questions.length} questions</span>
        <span>{paper.totalMarks} marks</span>
        <span>Pass {paper.passingMarks}</span>
      </div>
      {result && (
        <div className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          Scored {result.correct}/{result.total} at {result.percentage}%
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={result ? onView : onStart}
          disabled={locked}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {locked ? <Lock className="size-3" /> : <Play className="size-3" />}
          {result ? "Review" : locked ? "Locked" : "Start"}
        </button>
        <button
          onClick={onView}
          className="h-9 rounded-lg border border-white/10 px-3 text-xs hover:bg-white/10"
        >
          View
        </button>
      </div>
    </div>
  );
}

function RoundStep({
  number,
  title,
  detail,
  done,
  active,
  locked,
  actionLabel,
  onAction,
}: {
  number: string;
  title: string;
  detail: string;
  done: boolean;
  active: boolean;
  locked: boolean;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-3 flex gap-3 last:mb-0">
      <div className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
        done ? "bg-emerald-500 text-white" : active ? "bg-cyan-500 text-white" : locked ? "bg-white/5 text-muted-foreground" : "bg-white/10 text-foreground"
      }`}>
        {done ? <CheckCircle2 className="size-4" /> : number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium">{title}</div>
          <button
            onClick={onAction}
            disabled={locked}
            className="h-7 shrink-0 rounded-lg border border-white/10 px-2 text-[10px] text-muted-foreground hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {locked ? "Locked" : actionLabel}
          </button>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}

function EmptyTestState({ paper, locked }: { paper: ExamPaper; locked: boolean }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-white/10">
          {locked ? <Lock className="size-5 text-muted-foreground" /> : <FileText className="size-5 text-[color:var(--secondary)]" />}
        </div>
        <div className="mt-3 font-display font-semibold">{locked ? "Assessment Required" : paper.title}</div>
        <div className="mt-1 max-w-md text-sm text-muted-foreground">
          {locked ? "Submit the assessment paper before starting the department paper." : `${paper.questions.length} questions loaded from the supplied Word paper.`}
        </div>
      </div>
    </div>
  );
}

function ActionRoundCard({
  icon: Icon,
  title,
  detail,
  disabled,
  onClick,
}: {
  icon: typeof MonitorCheck;
  title: string;
  detail: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glass-strong rounded-2xl border border-white/10 p-4 text-left transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
        <Icon className="size-4 text-white" />
      </div>
      <div className="mt-3 font-display font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </button>
  );
}
