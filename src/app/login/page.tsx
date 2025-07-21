import LoginForm from "@/components/LoginForm";
import { redirectIfAuthenticated } from "@/lib/utils/redirectIfAuthenticated";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}
