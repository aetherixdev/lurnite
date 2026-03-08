"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button";
import TextField from "@/components/TextField";

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  function handleLogin() {
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-12 min-w-[40%] rounded-2xl shadow-md space-y-2">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <Button className="w-full" onClick={handleLogin}>Login with Google</Button>
      </div>
    </div>
  );
}