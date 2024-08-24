import { AuthForm } from '@/components/AuthForm';

export default function Login() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Log In</h1>
      <AuthForm mode="login" />
    </div>
  );
}
