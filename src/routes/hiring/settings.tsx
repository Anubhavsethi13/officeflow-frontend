import { createFileRoute } from "@tanstack/react-router";
import { HiringLayout } from "@/components/hiring/HiringLayout";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/hiring/settings")({
  head: () => ({ meta: [{ title: "Hiring Settings - officeflow" }] }),
  component: SettingsPage,
});

const SECTIONS = [
  { title: "Departments", desc: "Manage Support, Software, Hardware, Accounts, Consumables" },
  { title: "Job Templates", desc: "Reusable templates for common roles" },
  { title: "Candidate Sources", desc: "LinkedIn, Job Portal, Reference, Walk-in, Consultant…" },
  { title: "Hiring Stages", desc: "Customize Kanban columns and stage rules" },
  { title: "Round Scoring", desc: "HR Screening 50 · Aptitude 100 · Practical 100 · Interview 50 · Final 50" },
  { title: "Question Bank Settings", desc: "Categories, difficulty levels, marks scheme" },
  { title: "Answer Sheet Format", desc: "OMR layout, QR code, instructions" },
  { title: "Offer Letter Template", desc: "Standard terms, signature, branding" },
  { title: "Employee ID Format", desc: "EMP-YYYY-####" },
  { title: "Candidate ID Format", desc: "CAN-YYYY-####" },
  { title: "Notifications", desc: "Email + in-app alerts for HR and candidates" },
  { title: "Role Permissions", desc: "Super Admin · MD · HR Admin · Dept Head · Interviewer" },
];

function SettingsPage() {
  return (
    <HiringLayout title="Hiring Settings" subtitle="Configure your recruitment workflow">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {SECTIONS.map(s => (
          <button key={s.title} className="text-left glass-strong rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all">
            <div className="size-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 grid place-items-center shadow mb-3">
              <SettingsIcon className="size-5 text-white" />
            </div>
            <div className="font-display font-semibold">{s.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
          </button>
        ))}
      </div>
    </HiringLayout>
  );
}
