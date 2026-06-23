import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Lock,
  Mail,
  Play,
  ShieldCheck,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ASSESSMENT_PAPER, getDepartmentPaper, scorePaper, type ExamOptionLabel, type ExamPaper } from "@/lib/hiring-exam-papers";
import { useHiringStore, type PublicExamAttempt } from "@/lib/hiring-store";
import type { Candidate } from "@/lib/hiring-data";

export const Route = createFileRoute("/public/hiring-exam")({
  head: () => ({ meta: [{ title: "Public Hiring Exam - officeflow" }] }),
  component: PublicHiringExam,
});

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const formatSubmittedAt = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getAttempt = (attempts: PublicExamAttempt[], candidateId: string, paperId: string) =>
  attempts.find((attempt) => attempt.candidateId === candidateId && attempt.paperId === paperId);

function PublicHiringExam() {
  const { candidates, publicExamAttempts, submitPublicExamAttempt } = useHiringStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [identityError, setIdentityError] = useState("");
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ExamOptionLabel>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [finishedAttempt, setFinishedAttempt] = useState<PublicExamAttempt | null>(null);

  const departmentPaper = useMemo(
    () => getDepartmentPaper(candidate?.department ?? "Software"),
    [candidate?.department]
  );
  const assessmentAttempt = candidate ? getAttempt(publicExamAttempts, candidate.id, ASSESSMENT_PAPER.id) : undefined;
  const departmentAttempt = candidate ? getAttempt(publicExamAttempts, candidate.id, departmentPaper.id) : undefined;
  const currentAttempt = candidate && activePaper ? getAttempt(publicExamAttempts, candidate.id, activePaper.id) : undefined;
  const activeQuestion = activePaper?.questions[questionIndex];
  const optionQuestionCount = activePaper?.questions.filter((question) => question.options.length > 0).length ?? 0;
  const answeredOptionCount = activePaper?.questions.filter((question) =>
    question.options.length > 0 && answers[question.number]
  ).length ?? 0;
  const unansweredCount = optionQuestionCount - answeredOptionCount;
  const celebration = Boolean(finishedAttempt);

  useEffect(() => {
    if (!activePaper || finishedAttempt) return;
    setRemainingSeconds(activePaper.durationMinutes * 60);
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activePaper, finishedAttempt]);

  const verifyCandidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedName = String(formData.get("candidateName") ?? name);
    const submittedEmail = String(formData.get("candidateEmail") ?? email);
    const matchedCandidate = candidates.find(
      (item) => normalize(item.email) === normalize(submittedEmail) && normalize(item.name) === normalize(submittedName)
    );

    if (!matchedCandidate) {
      setCandidate(null);
      setIdentityError("No registered candidate matches this name and email.");
      return;
    }

    setName(submittedName);
    setEmail(submittedEmail);
    setCandidate(matchedCandidate);
    setIdentityError("");
    setActivePaper(null);
    setFinishedAttempt(null);
    setQuestionIndex(0);
    setAnswers({});
    setNotes({});
  };

  const startPaper = (paper: ExamPaper) => {
    if (!candidate) return;
    const attempt = getAttempt(publicExamAttempts, candidate.id, paper.id);
    if (attempt) {
      setFinishedAttempt(attempt);
      setActivePaper(null);
      return;
    }

    if (paper.round === "department" && !assessmentAttempt?.score.passed) return;

    setActivePaper(paper);
    setFinishedAttempt(null);
    setQuestionIndex(0);
    setAnswers({});
    setNotes({});
    setSubmitError("");
  };

  const submitPaper = () => {
    if (!candidate || !activePaper) return;
    if (currentAttempt) {
      setFinishedAttempt(currentAttempt);
      setActivePaper(null);
      return;
    }

    if (unansweredCount > 0) {
      setSubmitError(`${unansweredCount} answer${unansweredCount === 1 ? "" : "s"} still pending.`);
      return;
    }

    const score = scorePaper(activePaper, answers);
    const attempt = submitPublicExamAttempt({
      candidateId: candidate.id,
      paperId: activePaper.id,
      paperTitle: activePaper.title,
      round: activePaper.round,
      department: activePaper.department,
      answers,
      notes,
      score,
    });

    setFinishedAttempt(attempt);
    setActivePaper(null);
    setSubmitError("");
  };

  const resetIdentity = () => {
    setCandidate(null);
    setActivePaper(null);
    setFinishedAttempt(null);
    setQuestionIndex(0);
    setAnswers({});
    setNotes({});
    setSubmitError("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071214] text-white">
      <PublicExamScene celebration={celebration} />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(3,10,12,0.94),rgba(8,25,28,0.88)_48%,rgba(18,16,30,0.9))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.72)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.72)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex min-h-14 flex-wrap items-center gap-3 border-b border-white/10 py-3">
          <div className="grid size-10 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
            <ShieldCheck className="size-5 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold">officeflow Hiring Exam</div>
            <div className="text-xs text-slate-300">Public candidate assessment link</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <StatusChip icon={FileText} label="Assessment" done={Boolean(assessmentAttempt)} />
            <StatusChip icon={FileCheck} label="Department" done={Boolean(departmentAttempt)} />
          </div>
        </header>

        <div className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(19rem,24rem)_1fr]">
          <aside className="space-y-4">
            <section className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 font-display text-base font-semibold">
                <User className="size-4 text-amber-200" />
                Candidate Check
              </div>
              <form onSubmit={verifyCandidate} className="mt-4 space-y-3">
                <label className="block text-xs text-slate-300">
                  Full name
                  <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 focus-within:border-cyan-300/70">
                    <User className="size-4 text-slate-400" />
                    <input
                      name="candidateName"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="Registered candidate name"
                      required
                    />
                  </div>
                </label>
                <label className="block text-xs text-slate-300">
                  Email
                  <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 focus-within:border-cyan-300/70">
                    <Mail className="size-4 text-slate-400" />
                    <input
                      name="candidateEmail"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="name@example.com"
                      type="email"
                      required
                    />
                  </div>
                </label>
                {identityError && (
                  <div className="rounded-lg border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                    {identityError}
                  </div>
                )}
                <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                  <ShieldCheck className="size-4" />
                  Verify Candidate
                </button>
              </form>

              {candidate && (
                <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-3 text-xs text-emerald-50">
                  <div className="font-semibold">{candidate.name}</div>
                  <div className="mt-1 text-emerald-100/80">{candidate.candidateCode} · {candidate.department}</div>
                  <button
                    type="button"
                    onClick={resetIdentity}
                    className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-emerald-50 hover:bg-white/10"
                  >
                    <ArrowLeft className="size-3" />
                    Change candidate
                  </button>
                </div>
              )}
            </section>

            {candidate && (
              <section className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-xl">
                <div className="font-display text-base font-semibold">Public Rounds</div>
                <div className="mt-3 space-y-3">
                  <RoundCard
                    number="1"
                    paper={ASSESSMENT_PAPER}
                    attempt={assessmentAttempt}
                    locked={false}
                    lockedReason=""
                    onStart={() => startPaper(ASSESSMENT_PAPER)}
                  />
                  <RoundCard
                    number="2"
                    paper={departmentPaper}
                    attempt={departmentAttempt}
                    locked={!assessmentAttempt?.score.passed || Boolean(departmentAttempt)}
                    lockedReason={
                      departmentAttempt
                        ? "Already completed"
                        : assessmentAttempt
                          ? "Assessment did not meet the pass mark"
                          : "Complete assessment first"
                    }
                    onStart={() => startPaper(departmentPaper)}
                  />
                </div>
              </section>
            )}
          </aside>

          <section className="min-w-0">
            {!candidate && <WelcomePanel />}
            {candidate && !activePaper && !finishedAttempt && (
              <RoundSelectionPanel
                candidate={candidate}
                assessmentAttempt={assessmentAttempt}
                departmentAttempt={departmentAttempt}
                departmentPaper={departmentPaper}
                onStartAssessment={() => startPaper(ASSESSMENT_PAPER)}
                onStartDepartment={() => startPaper(departmentPaper)}
              />
            )}
            {candidate && activePaper && activeQuestion && (
              <ExamPanel
                paper={activePaper}
                questionIndex={questionIndex}
                activeQuestion={activeQuestion}
                answers={answers}
                notes={notes}
                remainingSeconds={remainingSeconds}
                answeredOptionCount={answeredOptionCount}
                optionQuestionCount={optionQuestionCount}
                unansweredCount={unansweredCount}
                submitError={submitError}
                onAnswer={(questionNumber, answer) => {
                  setAnswers((state) => ({ ...state, [questionNumber]: answer }));
                  setSubmitError("");
                }}
                onNote={(questionNumber, note) => {
                  setNotes((state) => ({ ...state, [questionNumber]: note }));
                  setSubmitError("");
                }}
                onQuestion={(index) => setQuestionIndex(index)}
                onPrevious={() => setQuestionIndex((index) => Math.max(0, index - 1))}
                onNext={() => setQuestionIndex((index) => Math.min(activePaper.questions.length - 1, index + 1))}
                onSubmit={submitPaper}
              />
            )}
            {candidate && finishedAttempt && (
              <FinishedPanel
                attempt={finishedAttempt}
                assessmentAttempt={assessmentAttempt}
                departmentAttempt={departmentAttempt}
                departmentPaper={departmentPaper}
                onStartDepartment={() => startPaper(departmentPaper)}
                onBack={() => {
                  setFinishedAttempt(null);
                  setActivePaper(null);
                }}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function PublicExamScene({ celebration }: { celebration: boolean }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === "undefined") return;

    let cleanupScene: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const THREE = await import("three");
      if (cancelled) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new THREE.Scene();
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0.2, 7.4);

      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      const key = new THREE.PointLight(0x7dd3fc, 4.2, 16);
      key.position.set(-3.5, 3, 4);
      const warm = new THREE.PointLight(0xfbbf24, 2.4, 14);
      warm.position.set(4, -1.5, 3.4);
      scene.add(ambient, key, warm);

      const group = new THREE.Group();
      scene.add(group);

      const core = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.86, 0.18, 150, 22),
        new THREE.MeshStandardMaterial({
          color: 0x67e8f9,
          metalness: 0.58,
          roughness: 0.18,
          emissive: 0x073b44,
          emissiveIntensity: 0.55,
        })
      );
      core.position.set(1.9, 0.35, 0);
      group.add(core);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: celebration ? 0xfbbf24 : 0x2dd4bf,
        transparent: true,
        opacity: celebration ? 0.42 : 0.22,
        side: THREE.DoubleSide,
      });
      const rings = [1.45, 2, 2.55].map((radius, index) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 8, 96), ringMaterial);
        ring.rotation.x = Math.PI / 2.7 + index * 0.18;
        ring.rotation.y = index * 0.4;
        ring.position.set(1.9, 0.35, -0.2);
        group.add(ring);
        return ring;
      });

      const shardColors = [0x67e8f9, 0x34d399, 0xfbbf24, 0xfb7185, 0xa7f3d0];
      const shards = Array.from({ length: 72 }, (_, index) => {
        const material = new THREE.MeshStandardMaterial({
          color: shardColors[index % shardColors.length],
          metalness: 0.35,
          roughness: 0.35,
          transparent: true,
          opacity: celebration ? 0.84 : 0.36,
        });
        const shard = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045 + (index % 4) * 0.012, 0), material);
        const angle = (index / 72) * Math.PI * 2;
        const radius = 2.1 + Math.sin(index * 1.7) * 0.8;
        shard.position.set(
          Math.cos(angle) * radius + 1.1,
          Math.sin(angle * 1.3) * 1.2 + 0.15,
          Math.sin(angle) * 0.8 - 1.8
        );
        shard.userData = { angle, radius, speed: 0.35 + (index % 9) * 0.035 };
        group.add(shard);
        return shard;
      });

      const lanes = Array.from({ length: 9 }, (_, index) => {
        const geometry = new THREE.BoxGeometry(0.035, 0.035, 5.5);
        const material = new THREE.MeshBasicMaterial({
          color: index % 2 ? 0x155e75 : 0x115e59,
          transparent: true,
          opacity: 0.3,
        });
        const lane = new THREE.Mesh(geometry, material);
        lane.position.set(-4.6 + index * 0.72, -2.25 + (index % 3) * 0.28, -1.8);
        lane.rotation.x = Math.PI / 2.7;
        lane.rotation.z = -0.18;
        scene.add(lane);
        return lane;
      });

      let frame = 0;
      let animationId = 0;
      const animate = () => {
        frame += reducedMotion ? 0.004 : 0.016;
        core.rotation.x += reducedMotion ? 0.001 : 0.006;
        core.rotation.y += reducedMotion ? 0.0015 : 0.009;
        rings.forEach((ring, index) => {
          ring.rotation.z += (celebration ? 0.01 : 0.004) * (index + 1);
        });
        shards.forEach((shard) => {
          const { angle, radius, speed } = shard.userData as { angle: number; radius: number; speed: number };
          const spread = celebration ? 0.5 : 0;
          shard.position.x = Math.cos(angle + frame * speed) * (radius + spread) + 1.1;
          shard.position.y = Math.sin(angle * 1.3 + frame * speed) * (1.2 + spread * 0.25) + 0.15;
          shard.rotation.x += 0.01;
          shard.rotation.y += 0.012;
        });
        lanes.forEach((lane, index) => {
          lane.position.z = -1.8 + Math.sin(frame * 0.7 + index) * 0.2;
        });
        renderer.render(scene, camera);
        animationId = window.requestAnimationFrame(animate);
      };

      const resize = () => {
        const nextWidth = Math.max(1, host.clientWidth);
        const nextHeight = Math.max(1, host.clientHeight);
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
      };

      window.addEventListener("resize", resize);
      animate();

      cleanupScene = () => {
        window.cancelAnimationFrame(animationId);
        window.removeEventListener("resize", resize);
        group.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        });
        lanes.forEach((lane) => {
          lane.geometry.dispose();
          const material = lane.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        });
        renderer.dispose();
        if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      cleanupScene?.();
    };
  }, [celebration]);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-0" />;
}

