"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import { TEMPLATES } from "@/lib/templates";
import { TemplateInfo } from "@/lib/types";

export default function TemplatesPage() {
  const { user, loading, upgradeToPremium } = useUser();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<TemplateInfo | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const handleSelectTemplate = async (template: TemplateInfo) => {
    if (template.isPaid && !user.isPremium) {
      setSelectedPreview(template);
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          templateId: template.id,
          title: `My ${template.name} Resume`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/editor/${data.resume.id}`);
      } else {
        alert("Failed to create resume");
      }
    } catch {
      alert("Failed to create resume");
    } finally {
      setCreating(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeToPremium();
      setSelectedPreview(null);
    } catch {
      alert("Upgrade failed");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Choose a Template</h1>
          <p className="mt-1 text-gray-500">
            Select a template to start building your resume
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEMPLATES.map((template) => {
            const isLocked = template.isPaid && !user.isPremium;

            return (
              <div
                key={template.id}
                className={`card overflow-hidden transition-shadow hover:shadow-md ${
                  isLocked ? "ring-1 ring-amber-200" : ""
                }`}
              >
                <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                  <TemplatePreviewMini templateId={template.id} />
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        <span className="text-amber-700 font-semibold text-sm">
                          Premium Template
                        </span>
                      </div>
                    </div>
                  )}
                  {!template.isPaid && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                        Free
                      </span>
                    </div>
                  )}
                  {template.isPaid && user.isPremium && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        Unlocked
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    {template.isPaid && !user.isPremium && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 font-medium mb-1">SECTIONS</p>
                    <div className="flex flex-wrap gap-1">
                      {template.sectionOrder
                        .filter((s) => s !== "header")
                        .map((section) => (
                          <span
                            key={section}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize"
                          >
                            {section === "workExperiences"
                              ? "Experience"
                              : section === "educations"
                              ? "Education"
                              : section}
                          </span>
                        ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    disabled={creating}
                    className={`mt-4 w-full text-sm font-medium py-2.5 rounded-lg transition-colors ${
                      isLocked
                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        : "btn-primary"
                    }`}
                  >
                    {creating
                      ? "Creating..."
                      : isLocked
                      ? "Unlock with Premium"
                      : "Use This Template"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Upgrade to Premium
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              The {selectedPreview.name} template is a premium template. Upgrade
              your account to unlock all premium templates and features.
            </p>
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <h3 className="font-semibold text-amber-800">
                Premium Benefits
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-amber-700">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Access to all premium templates
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Exclusive layouts and designs
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Priority support
                </li>
              </ul>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {upgrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Upgrading...</span>
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </button>
              <button
                onClick={() => setSelectedPreview(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400 text-center">
              This is a simulated upgrade. No real payment is required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatePreviewMini({ templateId }: { templateId: string }) {
  if (templateId === "classic") {
    return (
      <div className="w-36 h-48 bg-white rounded shadow-sm border border-gray-200 p-3 flex flex-col">
        <div className="text-center border-b border-gray-200 pb-2 mb-2">
          <div className="h-2.5 w-20 bg-gray-800 rounded-full mx-auto" />
          <div className="h-1.5 w-24 bg-gray-300 rounded-full mx-auto mt-1" />
        </div>
        <div className="space-y-2 flex-1">
          <div>
            <div className="h-1.5 w-12 bg-blue-600 rounded-full mb-1" />
            <div className="h-1 w-full bg-gray-200 rounded-full" />
            <div className="h-1 w-28 bg-gray-200 rounded-full mt-0.5" />
          </div>
          <div>
            <div className="h-1.5 w-14 bg-blue-600 rounded-full mb-1" />
            <div className="h-1 w-full bg-gray-200 rounded-full" />
            <div className="h-1 w-20 bg-gray-200 rounded-full mt-0.5" />
          </div>
          <div>
            <div className="h-1.5 w-10 bg-blue-600 rounded-full mb-1" />
            <div className="flex gap-1 flex-wrap">
              <div className="h-2 w-8 bg-gray-100 rounded" />
              <div className="h-2 w-10 bg-gray-100 rounded" />
              <div className="h-2 w-6 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "modern") {
    return (
      <div className="w-36 h-48 bg-white rounded shadow-sm border border-gray-200 flex overflow-hidden">
        <div className="w-12 bg-blue-600 p-2 flex flex-col gap-2">
          <div className="w-8 h-8 bg-blue-400 rounded-full mx-auto" />
          <div className="h-1 w-6 bg-blue-300 rounded-full mx-auto" />
          <div className="h-1 w-7 bg-blue-300 rounded-full mx-auto" />
          <div className="mt-2 space-y-1">
            <div className="h-1 w-6 bg-blue-400 rounded-full" />
            <div className="h-1 w-7 bg-blue-300 rounded-full" />
            <div className="h-1 w-5 bg-blue-300 rounded-full" />
          </div>
        </div>
        <div className="flex-1 p-2 space-y-2">
          <div>
            <div className="h-1.5 w-12 bg-blue-600 rounded-full mb-1" />
            <div className="h-1 w-full bg-gray-200 rounded-full" />
            <div className="h-1 w-16 bg-gray-200 rounded-full mt-0.5" />
          </div>
          <div>
            <div className="h-1.5 w-10 bg-blue-600 rounded-full mb-1" />
            <div className="h-1 w-full bg-gray-200 rounded-full" />
            <div className="h-1 w-14 bg-gray-200 rounded-full mt-0.5" />
          </div>
          <div>
            <div className="h-1.5 w-14 bg-blue-600 rounded-full mb-1" />
            <div className="h-1 w-full bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "executive") {
    return (
      <div className="w-36 h-48 bg-white rounded shadow-sm border border-gray-200 p-3 flex flex-col">
        <div className="border-b-2 border-gray-800 pb-2 mb-2">
          <div className="h-3 w-24 bg-gray-800 rounded-sm mx-auto" />
          <div className="flex justify-center gap-2 mt-1">
            <div className="h-1 w-10 bg-gray-400 rounded-full" />
            <div className="h-1 w-1 bg-gray-400 rounded-full" />
            <div className="h-1 w-12 bg-gray-400 rounded-full" />
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <div>
            <div className="h-1.5 w-16 bg-gray-800 rounded-sm mb-1 uppercase tracking-wider" />
            <div className="h-1 w-full bg-gray-200 rounded-full" />
            <div className="h-1 w-28 bg-gray-200 rounded-full mt-0.5" />
          </div>
          <div className="border-t border-gray-200 pt-1">
            <div className="h-1.5 w-14 bg-gray-800 rounded-sm mb-1" />
            <div className="h-1 w-full bg-gray-200 rounded-full" />
            <div className="h-1 w-20 bg-gray-200 rounded-full mt-0.5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-36 h-48 bg-white rounded shadow-sm border border-gray-200 p-3">
      <div className="h-2 w-16 bg-gray-300 rounded-full" />
      <div className="h-1 w-24 bg-gray-200 rounded-full mt-2" />
    </div>
  );
}
