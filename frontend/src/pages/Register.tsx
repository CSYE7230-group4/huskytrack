import { Link } from "react-router-dom";
import AuthPageLayout from "../layouts/AuthPageLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
  return (
    <AuthPageLayout
      title="Sign up"
      subtitle="Create your HuskyTrack account to discover and track campus events."
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="First name" placeholder="First name" />
          <Input label="Last name" placeholder="Last name" />
        </div>

        <Input label="Email" type="email" placeholder="Enter your email" />

        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
        />

        <Button type="submit" className="w-full mt-2">
          Sign up
        </Button>
      </form>

      <p className="mt-6 text-xs text-center text-gray-500">
        Existing user?{" "}
        <Link to="/auth/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthPageLayout>
  );
}