function WelcomePanel() {
  return (
    <div className="grid min-h-[calc(100vh-9rem)] place-items-center rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center shadow-2xl backdrop-blur-xl">
      <div className="max-w-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
          <BadgeCheck className="size-7 text-cyan-100" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold text-white sm:text-4xl">Candidate Exam Entry</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Registered candidates can enter the first two hiring rounds from this public page after name and email verification.
        </p>
      </div>
    </div>
  );
}

function RoundSelectionPanel({
  candidate,
  assessmentAttempt,
  departmentAttempt,
  departmentPaper,
  onStartAssessment,
  onStartDepartment,
}: {
  candidate: Candidate;
  assessmentAttempt?: PublicExamAttempt;
  departmentAttempt?: PublicExamAttempt;
  departmentPaper: ExamPaper;
  onStartAssessment: () => void;
  onStartDepartment: () => void;
}) {
  const departmentReady = Boolean(assessmentAttempt?.score.passed) && !departmentAttempt;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-300">Verified candidate</div>
            <h1 className="mt-1 font-display text-2xl font-semibold text-white">{candidate.name}</h1>
            <div className="mt-1 text-sm text-slate-300">{candidate.jobTitle} · {candidate.department}</div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Metric label="Candidate ID" value={candidate.candidateCode} />
            <Metric label="Current Stage" value={candidate.stage} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <LargeRoundCard
          icon={FileText}
          title="Round 1: Assessment Paper"
          detail={`${ASSESSMENT_PAPER.questions.length} questions · ${ASSESSMENT_PAPER.durationMinutes} min · pass ${ASSESSMENT_PAPER.passingMarks}/${ASSESSMENT_PAPER.totalMarks}`}
          attempt={assessmentAttempt}
          actionLabel={assessmentAttempt ? "View result" : "Start round 1"}
          onAction={onStartAssessment}
          locked={false}
        />
        <LargeRoundCard
          icon={FileCheck}
          title="Round 2: Department Paper"
          detail={`${departmentPaper.department} · ${departmentPaper.questions.length} questions · ${departmentPaper.durationMinutes} min`}
          attempt={departmentAttempt}
          actionLabel={departmentAttempt ? "View result" : "Start round 2"}
          onAction={onStartDepartment}
          locked={!departmentReady && !departmentAttempt}
          lockedLabel={assessmentAttempt ? "Round 1 not passed" : "Round 1 required"}
        />
      </div>
    </div>
  );
}

