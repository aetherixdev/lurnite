"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getAuth,
  deleteUser,
  signOut,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { useTheme } from "next-themes";
import { auth } from "../../config";
import { useAuth } from "../../contexts/AuthContext";
import { PageWithSidebar } from "@/components";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const deleteAccount = async () => {
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) return;

    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(currentUser, provider);
      await deleteUser(currentUser);
      router.replace("/");
    } catch (error) {
      console.error("Error:", error?.code ?? error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <PageWithSidebar>
        <div className="p-4 text-sm text-muted-foreground">Loading...</div>
      </PageWithSidebar>
    );
  }

  return (
    <PageWithSidebar>
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Preferences and account controls.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Personalize your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Appearance</Label>
                <Select
                  value={mounted ? (theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : "System") : "System"}
                  onValueChange={(value) => setTheme(value.toLowerCase())}
                >
                  <SelectTrigger className="w-full max-w-56">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="System">System</SelectItem>
                      <SelectItem value="Light">Light</SelectItem>
                      <SelectItem value="Dark">Dark</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose light, dark, or follow your system setting.
                </p>
              </div>

              <Separator />

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-sm font-medium">Tip</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  You can toggle the sidebar with <span className="font-medium">Ctrl</span>+
                  <span className="font-medium">B</span>.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your signed-in session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-full border border-border bg-muted">
                  {user?.photoURL ? (
                    <Image
                      alt="User profile"
                      src={user.photoURL}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {user?.displayName ?? "Anonymous"}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">
                    {user?.email ?? ""}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" />}>
                    Logout
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md p-6">
                    <DialogHeader className="gap-3">
                      <DialogTitle className="text-xl">Log out</DialogTitle>
                      <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed">
                        Are you sure you want to log out? You will need to sign back in to access your study data and tasks.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="-mx-6 -mb-6 mt-5 p-6">
                      <DialogClose render={<Button variant="outline" />}>
                        Cancel
                      </DialogClose>
                      <Button onClick={handleLogout}>
                        Yes, log out
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger render={<Button variant="destructive" />}>
                    Delete account
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md p-6">
                    <DialogHeader className="gap-3">
                      <DialogTitle className="text-xl">Delete Account</DialogTitle>
                      <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed">
                        This action is permanent and cannot be undone. All your study data, tasks, and preferences will be permanently erased.
                        <br /><br />
                        <strong>Please note:</strong> For security purposes, you may be prompted to verify your identity by signing in again before the deletion is processed.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="-mx-6 -mb-6 mt-5 p-6">
                      <DialogClose render={<Button variant="outline" />}>
                        Cancel
                      </DialogClose>
                      <Button variant="destructive" onClick={deleteAccount}>
                        Yes, delete my account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWithSidebar>
  );
}
