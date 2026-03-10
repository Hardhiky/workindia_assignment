"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ResumeBuilder</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  My Resumes
                </Link>
                <Link
                  href="/templates"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Templates
                </Link>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      {user.isPremium && (
                        <span className="text-xs text-amber-600 font-medium">Premium</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link href="/" className="btn-primary text-sm">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
