"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { ResumeData, WorkExperienceData, EducationData, SkillData, ProjectData } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function EditorPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "skills" | "projects">("personal");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showTemplateSwitch, setShowTemplateSwitch] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResume = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}`);
      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setFetching(false);
    }
  }, [resumeId, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (user && resumeId) {
      fetchResume();
    }
  }, [user, loading, router, resumeId, fetchResume]);

  const saveResume = useCallback(
    async (data: ResumeData) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setLastSaved(new Date());
        }
      } catch {
        // silent fail
      } finally {
        setSaving(false);
      }
    },
    [resumeId]
  );

  const updateResume = useCallback(
    (updates: Partial<ResumeData>) => {
      setResume((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveResume(updated);
        }, 1000);
        return updated;
      });
    },
    [saveResume]
  );

  const handleSaveNow = async () => {
    if (!resume) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveResume(resume);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      await handleSaveNow();
      await new Promise((r) => setTimeout(r, 200));

      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = resume?.title
        ? `${resume.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
        : "resume.pdf";
      pdf.save(fileName);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleAIGenerate = async (type: "summary" | "experience" | "skills", extraContext?: Record<string, string>) => {
    if (!resume) return;
    setAiLoading(type);
    try {
      const context: Record<string, unknown> = {
        fullName: resume.fullName,
        position: resume.workExperiences?.[0]?.position || "",
        company: resume.workExperiences?.[0]?.company || "",
        skills: resume.skills?.map((s) => s.name).filter(Boolean) || [],
        field: resume.educations?.[0]?.field || "",
        ...extraContext,
      };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context }),
      });

      if (res.ok) {
        const data = await res.json();
        if (type === "summary") {
          updateResume({ summary: data.result });
        } else if (type === "experience" && resume.workExperiences?.length > 0) {
          const updated = [...resume.workExperiences];
          updated[0] = { ...updated[0], description: data.result };
          updateResume({ workExperiences: updated });
        } else if (type === "skills") {
          const skillNames = data.result
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
          const newSkills: SkillData[] = skillNames.map((name: string, i: number) => ({
            name,
            sortOrder: i,
          }));
          updateResume({ skills: newSkills });
        }
      }
    } catch {
      alert("AI generation failed. Please try again.");
    } finally {
      setAiLoading(null);
    }
  };

  const addWorkExperience = () => {
    if (!resume) return;
    const newExp: WorkExperienceData = {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      sortOrder: resume.workExperiences.length,
    };
    updateResume({ workExperiences: [...resume.workExperiences, newExp] });
  };

  const removeWorkExperience = (index: number) => {
    if (!resume) return;
    const updated = resume.workExperiences.filter((_, i) => i !== index);
    updateResume({ workExperiences: updated });
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperienceData, value: string) => {
    if (!resume) return;
    const updated = [...resume.workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    updateResume({ workExperiences: updated });
  };

  const addEducation = () => {
    if (!resume) return;
    const newEdu: EducationData = {
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      sortOrder: resume.educations.length,
    };
    updateResume({ educations: [...resume.educations, newEdu] });
  };

  const removeEducation = (index: number) => {
    if (!resume) return;
    const updated = resume.educations.filter((_, i) => i !== index);
    updateResume({ educations: updated });
  };

  const updateEducation = (index: number, field: keyof EducationData, value: string) => {
    if (!resume) return;
    const updated = [...resume.educations];
    updated[index] = { ...updated[index], [field]: value };
    updateResume({ educations: updated });
  };

  const addSkill = () => {
    if (!resume) return;
    const newSkill: SkillData = {
      name: "",
      sortOrder: resume.skills.length,
    };
    updateResume({ skills: [...resume.skills, newSkill] });
  };

  const removeSkill = (index: number) => {
    if (!resume) return;
    const updated = resume.skills.filter((_, i) => i !== index);
    updateResume({ skills: updated });
  };

  const updateSkill = (index: number, value: string) => {
    if (!resume) return;
    const updated = [...resume.skills];
    updated[index] = { ...updated[index], name: value };
    updateResume({ skills: updated });
  };

  const addProject = () => {
    if (!resume) return;
    const newProject: ProjectData = {
      name: "",
      description: "",
      url: "",
      sortOrder: resume.projects.length,
    };
    updateResume({ projects: [...resume.projects, newProject] });
  };

  const removeProject = (index: number) => {
    if (!resume) return;
    const updated = resume.projects.filter((_, i) => i !== index);
    updateResume({ projects: updated });
  };

  const updateProject = (index: number, field: keyof ProjectData, value: string) => {
    if (!resume) return;
    const updated = [...resume.projects];
    updated[index] = { ...updated[index], [field]: value };
    updateResume({ projects: updated });
  };

  const handleTemplateSwitch = (templateId: string) => {
    updateResume({ templateId });
    setShowTemplateSwitch(false);
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !resume) return null;

  const currentTemplate = TEMPLATES.find((t) => t.id === resume.templateId);

  const tabs = [
    { id: "personal" as const, label: "Personal" },
    { id: "experience" as const, label: "Experience" },
    { id: "education" as const, label: "Education" },
    { id: "skills" as const, label: "Skills" },
    { id: "projects" as const, label: "Projects" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <input
                type="text"
                value={resume.title}
                onChange={(e) => updateResume({ title: e.target.value })}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-auto min-w-[200px]"
                placeholder="Resume Title"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTemplateSwitch(!showTemplateSwitch)}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors capitalize"
                >
                  {currentTemplate?.name || resume.templateId} Template
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {saving
                  ? "Saving..."
                  : lastSaved
                  ? `Saved at ${lastSaved.toLocaleTimeString()}`
                  : ""}
              </span>
              <button onClick={handleSaveNow} disabled={saving} className="btn-secondary text-sm py-1.5">
                Save
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="btn-primary text-sm py-1.5 flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTemplateSwitch && (
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 mb-2">Switch Template:</p>
            <div className="flex gap-3">
              {TEMPLATES.map((t) => {
                const locked = t.isPaid && !user.isPremium;
                return (
                  <button
                    key={t.id}
                    onClick={() => !locked && handleTemplateSwitch(t.id)}
                    disabled={locked}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      resume.templateId === t.id
                        ? "bg-blue-600 text-white"
                        : locked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t.name}
                    {locked && " (Premium)"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[480px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-xs font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.fullName}
                    onChange={(e) => updateResume({ fullName: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={resume.email}
                    onChange={(e) => updateResume({ email: e.target.value })}
                    className="input-field"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={resume.phone}
                    onChange={(e) => updateResume({ phone: e.target.value })}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={resume.location}
                    onChange={(e) => updateResume({ location: e.target.value })}
                    className="input-field"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Website / LinkedIn</label>
                  <input
                    type="text"
                    value={resume.website}
                    onChange={(e) => updateResume({ website: e.target.value })}
                    className="input-field"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-600">Summary</label>
                    <button
                      onClick={() => handleAIGenerate("summary")}
                      disabled={aiLoading === "summary"}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {aiLoading === "summary" ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                          </svg>
                          <span>AI Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={resume.summary}
                    onChange={(e) => updateResume({ summary: e.target.value })}
                    className="textarea-field"
                    rows={4}
                    placeholder="A brief professional summary about yourself..."
                  />
                </div>
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Work Experience</h3>
                  <button onClick={addWorkExperience} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    + Add Experience
                  </button>
                </div>

                {resume.workExperiences.map((work, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">
                        Experience {index + 1}
                      </span>
                      {resume.workExperiences.length > 1 && (
                        <button
                          onClick={() => removeWorkExperience(index)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Position / Title</label>
                      <input
                        type="text"
                        value={work.position}
                        onChange={(e) => updateWorkExperience(index, "position", e.target.value)}
                        className="input-field"
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                        className="input-field"
                        placeholder="Google"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={work.startDate}
                          onChange={(e) => updateWorkExperience(index, "startDate", e.target.value)}
                          className="input-field"
                          placeholder="Jan 2022"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                        <input
                          type="text"
                          value={work.endDate}
                          onChange={(e) => updateWorkExperience(index, "endDate", e.target.value)}
                          className="input-field"
                          placeholder="Present"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-600">Description</label>
                        {index === 0 && (
                          <button
                            onClick={() =>
                              handleAIGenerate("experience", {
                                position: work.position,
                                company: work.company,
                                experience: work.description,
                              })
                            }
                            disabled={aiLoading === "experience"}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            {aiLoading === "experience" ? (
                              <>
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                                </svg>
                                <span>{work.description ? "AI Improve" : "AI Generate"}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <textarea
                        value={work.description}
                        onChange={(e) => updateWorkExperience(index, "description", e.target.value)}
                        className="textarea-field"
                        rows={4}
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Education</h3>
                  <button onClick={addEducation} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    + Add Education
                  </button>
                </div>

                {resume.educations.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">
                        Education {index + 1}
                      </span>
                      {resume.educations.length > 1 && (
                        <button
                          onClick={() => removeEducation(index)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">School / University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(index, "school", e.target.value)}
                        className="input-field"
                        placeholder="Stanford University"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                        className="input-field"
                        placeholder="Bachelor of Science"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(index, "field", e.target.value)}
                        className="input-field"
                        placeholder="Computer Science"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                          className="input-field"
                          placeholder="Sep 2018"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                          className="input-field"
                          placeholder="Jun 2022"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Skills</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAIGenerate("skills")}
                      disabled={aiLoading === "skills"}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {aiLoading === "skills" ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Suggesting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                          </svg>
                          <span>AI Suggest</span>
                        </>
                      )}
                    </button>
                    <button onClick={addSkill} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      + Add Skill
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {resume.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        className="input-field"
                        placeholder="e.g. JavaScript, Python, Project Management"
                      />
                      {resume.skills.length > 1 && (
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Projects</h3>
                  <button onClick={addProject} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    + Add Project
                  </button>
                </div>

                {resume.projects.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">
                        Project {index + 1}
                      </span>
                      {resume.projects.length > 1 && (
                        <button
                          onClick={() => removeProject(index)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, "name", e.target.value)}
                        className="input-field"
                        placeholder="E-Commerce Platform"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                      <input
                        type="text"
                        value={project.url}
                        onChange={(e) => updateProject(index, "url", e.target.value)}
                        className="input-field"
                        placeholder="github.com/username/project"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, "description", e.target.value)}
                        className="textarea-field"
                        rows={3}
                        placeholder="Describe the project, technologies used, and your contributions..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-gray-100 overflow-y-auto p-8 flex justify-center">
          <div className="w-full max-w-[800px]">
            <div
              ref={previewRef}
              className="bg-white shadow-lg rounded-sm mx-auto p-8"
              style={{ minHeight: "1056px", width: "100%" }}
            >
              <TemplateRenderer resume={resume} templateId={resume.templateId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
