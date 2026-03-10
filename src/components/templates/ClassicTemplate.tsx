"use client";

import { ResumeData } from "@/lib/types";

interface ClassicTemplateProps {
  resume: ResumeData;
}

export default function ClassicTemplate({ resume }: ClassicTemplateProps) {
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
    <div className="w-full bg-white text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
      <div className="text-center pb-4 border-b-2 border-gray-800 mb-6">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          {resume.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.website && <span>{resume.website}</span>}
        </div>
      </div>

      {hasSummary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
            Summary
          </h2>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {resume.summary}
          </p>
        </div>
      )}

      {hasWorkExperiences && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
            Work Experience
          </h2>
          <div className="space-y-4">
            {resume.workExperiences
              .filter((w) => w.company || w.position)
              .map((work, idx) => (
                <div key={idx}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {work.position || "Position"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {work.company || "Company"}
                      </p>
                    </div>
                    {(work.startDate || work.endDate) && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                        {work.startDate}
                        {work.startDate && work.endDate ? " - " : ""}
                        {work.endDate}
                      </span>
                    )}
                  </div>
                  {work.description && (
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
                      {work.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {hasEducations && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-3">
            {resume.educations
              .filter((e) => e.school || e.degree)
              .map((edu, idx) => (
                <div key={idx}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {edu.degree || "Degree"}
                        {edu.field ? ` in ${edu.field}` : ""}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {edu.school || "School"}
                      </p>
                    </div>
                    {(edu.startDate || edu.endDate) && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                        {edu.startDate}
                        {edu.startDate && edu.endDate ? " - " : ""}
                        {edu.endDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {hasSkills && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2 mt-1">
            {resume.skills
              .filter((s) => s.name)
              .map((skill, idx) => (
                <span
                  key={idx}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded"
                >
                  {skill.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {hasProjects && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
            Projects
          </h2>
          <div className="space-y-3">
            {resume.projects
              .filter((p) => p.name)
              .map((project, idx) => (
                <div key={idx}>
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
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
