import React from "react";
import { WritingExaminerDashboard } from "@/components/examiner/WritingExaminerDashboard";

export const metadata = {
  title: "AI IELTS Writing & Speaking Examiner | Band 8.5+ Inline Diagnostics",
  description:
    "Strict British Council / IDP Rubric AI Examiner with inline Grammar, Lexical, and Cohesion highlights, Band 9.0 upgrades, Band 8.5+ full rewrite, and Uzbek explanations.",
};

export default function ExaminerPage() {
  return <WritingExaminerDashboard />;
}
