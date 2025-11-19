import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthPageLayout from "../layouts/AuthPageLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

// Get password strength helper for indicator
function getPasswordStrength(password: string): { label: string; color: string } {
  // 1pt: min 8, 1pt: number, 1pt: special char, 1pt: upper
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (score === 0) return { label: "Very weak", color: "bg-red-400" };
  if (score === 1) return { label: "Weak", color: "bg-orange-400" };
  if (score === 2) return { label: "Fair", color: "bg-yellow-400" };
  if (score === 3) return { label: "Good", color: "bg-green-400" };
  return { label: "Strong", color: "bg-primary" };
}

export default function Register() {
  // States for all form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ORGANIZER">("STUDENT");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Error state for fields
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    university?: string;
    role?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Password strength
  const passwordStrength = getPasswordStrength(password);

  // Validation logic
  function validate(): boolean {
    const errs: typeof errors = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim()) errs.email = "Email is required";
    if (!university.trim()) errs.university = "University is required";
    if (!role) errs.role = "Role is required";
    if (!password) {
      errs.password = "Password is required";
    } else {
      if (password.length < 8)
        errs.password = "Password must be at least 8 characters";
      else if (!/[0-9]/.test(password))
        errs.password = "Password must contain at least one number";
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        errs.password = "Password must contain a special character";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Reset form (simulated success for task requirements)
      setFirstName(""); setLastName(""); setEmail(""); setUniversity("");
      setPassword(""); setConfirmPassword(""); setRole("STUDENT");
    }, 1500);
  };

  return (
    <AuthPageLayout
      title="Sign up"
      subtitle="Create your HuskyTrack account to discover and track campus events."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Last name"
            placeholder="Last name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="University"
          placeholder="Enter your university"
          value={university}
          onChange={e => setUniversity(e.target.value)}
          error={errors.university}
        />
        <div>
          <label className="font-medium text-gray-700 mb-1 block">
            Role
          </label>
          <select
            value={role}
            onChange={e =>
              setRole(e.target.value === "ORGANIZER" ? "ORGANIZER" : "STUDENT")
            }
            className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:outline-none bg-white ${errors.role ? "border-red-500" : ""}`}
          >
            <option value="STUDENT">Student</option>
            <option value="ORGANIZER">Organizer</option>
          </select>
          {errors.role && (
            <span className="text-sm text-red-500">{errors.role}</span>
          )}
        </div>
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            tabIndex={-1}
            className="absolute right-3 top-8 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5.05 0-9.18-3.96-10-8.5a9.977 9.977 0 012.221-4.006m3.312-2.816A9.978 9.978 0 0112 5c5.05 0 9.18 3.96 10 8.5a9.967 9.967 0 01-4.276 6.106M3 3l18 18M9.88 9.88A3.001 3.001 0 0115.12 15.12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M1.458 12C2.732 7.943 6.522 5 12 5s9.268 2.943 10.542 7c-1.274 4.057-5.064 7-10.542 7S2.732 16.057 1.458 12z" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
              </svg>
            )}
          </button>
          {/* Password Strength Indicator */}
          <div className="mt-1 flex items-center gap-2">
            <div className="w-24 h-2 rounded bg-gray-200 overflow-hidden">
              <div
                className={`h-2 rounded ${password ? passwordStrength.color : ""} transition-all`}
                style={{
                  width: password
                    ? `${Math.min(100, (password.length / 12) * 100)}%`
                    : "0%",
                }}
              />
            </div>
            <span
              className={`text-xs ${
                password ? passwordStrength.color.replace("bg", "text") : ""
              }`}
            >
              {password ? passwordStrength.label : ""}
            </span>
          </div>
        </div>
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(p => !p)}
            tabIndex={-1}
            className="absolute right-3 top-8 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5.05 0-9.18-3.96-10-8.5a9.977 9.977 0 012.221-4.006m3.312-2.816A9.978 9.978 0 0112 5c5.05 0 9.18 3.96 10 8.5a9.967 9.967 0 01-4.276 6.106M3 3l18 18M9.88 9.88A3.001 3.001 0 0115.12 15.12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M1.458 12C2.732 7.943 6.522 5 12 5s9.268 2.943 10.542 7c-1.274 4.057-5.064 7-10.542 7S2.732 16.057 1.458 12z" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
              </svg>
            )}
          </button>
        </div>
        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
        >
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
