# Resume Builder Tool

A full-stack web application where users can create, edit, and download professional resumes using predefined templates. Built with Next.js, Prisma, SQLite, and Tailwind CSS.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite via Prisma ORM
- **PDF Generation:** html2canvas + jsPDF
- **AI Assistance:** OpenAI API (with built-in fallback when no API key is configured)
- **Language:** TypeScript

## Features Implemented

### Resume Creation and Editing
- Create new resumes from the dashboard
- Edit all resume sections: personal info, work experience, education, skills, projects
- Auto-save with 1-second debounce so changes persist automatically
- Manual save button available in the editor toolbar
- Delete resumes from the dashboard

### Resume Templates
- **Classic (Free):** Traditional single-column layout with serif typography, suited for corporate and formal roles
- **Modern (Free):** Two-column layout with a blue sidebar, contact icons, and timeline markers for tech and creative roles
- **Executive (Paid):** Elegant serif template with refined spacing and uppercase section headers for senior professionals
- Each template has a different layout, different sections, and a different section order
- Template preview cards on the selection page show a miniature visual representation of each layout
- Switch templates from within the editor without losing data

### Premium / Paid Template Simulation
- The Executive template is locked behind a simulated paywall
- Selecting it opens an upgrade modal explaining premium benefits
- Clicking "Upgrade Now" sets the user's account to premium (no real payment)
- Once upgraded, the premium template is unlocked and usable

### PDF Download
- Download the current resume as a PDF directly from the editor
- The PDF captures the live preview exactly as rendered on screen
- Multi-page support for longer resumes
- File name is derived from the resume title

### AI Assistance
- **Generate Summary:** Creates a professional summary based on the user's name, role, and skills
- **Generate / Improve Work Experience:** Writes or enhances job descriptions with action verbs and quantifiable achievements
- **Suggest Skills:** Recommends relevant skills based on the user's field of study and job title
- Works with OpenAI API when a key is provided
- Falls back to a built-in content generator when no API key is configured, so the feature always works

### Authentication
- Simple email-based login (no password required)
- Entering an email and name either creates a new account or signs into an existing one
- User state persists across page reloads via localStorage backed by database records

## Setup Instructions

### Prerequisites
- Node.js 18 or later
- npm

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

3. Set up the environment file:
```
cp .env.example .env
```

4. (Optional) Add your OpenAI API key to `.env` if you want AI features to use the real API. If left blank, the built-in fallback generator handles all AI requests.

5. Run the Prisma migration to create the SQLite database:
```
npx prisma migrate dev
```

6. Start the development server:
```
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```
npm run build
npm start
```

## Project Structure

```
src/
  app/
    api/
      ai/           - AI content generation endpoint
      auth/          - User login/register endpoint
      resumes/       - Resume CRUD endpoints
      user/upgrade/  - Premium upgrade endpoint
    dashboard/       - User dashboard with resume list
    editor/[id]/     - Resume editor with live preview
    templates/       - Template selection page
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
  schema.prisma      - Database schema
```

## Assumptions

- No password-based authentication is implemented. The application uses email as a unique identifier for simplicity. In a production system this would be replaced with proper auth (OAuth, JWT, etc.).
- The premium upgrade is fully simulated. No payment gateway is integrated. Clicking the upgrade button instantly grants premium access.
- The AI fallback generator produces generic but contextually relevant content. It uses the user's input (name, position, company, field) to tailor the output without requiring an external API.
- SQLite is used as the database for portability. The entire database is a single file (`prisma/dev.db`) that gets created on first migration. For production, this could be swapped to PostgreSQL or MySQL by changing the Prisma datasource.
- PDF generation uses client-side rendering (html2canvas + jsPDF) to capture the preview exactly as displayed. This means the PDF quality matches what the user sees on screen.
- Resume data is stored entirely in the database. LocalStorage is only used for caching the current user session, not for resume content.