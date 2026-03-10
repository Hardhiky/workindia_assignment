import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        workExperiences: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        projects: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.resume.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const {
      templateId,
      title,
      fullName,
      email,
      phone,
      location,
      website,
      summary,
      workExperiences,
      educations,
      skills,
      projects,
    } = body;

    await prisma.$transaction(async (tx) => {
      await tx.resume.update({
        where: { id },
        data: {
          ...(templateId !== undefined && { templateId }),
          ...(title !== undefined && { title }),
          ...(fullName !== undefined && { fullName }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(location !== undefined && { location }),
          ...(website !== undefined && { website }),
          ...(summary !== undefined && { summary }),
        },
      });

      if (workExperiences !== undefined) {
        await tx.workExperience.deleteMany({ where: { resumeId: id } });
        if (workExperiences.length > 0) {
          await tx.workExperience.createMany({
            data: workExperiences.map(
              (
                w: {
                  company: string;
                  position: string;
                  startDate: string;
                  endDate: string;
                  description: string;
                  sortOrder: number;
                },
                i: number
              ) => ({
                resumeId: id,
                company: w.company || "",
                position: w.position || "",
                startDate: w.startDate || "",
                endDate: w.endDate || "",
                description: w.description || "",
                sortOrder: w.sortOrder ?? i,
              })
            ),
          });
        }
      }

      if (educations !== undefined) {
        await tx.education.deleteMany({ where: { resumeId: id } });
        if (educations.length > 0) {
          await tx.education.createMany({
            data: educations.map(
              (
                e: {
                  school: string;
                  degree: string;
                  field: string;
                  startDate: string;
                  endDate: string;
                  sortOrder: number;
                },
                i: number
              ) => ({
                resumeId: id,
                school: e.school || "",
                degree: e.degree || "",
                field: e.field || "",
                startDate: e.startDate || "",
                endDate: e.endDate || "",
                sortOrder: e.sortOrder ?? i,
              })
            ),
          });
        }
      }

      if (skills !== undefined) {
        await tx.skill.deleteMany({ where: { resumeId: id } });
        if (skills.length > 0) {
          await tx.skill.createMany({
            data: skills.map(
              (s: { name: string; sortOrder: number }, i: number) => ({
                resumeId: id,
                name: s.name || "",
                sortOrder: s.sortOrder ?? i,
              })
            ),
          });
        }
      }

      if (projects !== undefined) {
        await tx.project.deleteMany({ where: { resumeId: id } });
        if (projects.length > 0) {
          await tx.project.createMany({
            data: projects.map(
              (
                p: {
                  name: string;
                  description: string;
                  url: string;
                  sortOrder: number;
                },
                i: number
              ) => ({
                resumeId: id,
                name: p.name || "",
                description: p.description || "",
                url: p.url || "",
                sortOrder: p.sortOrder ?? i,
              })
            ),
          });
        }
      }
    });

    const updated = await prisma.resume.findUnique({
      where: { id },
      include: {
        workExperiences: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        projects: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ resume: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.resume.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
