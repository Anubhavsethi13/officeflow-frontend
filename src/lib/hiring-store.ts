import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JOBS, CANDIDATES, HR_SCREENING_QUESTIONS, type Job, type Candidate, type HiringStage } from "./hiring-data";
import type { ExamOptionLabel, PaperRound } from "./hiring-exam-papers";

export interface Question {
  id: string;
  testType: string;
  text: string;
  options: string[];
  correctOption: number;
}

export interface Exam {
  id: string;
  candidateId: string;
  testType: string;
  scheduledFor: string;
  status: "Scheduled" | "Completed" | "Pending Review";
}

export interface AnswerSheet {
  id: string;
  code: string;
  candidateId: string;
  testType: string;
  status: "Verified" | "Auto-checked" | "Needs Review" | "Pending Upload";
  marks: string;
  confidence: number;
}

export interface Interview {
  id: string;
  candidateId: string;
  round: string;
  interviewerId?: string;
  scheduledAt: string;
  status: "Scheduled" | "Completed" | "Rescheduled" | "Cancelled";
  feedback?: string;
  rating?: number;
}

export interface Offer {
  id: string;
  candidateId: string;
  jobId?: string;
  salary: number;
  joiningDate: string;
  status: "Draft" | "Sent" | "Shared" | "Accepted" | "Rejected";
  sentAt?: string;
}

export interface PublicExamAttempt {
  id: string;
  candidateId: string;
  paperId: string;
  paperTitle: string;
  round: PaperRound;
  department: string;
  submittedAt: string;
  answers: Record<number, ExamOptionLabel>;
  notes: Record<number, string>;
  score: {
    correct: number;
    total: number;
    percentage: number;
    passed: boolean;
  };
  status: "Passed" | "Failed";
}

interface HiringState {
  jobs: Job[];
  candidates: Candidate[];
  questions: Question[];
  exams: Exam[];
  answerSheets: AnswerSheet[];
  interviews: Interview[];
  offers: Offer[];
  publicExamAttempts: PublicExamAttempt[];
  addJob: (job: Omit<Job, "id" | "createdAt" | "candidates">) => void;
  updateJob: (id: string, job: Partial<Job>) => void;
  addCandidate: (candidate: Omit<Candidate, "id" | "candidateCode" | "overallScore" | "appliedAt" | "avatarHue">) => void;
  updateCandidateStage: (id: string, stage: HiringStage) => void;
  addQuestion: (question: Omit<Question, "id">) => void;
  scheduleExam: (exam: Omit<Exam, "id" | "status">) => void;
  addAnswerSheet: (sheet: Omit<AnswerSheet, "id">) => void;
  updateAnswerSheet: (id: string, update: Partial<AnswerSheet>) => void;
  scheduleInterview: (interview: Omit<Interview, "id" | "status">) => void;
  addInterviewFeedback: (id: string, feedback: string, rating: number) => void;
  createOffer: (offer: Omit<Offer, "id" | "status">) => void;
  updateOfferStatus: (id: string, status: Offer["status"]) => void;
  deleteCandidate: (id: string) => void;
  submitPublicExamAttempt: (attempt: Omit<PublicExamAttempt, "id" | "submittedAt" | "status">) => PublicExamAttempt;
}

