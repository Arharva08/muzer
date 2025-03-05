"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Appbar() {
  const session = useSession();

  return (
    <div className="flex items-center justify-between px-20 py-4 bg-gray-900">
      {/* Left Section - Logo */}
      <div className="text-lg font-bold text-white">Muzer</div>

      {/* Right Section - Auth Buttons */}
      <div>
        {session.data?.user ? (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signOut()}
          >
            LogOut
          </Button>
        ) : (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signIn()}
          >
            SignIn
          </Button>
        )}
      </div>
    </div>
  );
}
