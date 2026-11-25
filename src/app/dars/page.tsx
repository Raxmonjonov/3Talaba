import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  dispatchDueLessonStartEmails,
  evaluateEnrollmentStatus,
  getSingleUserEnrollment,
} from "@/lib/applications/store";
import { AdmissionFlowApp } from "@/components/AdmissionFlowApp";

export const dynamic = "force-dynamic";

interface DarsPageProps {
  searchParams: Promise<{ uni?: string }>;
}

export default async function DarsPage({ searchParams }: DarsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/register");
  }

  await dispatchDueLessonStartEmails();
  const existingEnrollment = await getSingleUserEnrollment(user.id);
  const existingStatus = existingEnrollment
    ? evaluateEnrollmentStatus(existingEnrollment)
    : null;

  const params = await searchParams;
  const parsedRank = params.uni ? Number(params.uni) : undefined;
  const initialUniversityRank =
    parsedRank && Number.isInteger(parsedRank) && parsedRank >= 1 && parsedRank <= 300
      ? parsedRank
      : undefined;

  return (
    <AdmissionFlowApp
      user={user}
      existingStatus={existingStatus}
      initialUniversityRank={initialUniversityRank}
    />
  );
}
