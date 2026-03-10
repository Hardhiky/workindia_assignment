export interface WorkExperienceData {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  sortOrder: number;
}

export interface EducationData {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

export interface SkillData {
  id?: string;
  name: string;
  sortOrder: number;
}

export interface ProjectData {
  id?: string;
  name: string;
  description: string;
  url: string;
  sortOrder: number;
}

export interface ResumeData {
  id?: string;
  userId?: string;
  templateId: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  workExperiences: WorkExperienceData[];
  educations: EducationData[];
  skills: SkillData[];
  projects: ProjectData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  isPaid: boolean;
  previewImage: string;
  sections: string[];
  sectionOrder: string[];
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
}

export interface AIGenerateRequest {
  type: "summary" | "experience" | "skills";
  context: {
    fullName?: string;
    position?: string;
    company?: string;
    skills?: string[];
    experience?: string;
    field?: string;
  };
}

export interface AIGenerateResponse {
  result: string;
  error?: string;
}
