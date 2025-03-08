import { SignIn } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/dashboard"
    />
  );
}