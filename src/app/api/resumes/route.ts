import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        workExperiences: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        projects: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, templateId, title } = body;

    if (!userId || !templateId) {
      return NextResponse.json(
        { error: "userId and templateId are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resume = await prisma.resume.create({
      data: {
        userId,
        templateId,
        title: title || "Untitled Resume",
        workExperiences: {
          create: [
            {
              company: "",
              position: "",
              startDate: "",
              endDate: "",
              description: "",
              sortOrder: 0,
            },
          ],
        },
        educations: {
          create: [
            {
              school: "",
              degree: "",
              field: "",
              startDate: "",
              endDate: "",
              sortOrder: 0,
            },
          ],
        },
        skills: {
          create: [{ name: "", sortOrder: 0 }],
        },
        projects: {
          create: [
            {
              name: "",
              description: "",
              url: "",
              sortOrder: 0,
            },
          ],
        },
      },
      include: {
        workExperiences: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        projects: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
