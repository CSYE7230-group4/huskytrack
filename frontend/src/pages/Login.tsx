import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthPageLayout from "../layouts/AuthPageLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/ui/Spinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/app";

  // Redirect if already authenticated (unless we just logged in)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !submitted) {
      navigate("/app", { replace: true });
    }
  }, [isLoading, isAuthenticated, submitted, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      // mark submitted; navigation will occur once user is authenticated
      setSubmitted(true);
    } catch (err: any) {
      console.error("login error", err);
      setError(err?.message || "Failed to log in. Please try again.");
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted && isAuthenticated) {
      console.log("navigating to", from, "after authentication");
      navigate(from, { replace: true });
    }
  }, [submitted, isAuthenticated, navigate, from]);

  // Show loading spinner while checking initial auth state
  if (isLoading && !submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthPageLayout
      title="Log in"
      subtitle="Please enter your details to continue."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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

        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Logging in...
            </span>
          ) : (
            "Log in"
          )}
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