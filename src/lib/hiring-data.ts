export type HiringDept = "Support" | "Software" | "Software Tester" | "Hardware" | "Accounts" | "Consumables";
export const HIRING_DEPTS: HiringDept[] = ["Support", "Software", "Software Tester", "Hardware", "Accounts", "Consumables"];

export const HIRING_STAGES = [
  "New Candidate",
  "HR Screening",
  "Aptitude Test",
  "Practical Test",
  "Face-to-Face Interview",
  "Final HR Round",
  "Offer Shared",
  "Offer Accepted",
  "Joined",
  "Rejected",
  "Hold",
] as const;
export type HiringStage = (typeof HIRING_STAGES)[number];

export interface Job {
  id: string;
  jobCode: string;
  title: string;
  department: HiringDept;
  designation: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  openings: number;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Intern";
  status: "Draft" | "Open" | "Hold" | "Closed";
  createdAt: string;
  candidates: number;
}

export interface Candidate {
  id: string;
  candidateCode: string;
  name: string;
  email: string;
  phone: string;
  department: HiringDept;
  jobTitle: string;
  experience: string;
  currentCompany: string;
  expectedSalary: number;
  noticePeriod: string;
  source: string;
  location: string;
  stage: HiringStage;
  overallScore: number;
  appliedAt: string;
  avatarHue: number;
  resumeFileName?: string;
}

export const JOBS: Job[] = [
  { id: "j1", jobCode: "JOB-2026-0001", title: "Frontend Developer", department: "Software", designation: "Senior Frontend", experience: "3-5 yrs", salaryMin: 800000, salaryMax: 1500000, openings: 2, location: "Pune", employmentType: "Full-time", status: "Open", createdAt: "2026-05-12", candidates: 14 },
  { id: "j2", jobCode: "JOB-2026-0002", title: "Backend Developer", department: "Software", designation: "Backend Engineer", experience: "2-4 yrs", salaryMin: 700000, salaryMax: 1200000, openings: 1, location: "Remote", employmentType: "Full-time", status: "Open", createdAt: "2026-05-15", candidates: 9 },
  { id: "j3", jobCode: "JOB-2026-0003", title: "Support Executive", department: "Support", designation: "Support L1", experience: "0-2 yrs", salaryMin: 250000, salaryMax: 400000, openings: 4, location: "Mumbai", employmentType: "Full-time", status: "Open", createdAt: "2026-05-18", candidates: 22 },
  { id: "j4", jobCode: "JOB-2026-0004", title: "Hardware Engineer", department: "Hardware", designation: "Field Engineer", experience: "1-3 yrs", salaryMin: 300000, salaryMax: 550000, openings: 3, location: "Delhi", employmentType: "Full-time", status: "Open", createdAt: "2026-05-20", candidates: 11 },
  { id: "j5", jobCode: "JOB-2026-0005", title: "Accountant", department: "Accounts", designation: "Accounts Exec", experience: "2-5 yrs", salaryMin: 350000, salaryMax: 600000, openings: 1, location: "Pune", employmentType: "Full-time", status: "Hold", createdAt: "2026-05-22", candidates: 6 },
  { id: "j6", jobCode: "JOB-2026-0006", title: "Sales Executive", department: "Consumables", designation: "Field Sales", experience: "1-4 yrs", salaryMin: 280000, salaryMax: 500000, openings: 5, location: "Bangalore", employmentType: "Full-time", status: "Open", createdAt: "2026-05-25", candidates: 17 },
  { id: "j7", jobCode: "JOB-2026-0007", title: "Software Tester", department: "Software Tester", designation: "QA Tester", experience: "1-3 yrs", salaryMin: 350000, salaryMax: 700000, openings: 2, location: "Pune", employmentType: "Full-time", status: "Open", createdAt: "2026-06-04", candidates: 8 },
];

const NAMES = ["Aarav Mehta","Diya Kapoor","Ishaan Reddy","Saanvi Nair","Vivaan Shah","Anaya Iyer","Kabir Bose","Myra Pillai","Reyansh Joshi","Aadhya Khanna","Vihaan Verma","Sara Kulkarni","Aryan Gupta","Riya Patel","Arjun Singh","Tara Menon","Dev Sharma","Nisha Rao","Karan Yadav","Pooja Desai"];
const SOURCES = ["LinkedIn","Job Portal","Reference","Walk-in","Consultant","Internal Referral","College Placement","Direct"];

export const CANDIDATES: Candidate[] = NAMES.map((n, i) => {
  const job = JOBS[i % JOBS.length];
  const stages: HiringStage[] = ["New Candidate","HR Screening","Aptitude Test","Practical Test","Face-to-Face Interview","Final HR Round","Offer Shared","Offer Accepted","Joined","Rejected","Hold"];
  return {
    id: `c${i+1}`,
    candidateCode: `CAN-2026-${String(i+1).padStart(4,"0")}`,
    name: n,
    email: `${n.toLowerCase().replace(/\s+/g,".")}@example.com`,
    phone: `+91 9${String(800000000 + i*123457).slice(0,9)}`,
    department: job.department,
    jobTitle: job.title,
    experience: `${(i%6)+1} yrs`,
    currentCompany: ["Infosys","TCS","Wipro","Zoho","Freshworks","Razorpay","HCL"][i%7],
    expectedSalary: 400000 + (i%8)*100000,
    noticePeriod: ["Immediate","15 days","30 days","60 days"][i%4],
    source: SOURCES[i%SOURCES.length],
    location: ["Pune","Mumbai","Delhi","Bangalore","Hyderabad","Remote"][i%6],
    stage: stages[i%stages.length],
    overallScore: 40 + ((i*7)%55),
    appliedAt: `2026-05-${String((i%27)+1).padStart(2,"0")}`,
    avatarHue: (i*37) % 360,
  };
});

export const HR_SCREENING_QUESTIONS = [
  "Tell me about yourself.",
  "Why are you interested in this role?",
  "What do you know about our company?",
  "What is your current experience or fresher background?",
  "What are your strongest skills for this role?",
  "Are you comfortable with the job location?",
  "What is your expected salary?",
  "What is your notice period or joining availability?",
  "Are you comfortable with office timings and company policies?",
  "Why should we select you?",
];

export const candidateAvatar = (name: string, hue: number) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},70%25,60%25)'/><stop offset='1' stop-color='hsl(${(hue+60)%360},70%25,50%25)'/></linearGradient></defs><rect width='64' height='64' rx='32' fill='url(%23g)'/><text x='50%25' y='50%25' dy='.35em' text-anchor='middle' font-family='Inter,sans-serif' font-size='24' font-weight='600' fill='white'>${name.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()}</text></svg>`;

export const stageColor = (s: HiringStage) => {
  const map: Record<HiringStage, string> = {
    "New Candidate": "from-slate-500 to-slate-600",
    "HR Screening": "from-blue-500 to-cyan-500",
    "Aptitude Test": "from-indigo-500 to-purple-500",
    "Practical Test": "from-purple-500 to-pink-500",
    "Face-to-Face Interview": "from-amber-500 to-orange-500",
    "Final HR Round": "from-orange-500 to-red-500",
    "Offer Shared": "from-teal-500 to-emerald-500",
    "Offer Accepted": "from-emerald-500 to-green-600",
    "Joined": "from-green-500 to-lime-500",
    "Rejected": "from-rose-500 to-red-600",
    "Hold": "from-zinc-500 to-zinc-600",
  };
  return map[s];
};
