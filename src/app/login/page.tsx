import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthFormCard } from "@/components/auth/AuthFormCard";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dars");
  }
  return <AuthFormCard mode="login" />;
}