function ExamPanel({
  paper,
  questionIndex,
  activeQuestion,
  answers,
  notes,
  remainingSeconds,
  answeredOptionCount,
  optionQuestionCount,
  unansweredCount,
  submitError,
  onAnswer,
  onNote,
  onQuestion,
  onPrevious,
  onNext,
  onSubmit,
}: {
  paper: ExamPaper;
  questionIndex: number;
  activeQuestion: ExamPaper["questions"][number];
  answers: Record<number, ExamOptionLabel>;
  notes: Record<number, string>;
  remainingSeconds: number;
  answeredOptionCount: number;
  optionQuestionCount: number;
  unansweredCount: number;
  submitError: string;
  onAnswer: (questionNumber: number, answer: ExamOptionLabel) => void;
  onNote: (questionNumber: number, note: string) => void;
  onQuestion: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_16rem]">
      <section className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-300">{paper.department} · {paper.round === "assessment" ? "Round 1" : "Round 2"}</div>
            <h1 className="mt-1 truncate font-display text-xl font-semibold">{paper.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 text-sm text-cyan-100">
              <Clock className="size-4" />
              {formatTime(remainingSeconds)}
            </span>
            <span className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-slate-200">
              {answeredOptionCount}/{optionQuestionCount}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400">Question {activeQuestion.number} of {paper.questions.length}</div>
                {activeQuestion.section && <div className="mt-1 text-xs text-cyan-200">{activeQuestion.section}</div>}
              </div>
              {!activeQuestion.scored && (
                <span className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-xs text-amber-100">
                  Review
                </span>
              )}
            </div>

            <div className="mt-4 text-base font-medium leading-7 text-white">{activeQuestion.text}</div>

            {activeQuestion.options.length > 0 && (
              <div className="mt-5 grid gap-2">
                {activeQuestion.options.map((option) => {
                  const selected = answers[activeQuestion.number] === option.label;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => onAnswer(activeQuestion.number, option.label)}
                      className={`flex min-h-12 items-start gap-3 rounded-lg border px-3 py-3 text-left text-sm transition ${
                        selected
                          ? "border-cyan-200 bg-cyan-300/16 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.35)]"
                          : "border-white/10 bg-white/[0.035] text-slate-100 hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-current text-xs font-semibold">
                        {option.label}
                      </span>
                      <span className="leading-5">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {(activeQuestion.requiresReason || activeQuestion.options.length === 0) && (
              <label className="mt-5 block text-xs text-slate-300">
                Candidate note
                <textarea
                  value={notes[activeQuestion.number] ?? ""}
                  onChange={(event) => onNote(activeQuestion.number, event.target.value)}
                  className="mt-2 min-h-28 w-full resize-y rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-white outline-none focus:border-cyan-300/70"
                />
              </label>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onPrevious}
              disabled={questionIndex === 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowLeft className="size-4" />
              Previous
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {(submitError || unansweredCount > 0) && (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 text-xs text-amber-100">
                  <AlertCircle className="size-4" />
                  {submitError || `${unansweredCount} pending`}
                </span>
              )}
              <button
                onClick={onSubmit}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-semibold text-slate-950 hover:bg-emerald-200"
              >
                <CheckCircle2 className="size-4" />
                Submit
              </button>
            </div>
            <button
              onClick={onNext}
              disabled={questionIndex === paper.questions.length - 1}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-xl">
        <div className="text-sm font-semibold">Questions</div>
        <div className="mt-3 grid grid-cols-5 gap-2 xl:grid-cols-4">
          {paper.questions.map((question, index) => {
            const active = questionIndex === index;
            const answered = Boolean(answers[question.number]) || Boolean(notes[question.number]);
            return (
              <button
                key={question.number}
                type="button"
                onClick={() => onQuestion(index)}
                className={`h-9 rounded-lg text-xs tabular-nums transition ${
                  active
                    ? "bg-cyan-300 text-slate-950"
                    : answered
                      ? "border border-emerald-300/25 bg-emerald-300/15 text-emerald-100"
                      : "border border-white/10 bg-black/15 text-slate-300 hover:bg-white/10"
                }`}
              >
                {question.number}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function FinishedPanel({
  attempt,
  assessmentAttempt,
  departmentAttempt,
  departmentPaper,
  onStartDepartment,
  onBack,
}: {
  attempt: PublicExamAttempt;
  assessmentAttempt?: PublicExamAttempt;
  departmentAttempt?: PublicExamAttempt;
  departmentPaper: ExamPaper;
  onStartDepartment: () => void;
  onBack: () => void;
}) {
  const passed = attempt.score.passed;
  const canStartDepartment = attempt.paperId === ASSESSMENT_PAPER.id && passed && !departmentAttempt;

  return (
    <section className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
            passed ? "bg-emerald-300 text-slate-950" : "bg-rose-400 text-white"
          }`}>
            {passed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {passed ? "Passed" : "Failed"}
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold text-white">{attempt.paperTitle} Finished</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Submitted {formatSubmittedAt(attempt.submittedAt)}. {passed
              ? attempt.round === "assessment"
                ? "The department round is now available for this candidate."
                : "The hiring team can continue with the practical and interview process."
              : "This public test attempt is closed and cannot be retried."}
          </p>
        </div>

        <div className="grid w-full max-w-sm grid-cols-3 gap-2">
          <Metric label="Score" value={`${attempt.score.correct}/${attempt.score.total}`} />
          <Metric label="Percent" value={`${attempt.score.percentage}%`} />
          <Metric label="Round" value={attempt.round === "assessment" ? "1" : "2"} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <ResultAction
          title="Assessment"
          value={assessmentAttempt ? `${assessmentAttempt.score.correct}/${assessmentAttempt.score.total}` : "Pending"}
          passed={assessmentAttempt?.score.passed}
        />
        <ResultAction
          title={departmentPaper.department}
          value={departmentAttempt ? `${departmentAttempt.score.correct}/${departmentAttempt.score.total}` : "Pending"}
          passed={departmentAttempt?.score.passed}
        />
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="text-xs text-slate-400">Retry status</div>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Lock className="size-4 text-amber-200" />
            Completed attempts are locked
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-white hover:bg-white/10"
        >
          <ArrowLeft className="size-4" />
          Back to rounds
        </button>
        {canStartDepartment && (
          <button
            type="button"
            onClick={onStartDepartment}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
          >
            <Play className="size-4" />
            Start {departmentPaper.department} round
          </button>
        )}
      </div>
    </section>
  );
}

function RoundCard({
  number,
  paper,
  attempt,
  locked,
  lockedReason,
  onStart,
}: {
  number: string;
  paper: ExamPaper;
  attempt?: PublicExamAttempt;
  locked: boolean;
  lockedReason: string;
  onStart: () => void;
}) {
  const canAct = !locked || Boolean(attempt);

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={!canAct}
      className="w-full rounded-lg border border-white/10 bg-black/18 p-3 text-left transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-55"
    >
      <div className="flex items-start gap-3">
        <div className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold ${
          attempt?.score.passed ? "bg-emerald-300 text-slate-950" : attempt ? "bg-rose-400 text-white" : locked ? "bg-white/10 text-slate-400" : "bg-cyan-300 text-slate-950"
        }`}>
          {attempt ? <CheckCircle2 className="size-4" /> : locked ? <Lock className="size-4" /> : number}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{paper.title}</div>
          <div className="mt-1 text-xs text-slate-400">
            {attempt ? `${attempt.status} · ${attempt.score.correct}/${attempt.score.total}` : locked ? lockedReason : `${paper.durationMinutes} min`}
          </div>
        </div>
      </div>
    </button>
  );
}

function LargeRoundCard({
  icon: Icon,
  title,
  detail,
  attempt,
  locked,
  lockedLabel,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  attempt?: PublicExamAttempt;
  locked: boolean;
  lockedLabel?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10">
          <Icon className="size-5 text-cyan-100" />
        </div>
        {attempt && (
          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${
            attempt.score.passed ? "bg-emerald-300 text-slate-950" : "bg-rose-400 text-white"
          }`}>
            {attempt.status}
          </span>
        )}
        {!attempt && locked && (
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-xs text-amber-100">
            <Lock className="size-3" />
            {lockedLabel}
          </span>
        )}
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
      {attempt && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric label="Score" value={`${attempt.score.correct}/${attempt.score.total}`} />
          <Metric label="Percent" value={`${attempt.score.percentage}%`} />
          <Metric label="Submitted" value={formatSubmittedAt(attempt.submittedAt).split(",")[0]} />
        </div>
      )}
      <button
        type="button"
        onClick={onAction}
        disabled={locked && !attempt}
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {locked && !attempt ? <Lock className="size-4" /> : <Play className="size-4" />}
        {locked && !attempt ? "Locked" : actionLabel}
      </button>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="truncate text-xs text-slate-400">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function ResultAction({ title, value, passed }: { title: string; value: string; passed?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-display text-xl font-semibold">{value}</span>
        {passed === true && <CheckCircle2 className="size-5 text-emerald-200" />}
        {passed === false && <XCircle className="size-5 text-rose-300" />}
      </div>
    </div>
  );
}

function StatusChip({ icon: Icon, label, done }: { icon: LucideIcon; label: string; done: boolean }) {
  return (
    <span className={`inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 ${
      done ? "border-emerald-300/25 bg-emerald-300/12 text-emerald-100" : "border-white/10 bg-white/[0.04]"
    }`}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
