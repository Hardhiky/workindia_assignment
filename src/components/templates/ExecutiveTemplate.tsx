"use client";

import { ResumeData } from "@/lib/types";

interface ExecutiveTemplateProps {
  resume: ResumeData;
}

export default function ExecutiveTemplate({ resume }: ExecutiveTemplateProps) {
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
      className="w-full bg-white text-gray-900"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}
    >
      <div className="text-center pb-5 mb-6 border-b-[3px] border-gray-900">
        <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-gray-900">
          {resume.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 text-sm text-gray-500">
          {resume.email && <span>{resume.email}</span>}
          {resume.email && resume.phone && (
            <span className="text-gray-300">|</span>
          )}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.phone && resume.location && (
            <span className="text-gray-300">|</span>
          )}
          {resume.location && <span>{resume.location}</span>}
          {resume.location && resume.website && (
            <span className="text-gray-300">|</span>
          )}
          {resume.website && <span>{resume.website}</span>}
        </div>
      </div>

      {hasSummary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-900 mb-2">
            Executive Summary
          </h2>
          <div className="border-t border-gray-300 pt-3">
            <p className="text-sm leading-[1.8] text-gray-700 whitespace-pre-line italic">
              {resume.summary}
            </p>
          </div>
        </div>
      )}

      {hasWorkExperiences && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-900 mb-2">
            Professional Experience
          </h2>
          <div className="border-t border-gray-300 pt-3 space-y-5">
            {resume.workExperiences
              .filter((w) => w.company || w.position)
              .map((work, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900">
                        {work.position || "Position"}
                      </h3>
                      <p className="text-sm text-gray-600 italic">
                        {work.company || "Company"}
                      </p>
                    </div>
                    {(work.startDate || work.endDate) && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-4 tracking-wide">
                        {work.startDate}
                        {work.startDate && work.endDate ? " — " : ""}
                        {work.endDate}
                      </span>
                    )}
                  </div>
                  {work.description && (
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-line leading-[1.8]">
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
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-900 mb-2">
            Key Projects
          </h2>
          <div className="border-t border-gray-300 pt-3 space-y-4">
            {resume.projects
              .filter((p) => p.name)
              .map((project, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-[15px] font-bold text-gray-900">
                      {project.name}
                    </h3>
                    {project.url && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-4 italic">
                        {project.url}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-line leading-[1.8]">
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {hasEducations && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-900 mb-2">
            Education
          </h2>
          <div className="border-t border-gray-300 pt-3 space-y-3">
            {resume.educations
              .filter((e) => e.school || e.degree)
              .map((edu, idx) => (
                <div key={idx} className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">
                      {edu.degree || "Degree"}
                      {edu.field ? `, ${edu.field}` : ""}
                    </h3>
                    <p className="text-sm text-gray-600 italic">
                      {edu.school || "Institution"}
                    </p>
                  </div>
                  {(edu.startDate || edu.endDate) && (
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-4 tracking-wide">
                      {edu.startDate}
                      {edu.startDate && edu.endDate ? " — " : ""}
                      {edu.endDate}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {hasSkills && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-900 mb-2">
            Core Competencies
          </h2>
          <div className="border-t border-gray-300 pt-3">
            <div className="grid grid-cols-3 gap-x-6 gap-y-1.5">
              {resume.skills
                .filter((s) => s.name)
                .map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-800 rounded-full flex-shrink-0" />
                    <span className="text-sm text-gray-700">{skill.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
