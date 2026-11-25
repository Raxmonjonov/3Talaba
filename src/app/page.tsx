import { getCurrentUser } from "@/lib/auth/session";
import { HomeLandingPage } from "@/components/home/HomeLandingPage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <HomeLandingPage user={user} />;
}
