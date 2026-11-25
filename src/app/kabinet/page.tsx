import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  dispatchDueLessonStartEmails,
  evaluateEnrollmentStatus,
  getSingleUserEnrollment,
} from "@/lib/applications/store";
import { StudentCabinetView } from "@/components/cabinet/StudentCabinetView";

export const dynamic = "force-dynamic";

export default async function KabinetPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await dispatchDueLessonStartEmails();
  const enrollment = await getSingleUserEnrollment(user.id);
  const status = enrollment ? evaluateEnrollmentStatus(enrollment) : null;

  return <StudentCabinetView user={user} status={status} />;
}
