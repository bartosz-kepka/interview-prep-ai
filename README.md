# InterviewPrep AI

[![Project Status: MVP](https://img.shields.io/badge/status-MVP-green.svg)](https://shields.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

InterviewPrep AI is a web application designed to help job candidates effectively prepare for interviews. It allows users to generate a personalized set of interview questions directly from the text of a job posting, moving beyond generic, one-size-fits-all question lists.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

- **Frontend**: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, BaaS)
- **AI Integration**: Openrouter.ai
- **CI/CD & Hosting**: GitHub Actions, DigitalOcean (Docker)

## Getting Started Locally

To set up and run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/interview-prep-ai.git
    cd interview-prep-ai
    ```

2.  **Set the Node.js version:**
    The project requires Node.js version `22.14.0`. We recommend using a version manager like `nvm`.
    ```bash
    nvm use
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary environment variables for Supabase and Openrouter.ai.
    ```env
    # Supabase
    PUBLIC_SUPABASE_URL="your-supabase-url"
    PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

    # Openrouter.ai
    OPENROUTER_API_KEY="your-openrouter-api-key"
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Available Scripts

The following scripts are available in the `package.json`:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Lints the codebase for errors.
- `npm run lint:fix`: Lints the codebase and automatically fixes issues.
- `npm run format`: Formats the code using Prettier.

## Project Scope

### MVP Features

- **User Authentication**: Secure user registration, login, email verification, and password reset.
- **Manual Question Management (CRUD)**: Users can create, view, edit, and delete their own interview questions and answers.
- **AI Question Generator**: Generate 10-15 relevant interview questions by pasting the text of a job description.
- **Search**: Real-time, case-insensitive search through question titles.
- **Responsive Design**: A mobile-first approach ensures a seamless experience on all devices.

### Out of Scope for MVP

The following features are planned for future releases and are not part of the current MVP:

- Question categorization and "interview session" folders.
- AI-powered evaluation of user answers.
- Real-time mock interview simulations.
- Analytics and progress tracking.
- Social logins (e.g., Google, LinkedIn).

## Project Status

The project is currently in the **Minimum Viable Product (MVP)** development phase. The core features are being implemented, and the application is not yet considered production-ready.

## License

This project is licensed under the MIT License.

## Dev Notes

- As of Supabase CLI version 2.48.x, to get the anon key (used for `SUPABASE_KEY` env variable) , you need to use the `supabase status -o env` command.
