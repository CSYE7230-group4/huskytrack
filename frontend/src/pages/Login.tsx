import { Link } from "react-router-dom";
import AuthPageLayout from "../layouts/AuthPageLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  return (
    <AuthPageLayout
      title="Log in"
      subtitle="Please enter your details to continue."
    >
      <form className="space-y-4">
        <Input label="Email" type="email" placeholder="Enter your email" />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between text-xs mt-1">
          <div className="flex items-center gap-2 text-gray-500">
            <input type="checkbox" id="remember" className="rounded border-gray-300" />
            <label htmlFor="remember">Remember me</label>
          </div>

          <Link
            to="/auth/forgot-password"
            className="text-primary hover:underline font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="w-full mt-4">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-xs text-center text-gray-500">
        New user?{" "}
        <Link to="/auth/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthPageLayout>
  );
}