export const useHiringStore = create<HiringState>()(
  persist(
    (set) => ({
      jobs: [...JOBS],
      candidates: [...CANDIDATES],
      questions: [
        { id: "q1", testType: "Common Aptitude", text: "What is 2+2?", options: ["3", "4", "5", "6"], correctOption: 1 },
      ],
      exams: [],
      answerSheets: [
        { id: "as1", code: "AS-2026-0014", candidateId: "c1", testType: "Common Aptitude", status: "Auto-checked", marks: "42/50", confidence: 96 },
        { id: "as2", code: "AS-2026-0015", candidateId: "c2", testType: "Software – Logic", status: "Needs Review", marks: "—", confidence: 64 },
        { id: "as3", code: "AS-2026-0016", candidateId: "c3", testType: "Common Aptitude", status: "Verified", marks: "38/50", confidence: 99 },
        { id: "as4", code: "AS-2026-0017", candidateId: "c4", testType: "Accounts – GST", status: "Auto-checked", marks: "31/50", confidence: 91 },
        { id: "as5", code: "AS-2026-0018", candidateId: "c5", testType: "Hardware – Networking", status: "Pending Upload", marks: "—", confidence: 0 },
      ],
      interviews: [
         { id: "i1", candidateId: "c1", round: "Technical Round", scheduledAt: "2026-06-10T10:00:00Z", status: "Scheduled" }
      ],
      offers: [
         { id: "o1", candidateId: "c7", jobId: "j1", salary: 1200000, joiningDate: "2026-07-01", status: "Sent", sentAt: "2026-06-01T10:00:00Z" }
      ],
      publicExamAttempts: [],

      addJob: (job) => set((state) => ({
        jobs: [...state.jobs, {
          ...job,
          id: `j${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          candidates: 0
        }]
      })),
      
      updateJob: (id, updates) => set((state) => ({
        jobs: state.jobs.map(j => j.id === id ? { ...j, ...updates } : j)
      })),

      addCandidate: (c) => set((state) => ({
        candidates: [...state.candidates, {
          ...c,
          id: `c${Date.now()}`,
          candidateCode: `CAN-2026-${Math.floor(Math.random() * 9000) + 1000}`,
          overallScore: 0,
          appliedAt: new Date().toISOString().split('T')[0],
          avatarHue: Math.floor(Math.random() * 360)
        }]
      })),

      updateCandidateStage: (id, stage) => set((state) => ({
        candidates: state.candidates.map(c => c.id === id ? { ...c, stage } : c)
      })),

      addQuestion: (q) => set((state) => ({
        questions: [...state.questions, { ...q, id: `q${Date.now()}` }]
      })),

      scheduleExam: (exam) => set((state) => ({
        exams: [...state.exams, { ...exam, id: `e${Date.now()}`, status: "Scheduled" }]
      })),

      addAnswerSheet: (sheet) => set((state) => ({
        answerSheets: [...state.answerSheets, { ...sheet, id: `as${Date.now()}` }]
      })),

      updateAnswerSheet: (id, updates) => set((state) => ({
        answerSheets: state.answerSheets.map(s => s.id === id ? { ...s, ...updates } : s)
      })),

      scheduleInterview: (interview) => set((state) => ({
        interviews: [...state.interviews, { ...interview, id: `i${Date.now()}`, status: "Scheduled" }]
      })),

      addInterviewFeedback: (id, feedback, rating) => set((state) => ({
        interviews: state.interviews.map(i => i.id === id ? { ...i, feedback, rating, status: "Completed" } : i)
      })),

      createOffer: (offer) => set((state) => ({
        offers: [...state.offers, { ...offer, id: `o${Date.now()}`, status: "Draft" }]
      })),

      updateOfferStatus: (id, status) => set((state) => ({
        offers: state.offers.map(o => o.id === id ? { ...o, status } : o)
      })),
      
      deleteCandidate: (id) => set((state) => ({
        candidates: state.candidates.filter(c => c.id !== id)
      })),

      submitPublicExamAttempt: (attempt) => {
        const status: PublicExamAttempt["status"] = attempt.score.passed ? "Passed" : "Failed";
        const submittedAt = new Date().toISOString();
        const publicAttempt: PublicExamAttempt = {
          ...attempt,
          id: `pa${Date.now()}`,
          submittedAt,
          status,
        };

        set((state) => ({
          publicExamAttempts: [...state.publicExamAttempts, publicAttempt],
          answerSheets: [...state.answerSheets, {
            id: `as${Date.now()}`,
            code: `AS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            candidateId: attempt.candidateId,
            testType: attempt.paperTitle,
            status: attempt.score.total > 0 ? "Auto-checked" : "Needs Review",
            marks: `${attempt.score.correct}/${attempt.score.total}`,
            confidence: attempt.score.total > 0 ? 100 : 0,
          }],
          candidates: state.candidates.map((candidate) => {
            if (candidate.id !== attempt.candidateId) return candidate;
            if (!attempt.score.passed) return { ...candidate, stage: "Rejected" };
            if (attempt.round === "department") return { ...candidate, stage: "Practical Test" };
            return { ...candidate, stage: "Aptitude Test" };
          }),
        }));

        return publicAttempt;
      },
    }),
    {
      name: "hiring-storage",
    }
  )
);
