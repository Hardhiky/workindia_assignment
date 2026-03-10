"use client";

import { ResumeData } from "@/lib/types";

interface ModernTemplateProps {
  resume: ResumeData;
}

export default function ModernTemplate({ resume }: ModernTemplateProps) {
  const hasWorkExperiences = resume.workExperiences?.some(
    (w) => w.company || w.position
  );
  const hasEducations = resume.educations?.some(
    (e) => e.school || e.degree
  );
  const hasSkills = resume.skills?.some((s) => s.name);
  const hasProjects = resume.projects?.some((p) => p.name);
  const hasSummary = resume.summary?.trim();

  return (
    <div
      className="w-full bg-white text-gray-900 flex min-h-[700px]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <div className="w-[35%] bg-blue-700 text-white p-6 flex flex-col">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-500 mx-auto flex items-center justify-center text-3xl font-bold">
            {resume.fullName
              ? resume.fullName
                  .split(" ")
                  .map((n) => n.charAt(0))
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?"}
          </div>
          <h1 className="text-xl font-bold text-center mt-3 leading-tight">
            {resume.fullName || "Your Name"}
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-200 border-b border-blue-500 pb-1 mb-3">
            Contact
          </h2>
          <div className="space-y-2 text-sm">
            {resume.email && (
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="break-all text-blue-50">{resume.email}</span>
              </div>
            )}
            {resume.phone && (
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-blue-50">{resume.phone}</span>
              </div>
            )}
            {resume.location && (
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-blue-50">{resume.location}</span>
              </div>
            )}
            {resume.website && (
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span className="break-all text-blue-50">{resume.website}</span>
              </div>
            )}
          </div>
        </div>

        {hasSkills && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-200 border-b border-blue-500 pb-1 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills
                .filter((s) => s.name)
                .map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded"
                  >
                    {skill.name}
                  </span>
                ))}
            </div>
          </div>
        )}

        {hasEducations && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-200 border-b border-blue-500 pb-1 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {resume.educations
                .filter((e) => e.school || e.degree)
                .map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-white">
                      {edu.degree || "Degree"}
                    </h3>
                    {edu.field && (
                      <p className="text-xs text-blue-200">{edu.field}</p>
                    )}
                    <p className="text-xs text-blue-200 mt-0.5">
                      {edu.school || "School"}
                    </p>
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-xs text-blue-300 mt-0.5">
                        {edu.startDate}
                        {edu.startDate && edu.endDate ? " - " : ""}
                        {edu.endDate}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-[65%] p-6">
        {hasSummary && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b-2 border-blue-600 pb-1 mb-3">
              About Me
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {resume.summary}
            </p>
          </div>
        )}

        {hasWorkExperiences && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b-2 border-blue-600 pb-1 mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {resume.workExperiences
                .filter((w) => w.company || w.position)
                .map((work, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-blue-100">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          {work.position || "Position"}
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">
                          {work.company || "Company"}
                        </p>
                      </div>
                      {(work.startDate || work.endDate) && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-4 bg-gray-50 px-2 py-0.5 rounded">
                          {work.startDate}
                          {work.startDate && work.endDate ? " - " : ""}
                          {work.endDate}
                        </span>
                      )}
                    </div>
                    {work.description && (
                      <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-line leading-relaxed">
                        {work.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {hasProjects && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b-2 border-blue-600 pb-1 mb-3">
              Projects
            </h2>
            <div className="space-y-4">
              {resume.projects
                .filter((p) => p.name)
                .map((project, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-blue-100">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-gray-900">
                        {project.name}
                      </h3>
                      {project.url && (
                        <span className="text-xs text-blue-600 flex-shrink-0 ml-4">
                          {project.url}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-line leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
