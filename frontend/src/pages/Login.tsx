  import React, { useState } from "react";
  import { Link } from "react-router-dom";
  import AuthPageLayout from "../layouts/AuthPageLayout";
  import Input from "../components/ui/Input";
  import Button from "../components/ui/Button";
  // If lucide-react is available in your project, you can import Eye and EyeOff like so:
  // import { Eye, EyeOff } from "lucide-react";

  export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      let newErrors: { email?: string; password?: string } = {};
      if (!email.trim()) newErrors.email = "Email is required";
      if (!password) newErrors.password = "Password is required";

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) return;

      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        // Simulated login, leave as is for this task
      }, 1500);
    };

    return (
      <AuthPageLayout
        title="Log in"
        subtitle="Please enter your details to continue."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              tabIndex={-1}
              className="absolute right-3 top-8 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {/* Use lucide-react if available, fallback to SVG otherwise */}
              {/* {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>} */}
              {showPassword ? (
                // Eye-Off SVG
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.05 0-9.18-3.96-10-8.5a9.977 9.977 0 012.221-4.006m3.312-2.816A9.978 9.978 0 0112 5c5.05 0 9.18 3.96 10 8.5a9.967 9.967 0 01-4.276 6.106M3 3l18 18M9.88 9.88A3.001 3.001 0 0115.12 15.12" />
                </svg>
              ) : (
                // Eye SVG
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.458 12C2.732 7.943 6.522 5 12 5s9.268 2.943 10.542 7c-1.274 4.057-5.064 7-10.542 7S2.732 16.057 1.458 12z" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
                </svg>
              )}
            </button>
          </div>

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

          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={isLoading}
          >
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
