"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
// import Button from "../../components/Button";
// import TextField from "@/components/TextField";

const GoogleIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
  </svg>
);

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  function handleGoogleLogin() {
    signInWithPopup(auth, provider).then((data) => {
      console.log(data.user);
      router.replace("/");
    }).catch((error) => {
      console.error(error);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" aria-label="home" className="flex items-center gap-2">
            {/* <img
              src="/ai-logo-white.png"
              alt="Your Image"
              height={50}
              width={50}
              className="z-10 hidden h-10 w-full object-contain dark:block"
            />
            <img
              src="/ai-logo-black.png"
              alt="Your Image"
              height={50}
              width={50}
              className="z-10 block h-10 w-full object-contain dark:hidden"
            /> */}
            L
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
          <div className="mx-auto w-full max-w-xs space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-balance text-3xl font-semibold text-ink">Welcome back</h1>
          <p className="text-pretty text-ink-soft">
            Sign in to supercharge your learning!
          </p>
        </div>

        <div className="space-y-5">
          <Button variant="outline" className="w-full justify-center gap-2" onClick={handleGoogleLogin}>
            <GoogleIcon className="h-4 w-4" />
            Sign in with Google
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-sm text-ink-soft">
              or sign in with email
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2.5">
                <Input
                  id="email"
                  className="peer ps-9"
                  placeholder="ephraim@blocks.so"
                  type="email"
                />
                <div className="text-ink-soft/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <Mail size={16} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-ink-mid hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative mt-2.5">
                <Input
                  id="password"
                  className="ps-9 pe-9"
                  placeholder="Enter your password"
                  type={isVisible ? "text" : "password"}
                />
                <div className="text-ink-soft/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <Lock size={16} aria-hidden="true" />
                </div>
                <button
                  className="text-ink-soft/80 hover:text-foreground focus-visible:border-spark-lt focus-visible:ring-spark-lt/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label={isVisible ? "Hide password" : "Show password"}
                  aria-pressed={isVisible}
                  aria-controls="password"
                >
                  {isVisible ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button className="w-full">
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="text-center text-sm">
            No account?{" "}
            <a href="#" className="text-spark font-medium hover:underline">
              Create an account
            </a>
          </div>
        </div>
      </div>
          </div>
        </div>
      </div>
      <div className="bg-background relative hidden lg:block">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(30deg, var(--color-spark) 12%, transparent 12.5%, transparent 87%, var(--color-spark) 87.5%, var(--color-spark)), linear-gradient(150deg, var(--color-spark) 12%, transparent 12.5%, transparent 87%, var(--color-spark) 87.5%, var(--color-spark)), linear-gradient(30deg, var(--color-spark) 12%, transparent 12.5%, transparent 87%, var(--color-spark) 87.5%, var(--color-spark)), linear-gradient(150deg, var(--color-spark) 12%, transparent 12.5%, transparent 87%, var(--color-spark) 87.5%, var(--color-spark)), linear-gradient(60deg, color-mix(in srgb, var(--color-spark) 77%, transparent) 25%, transparent 25.5%, transparent 75%, color-mix(in srgb, var(--color-spark) 77%, transparent) 75%, color-mix(in srgb, var(--color-spark) 77%, transparent)), linear-gradient(60deg, color-mix(in srgb, var(--color-spark) 77%, transparent) 25%, transparent 25.5%, transparent 75%, color-mix(in srgb, var(--color-spark) 77%, transparent) 75%, color-mix(in srgb, var(--color-spark) 77%, transparent))",
            backgroundPosition:
              "0 0, 0 0, 30px 53px, 30px 53px, 0 0, 30px 53px",
            backgroundSize: "60px 106px",
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  );
}