"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import { ResumeData } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/resumes?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch {
      setResumes([]);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      fetchResumes();
    }
  }, [user, loading, router, fetchResumes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      alert("Failed to delete resume");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="mt-1 text-gray-500">
              Create, edit, and download your resumes
            </p>
          </div>
          <Link href="/templates" className="btn-primary">
            New Resume
          </Link>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              No resumes yet
            </h2>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              Get started by choosing a template and creating your first resume.
            </p>
            <Link href="/templates" className="btn-primary inline-block mt-6">
              Choose a Template
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="card overflow-hidden group">
                <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative">
                  <div className="w-20 h-28 bg-white rounded shadow-sm border border-gray-200 flex flex-col p-2 gap-1">
                    <div className="h-2 w-10 bg-gray-300 rounded-full" />
                    <div className="h-1 w-14 bg-gray-200 rounded-full" />
                    <div className="h-1 w-12 bg-gray-200 rounded-full" />
                    <div className="h-1 w-14 bg-gray-200 rounded-full" />
                    <div className="mt-1 h-1 w-10 bg-gray-200 rounded-full" />
                    <div className="h-1 w-14 bg-gray-200 rounded-full" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 capitalize">
                      {resume.templateId}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {resume.title || "Untitled Resume"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {resume.fullName || "No name set"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated{" "}
                    {resume.updatedAt
                      ? new Date(resume.updatedAt).toLocaleDateString()
                      : "recently"}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/editor/${resume.id}`}
                      className="btn-primary text-sm flex-1 text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(resume.id!)}
                      disabled={deleting === resume.id}
                      className="btn-secondary text-sm px-3"
                    >
                      {deleting === resume.id ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
