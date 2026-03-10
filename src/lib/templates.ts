import { TemplateInfo } from "./types";

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "classic",
    name: "Classic",
    description: "A clean, traditional resume layout with a professional feel. Ideal for corporate and formal job applications.",
    isPaid: false,
    previewImage: "/templates/classic.png",
    sections: ["header", "summary", "workExperiences", "educations", "skills"],
    sectionOrder: ["header", "summary", "workExperiences", "educations", "skills"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "A contemporary two-column layout with accent colors. Great for tech, design, and creative roles.",
    isPaid: false,
    previewImage: "/templates/modern.png",
    sections: ["header", "summary", "workExperiences", "educations", "skills", "projects"],
    sectionOrder: ["header", "summary", "skills", "workExperiences", "projects", "educations"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "A premium template with elegant typography and refined spacing. Designed for senior professionals and leadership roles.",
    isPaid: true,
    previewImage: "/templates/executive.png",
    sections: ["header", "summary", "workExperiences", "projects", "educations", "skills"],
    sectionOrder: ["header", "summary", "workExperiences", "projects", "educations", "skills"],
  },
];

export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getFreeTemplates(): TemplateInfo[] {
  return TEMPLATES.filter((t) => !t.isPaid);
}

export function getPaidTemplates(): TemplateInfo[] {
  return TEMPLATES.filter((t) => t.isPaid);
}
