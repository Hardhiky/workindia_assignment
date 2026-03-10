"use client";

import { ResumeData } from "@/lib/types";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";

interface TemplateRendererProps {
  resume: ResumeData;
  templateId: string;
}

export default function TemplateRenderer({ resume, templateId }: TemplateRendererProps) {
  switch (templateId) {
    case "classic":
      return <ClassicTemplate resume={resume} />;
    case "modern":
      return <ModernTemplate resume={resume} />;
    case "executive":
      return <ExecutiveTemplate resume={resume} />;
    default:
      return <ClassicTemplate resume={resume} />;
  }
}
