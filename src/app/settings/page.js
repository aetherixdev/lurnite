"use client";

import { useRouter } from "next/navigation";
import Image from 'next/image';
import { getAuth, deleteUser, signOut, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { auth } from '../../config';
import { useAuth } from "../../contexts/AuthContext";
import { Button, Sidebar, PageWithSidebar } from "@/components";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const deleteAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      try {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        await deleteUser(user);
        console.log('Google-linked account deleted');
      } catch (error) {
        console.error('Error:', error.code);
      }
    }
  };
  
  const handleLogout = async () => {
      try {
        await signOut(auth);
        router.replace("/"); 
        console.log('User signed out');
      } catch (error) {
        console.error('Logout error:', error);
      }
 };

  if (loading) return <div className="flex"><Sidebar /><div>Loading...</div></div>;

  return (
      <PageWithSidebar>
        <h1 className="font-bold text-2xl">Settings</h1>
        <div className="m-2 p-2 flex justify-between">
          <div className="flex items-center space-x-8">
            <Image alt="User Profile" width="75" height="75" src={user.photoURL} className="rounded-full" />
            <div>
              <h2 className="text-lg font-semibold">{user.displayName}</h2>
              <p className="text-gray-700 dark:text-gray-300 italic">{user.email}</p>
            </div>
          </div>
          <div className="flex space-x-2 my-4">
            <Button onClick={handleLogout} textColor="text-red-500" className="outline-1 outline-red-500 bg-white hover:bg-red-50 active:bg-red-100">Logout</Button>
            <Button onClick={deleteAccount} className="bg-red-500 hover:bg-red-600 active:bg-red-700">
              Delete Account
            </Button>
          </div>
        </div>
      </PageWithSidebar>
  );
}
