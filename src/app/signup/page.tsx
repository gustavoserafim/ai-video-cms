import { AuthForm } from '@/components/AuthForm';

export default function Signup() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <AuthForm mode="signup" />
    </div>
  );
}
