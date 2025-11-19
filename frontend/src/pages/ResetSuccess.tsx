import { Link } from "react-router-dom";
import AuthPageLayout from "../layouts/AuthPageLayout";
import Button from "../components/ui/Button";

export default function ResetSuccess() {
  return (
    <AuthPageLayout
      title="Reset Password"
      subtitle="Your password has been reset successfully."
    >
      <div className="space-y-6">
        {/* Success message box */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-1">
            Password Reset Successful!
          </p>
          <p>
            You can now log in using your new password and continue exploring events
            on HuskyTrack.
          </p>
        </div>

        {/* Back to login */}
        <Button className="w-full">
          <Link to="/auth/login" className="block w-full text-center">
            Back to Login
          </Link>
        </Button>
      </div>
    </AuthPageLayout>
  );
}
