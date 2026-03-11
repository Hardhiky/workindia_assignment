# Resume Builder Tool

A full-stack web application where users can create, edit, and download professional resumes using predefined templates. Built with Next.js, Prisma, PostgreSQL (Neon), and Tailwind CSS. Deployed on Vercel.

## Live Demo

[https://workindia-assignment.vercel.app](https://workindia-assignment.vercel.app)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL via Neon (free tier) + Prisma ORM
- **PDF Generation:** html2canvas + jsPDF
- **AI Assistance:** Google Gemini API - free tier (with built-in fallback when no API key is configured)
- **Deployment:** Vercel
- **Language:** TypeScript

## Features Implemented

### Resume Creation and Editing
- Create new resumes from the dashboard
- Edit all resume sections: personal info, work experience, education, skills, projects
- Auto-save with 1-second debounce so changes persist automatically
- Manual save button and a Done button that saves and returns to the dashboard
- Delete resumes from the dashboard

### Resume Templates
- **Classic (Free):** Traditional single-column layout with serif typography, suited for corporate and formal roles
- **Modern (Free):** Two-column layout with a blue sidebar, contact icons, and timeline markers for tech and creative roles
- **Executive (Paid):** Elegant serif template with refined spacing and uppercase section headers for senior professionals
- Each template has a different layout, different sections, and a different section order
- Template preview cards on the selection page show a miniature visual representation of each layout
- Switch templates from within the editor without losing data

### Premium / Paid Template with Paywall
- The Executive template is locked behind a simulated paywall
- Selecting it opens a multi-step checkout flow:
  - Step 1: Plan info screen showing $0.00 pricing and premium benefits
  - Step 2: Full card payment form with card number, expiry, CVC, and cardholder name (validates format but never charges)
  - Step 3: Processing animation with spinner
  - Step 4: Success confirmation with green checkmark
- No real payment is processed. The form accepts any valid-format card details.
- Once upgraded the premium template is unlocked permanently for that account

### PDF Download
- Download the current resume as a PDF directly from the editor
- The PDF captures the live preview exactly as rendered on screen
- Multi-page support for longer resumes
- File name is derived from the resume title

### AI Assistance
- **Generate Summary:** Creates a professional summary based on the user's name, role, and skills
- **Generate / Improve Work Experience:** Writes or enhances job descriptions with action verbs and quantifiable achievements
- **Suggest Skills:** Recommends relevant skills based on the user's field of study and job title
- Works with Google Gemini API (free tier) when a key is provided
- Falls back to a built-in content generator when no API key is configured, so the feature always works

### Authentication
- Simple email-based login (no password required)
- Entering an email and name either creates a new account or signs into an existing one
- User state persists across page reloads via localStorage backed by database records

## Setup Instructions (Local Development)

### Prerequisites
- Node.js 18 or later
- npm
- A PostgreSQL database (Neon free tier recommended)

### Installation

1. Clone the repository:
```
git clone git@github.com:Hardhiky/workindia_assignment.git
cd workindia_assignment
```

2. Install dependencies:
```
npm install
```

3. Create a free PostgreSQL database at https://console.neon.tech/signup and copy the connection string.

4. Create a `.env` file in the project root:
```
DATABASE_URL=postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
```
Replace the DATABASE_URL and DIRECT_URL with your Neon connection strings. Get a free Gemini API key at https://aistudio.google.com/apikey (optional, the app works without it).

5. Push the schema to your database:
```
npx prisma db push
```

6. Start the development server:
```
npm run dev
```

7. Open http://localhost:3000 in your browser.

## Deployment on Vercel

### Step 1: Create a Neon Database
1. Go to https://console.neon.tech and sign up (free)
2. Create a new project
3. Copy the connection string from the dashboard (it looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

### Step 2: Deploy to Vercel
1. Go to https://vercel.com and sign in with your GitHub account
2. Click "Add New" then "Project"
3. Import the `Hardhiky/workindia_assignment` repository
4. In the "Environment Variables" section, add:
   - `DATABASE_URL` = your Neon pooled connection string
   - `DIRECT_URL` = your Neon direct (non-pooled) connection string
   - `GEMINI_API_KEY` = your Google Gemini API key
5. Click "Deploy"
6. The build command (`prisma generate && prisma db push && next build`) will automatically create the database tables and build the app

### Step 3: Done
Your app is live. Vercel will automatically redeploy on every push to the main branch.

## Project Structure

```
src/
  app/
    api/
      ai/           - AI content generation endpoint (Gemini API)
      auth/          - User login/register endpoint
      resumes/       - Resume CRUD endpoints
      user/upgrade/  - Premium upgrade endpoint
    dashboard/       - User dashboard with resume list
    editor/[id]/     - Resume editor with live preview
    templates/       - Template selection page with paywall
  components/
    templates/       - Template renderer components (Classic, Modern, Executive)
    Navbar.tsx       - Navigation bar
  context/
    UserContext.tsx   - User authentication state
  lib/
    prisma.ts        - Prisma client singleton
    templates.ts     - Template definitions
    types.ts         - Shared TypeScript interfaces
prisma/
  schema.prisma      - Database schema (PostgreSQL)
```

## Assumptions

- No password-based authentication is implemented. The application uses email as a unique identifier for simplicity. In a production system this would be replaced with proper auth (OAuth, JWT, etc.).
- The premium upgrade uses a simulated paywall with a full card payment form. No real payment gateway is integrated. The form validates card number format (16 digits), expiry date format, CVC (3 digits), and cardholder name, but accepts any values and never charges anything.
- The AI fallback generator produces generic but contextually relevant content. It uses the user's input (name, position, company, field) to tailor the output without requiring an external API.
- PostgreSQL (Neon) is used as the database for production deployment on Vercel. For local development you can also use any PostgreSQL instance.
- PDF generation uses client-side rendering (html2canvas + jsPDF) to capture the preview exactly as displayed. This means the PDF quality matches what the user sees on screen.
- Resume data is stored entirely in the database. LocalStorage is only used for caching the current user session, not for resume content.