import React from "react";
import { InsperaExamSimulator } from "@/components/simulator/InsperaExamSimulator";

export const metadata = {
  title: "Inspera & Bluebook AI Exam Simulator | IELTS & Digital SAT",
  description:
    "Distraction-free split-screen IELTS Reading & Writing simulator with real-time inline AI Examiner critique and micro-adaptive study roadmap.",
};

export default function SimulatorPage() {
  return <InsperaExamSimulator />;
}
