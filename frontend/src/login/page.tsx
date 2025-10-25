import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "@/components/auth-layout"

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-center text-primary">Log in</h1>

        {/* Form */}
        <form className="space-y-6">
          <div className="space-y-4">
            <Input type="email" placeholder="Email" className="h-14 text-base" required />
            <div className="space-y-2">
              <Input type="password" placeholder="Password" className="h-14 text-base" required />
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-base font-semibold" size="lg">
            Log in
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground font-medium">OR</span>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3 text-center">
          <div>
            <span className="text-foreground">New User? </span>
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </div>
          <div>
            <Link href="/reset-password" className="text-foreground hover:text-primary transition-colors">
              Reset Password
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
