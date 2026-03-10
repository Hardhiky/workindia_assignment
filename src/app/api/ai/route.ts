import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return generateFallbackContent(prompt);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional resume writer. Provide concise, impactful content suitable for a resume. Do not use markdown formatting. Do not include any explanations or preamble, just the content itself.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      },
    );

    if (!response.ok) {
      return generateFallbackContent(prompt);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return generateFallbackContent(prompt);
    }

    return text;
  } catch {
    return generateFallbackContent(prompt);
  }
}

function generateFallbackContent(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("summary") || lower.includes("about")) {
    const name =
      extractBetween(prompt, "named ", ".") ||
      extractBetween(prompt, "named ", " ") ||
      "the candidate";
    return `Results-driven professional with a strong track record of delivering impactful solutions. ${name} brings a combination of technical expertise and strategic thinking to every project. Proven ability to collaborate across teams, meet tight deadlines, and continuously improve processes. Passionate about leveraging technology to solve real-world problems and drive business growth.`;
  }

  if (
    lower.includes("work experience") ||
    lower.includes("job description") ||
    lower.includes("role")
  ) {
    const position =
      extractBetween(prompt, "position: ", "\n") ||
      extractBetween(prompt, "position: ", ".") ||
      "Professional";
    const company =
      extractBetween(prompt, "company: ", "\n") ||
      extractBetween(prompt, "company: ", ".") ||
      "the organization";
    return `Led key initiatives as ${position} at ${company}, driving measurable improvements in team productivity and project delivery. Collaborated with cross-functional teams to design and implement scalable solutions. Identified and resolved critical bottlenecks, reducing turnaround time by 30%. Mentored junior team members and contributed to a culture of continuous learning and technical excellence.`;
  }

  if (lower.includes("skills") || lower.includes("suggest skills")) {
    const field =
      extractBetween(prompt, "field: ", "\n") ||
      extractBetween(prompt, "field: ", ".") ||
      "";
    if (
      field.toLowerCase().includes("software") ||
      field.toLowerCase().includes("developer") ||
      field.toLowerCase().includes("engineer") ||
      field.toLowerCase().includes("programming")
    ) {
      return "JavaScript, TypeScript, Python, React, Node.js, SQL, Git, REST APIs, Docker, AWS, Agile Methodologies, Problem Solving, System Design, CI/CD";
    }
    if (
      field.toLowerCase().includes("design") ||
      field.toLowerCase().includes("ui") ||
      field.toLowerCase().includes("ux")
    ) {
      return "Figma, Adobe Creative Suite, UI/UX Design, Wireframing, Prototyping, User Research, Design Systems, Responsive Design, Accessibility, HTML/CSS";
    }
    if (
      field.toLowerCase().includes("data") ||
      field.toLowerCase().includes("analyst") ||
      field.toLowerCase().includes("science")
    ) {
      return "Python, SQL, Pandas, NumPy, Tableau, Power BI, Statistical Analysis, Machine Learning, Data Visualization, Excel, R, ETL Pipelines";
    }
    if (
      field.toLowerCase().includes("market") ||
      field.toLowerCase().includes("sales")
    ) {
      return "Digital Marketing, SEO, SEM, Content Strategy, Social Media Marketing, Google Analytics, CRM Tools, Email Marketing, A/B Testing, Brand Management";
    }
    return "Project Management, Communication, Problem Solving, Team Leadership, Critical Thinking, Time Management, Adaptability, Strategic Planning, Data Analysis, Presentation Skills";
  }

  if (
    lower.includes("improve") ||
    lower.includes("rewrite") ||
    lower.includes("enhance")
  ) {
    return "Spearheaded the development and execution of high-impact initiatives that drove significant business outcomes. Streamlined operational workflows resulting in a 25% increase in efficiency. Partnered with stakeholders across departments to align project goals with organizational strategy. Delivered all milestones on time and within budget while maintaining exceptional quality standards.";
  }

  return "Dedicated professional with extensive experience delivering results in fast-paced environments. Strong analytical and communication skills with a proven ability to manage multiple priorities effectively.";
}

function extractBetween(text: string, start: string, end: string): string {
  const startIdx = text.toLowerCase().indexOf(start.toLowerCase());
  if (startIdx === -1) return "";
  const afterStart = startIdx + start.length;
  const endIdx = text.indexOf(end, afterStart);
  if (endIdx === -1) return text.substring(afterStart).trim();
  return text.substring(afterStart, endIdx).trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, context } = body;

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    let prompt = "";

    switch (type) {
      case "summary": {
        const name = context?.fullName || "a professional";
        const position = context?.position || "";
        const skills = context?.skills?.filter(Boolean)?.join(", ") || "";
        prompt = `Write a professional resume summary for a person named ${name}.`;
        if (position) prompt += ` They work as a ${position}.`;
        if (skills) prompt += ` Their key skills include: ${skills}.`;
        prompt +=
          " Keep it to 3-4 sentences. Make it impactful and achievement-oriented.";
        break;
      }

      case "experience": {
        const position = context?.position || "professional";
        const company = context?.company || "a company";
        const existing = context?.experience || "";
        if (existing) {
          prompt = `Improve and enhance the following work experience description for a ${position} role at ${company}. Make it more impactful with action verbs and quantifiable achievements where possible. Current description: "${existing}"`;
        } else {
          prompt = `Write 3-4 bullet points for a resume work experience section. Position: ${position}. Company: ${company}. Use strong action verbs and focus on achievements and impact. Separate each point with a newline.`;
        }
        break;
      }

      case "skills": {
        const field = context?.field || "general professional";
        const position = context?.position || "";
        prompt = `Suggest 10-12 relevant skills for a resume. Field: ${field}.`;
        if (position) prompt += ` Position: ${position}.`;
        prompt +=
          " Return them as a comma-separated list. Include both technical and soft skills.";
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid type. Must be summary, experience, or skills." },
          { status: 400 },
        );
    }

    const result = await callGemini(prompt);

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
