import SignupForm from "@/components/SignupForm";
import { redirectIfAuthenticated } from "@/lib/utils/redirectIfAuthenticated";

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return <SignupForm />;
}
