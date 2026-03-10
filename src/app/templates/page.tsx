"use client";

import { useState, useEffect } from "react";
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
  const [selectedPreview, setSelectedPreview] = useState<TemplateInfo | null>(
    null,
  );
  const [paymentStep, setPaymentStep] = useState<
    "info" | "form" | "processing" | "success"
  >("info");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSelectTemplate = async (template: TemplateInfo) => {
    if (template.isPaid && !user.isPremium) {
      setSelectedPreview(template);
      setPaymentStep("info");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardName("");
      setPaymentError("");
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

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + " / " + digits.slice(2);
    }
    return digits;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    const digitsOnly = cardNumber.replace(/\s/g, "");
    if (digitsOnly.length < 16) {
      setPaymentError("Please enter a valid 16-digit card number");
      return;
    }

    const expiryDigits = cardExpiry.replace(/\D/g, "");
    if (expiryDigits.length < 4) {
      setPaymentError("Please enter a valid expiry date (MM/YY)");
      return;
    }
    const month = parseInt(expiryDigits.slice(0, 2));
    if (month < 1 || month > 12) {
      setPaymentError("Invalid expiry month");
      return;
    }

    if (cardCvc.replace(/\D/g, "").length < 3) {
      setPaymentError("Please enter a valid 3-digit CVC");
      return;
    }

    if (cardName.trim().length < 2) {
      setPaymentError("Please enter the cardholder name");
      return;
    }

    setPaymentStep("processing");

    await new Promise((r) => setTimeout(r, 2500));

    setUpgrading(true);
    try {
      await upgradeToPremium();
      setPaymentStep("success");
      await new Promise((r) => setTimeout(r, 2000));
      setSelectedPreview(null);
      setPaymentStep("info");
    } catch {
      setPaymentStep("form");
      setPaymentError("Payment failed. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const closeModal = () => {
    setSelectedPreview(null);
    setPaymentStep("info");
    setPaymentError("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Choose a Template
          </h1>
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
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      SECTIONS
                    </p>
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
          <div className="card max-w-lg w-full overflow-hidden">
            {paymentStep === "processing" && (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  Processing payment...
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Please do not close this window
                </p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  Payment successful
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Premium templates are now unlocked
                </p>
              </div>
            )}

            {paymentStep === "info" && (
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Upgrade to Premium
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-gray-500 text-sm">
                  Unlock the {selectedPreview.name} template and all premium
                  features with a one-time payment.
                </p>

                <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Premium Plan
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lifetime access
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">$0.00</p>
                      <p className="text-xs text-green-600 font-medium">
                        FREE for demo
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-4 h-4 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        All premium templates unlocked
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-4 h-4 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        Executive layouts and designs
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-4 h-4 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        Future template updates included
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-4 h-4 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        Priority support
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStep("form")}
                  className="mt-6 btn-primary w-full py-3 text-sm"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={closeModal}
                  className="mt-2 w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            )}

            {paymentStep === "form" && (
              <div>
                <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Total:</span>
                    <span className="text-lg font-bold">$0.00</span>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Payment Details
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPaymentStep("info")}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Back
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        className="input-field pl-10"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                      <svg
                        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        className="input-field"
                        placeholder="MM / YY"
                        maxLength={7}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) =>
                          setCardCvc(
                            e.target.value.replace(/\D/g, "").slice(0, 3),
                          )
                        }
                        className="input-field"
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <p className="text-sm text-red-600">{paymentError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={upgrading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Pay $0.00 and Upgrade
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>No real charge</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    This is a simulated checkout. No real payment is processed.
                    Enter any values in the fields above.
                  </p>
                </form>
              </div>
            )}
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
