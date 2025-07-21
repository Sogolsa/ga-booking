export type SignupData = {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
};

export function validateSignup(data: SignupData): string | null {
  const { name, email, password, role, department } = data;

  if (!name.trim()) return "Full name is required.";
  if (!email.trim()) return "Email is required.";
  if (!password.trim()) return "Password is required.";
  if (role === "tutor" && (!department || !department.trim())) {
    return "Department is required for tutors.";
  }

  return null;
}
