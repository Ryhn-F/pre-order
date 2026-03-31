# Development Guide (PO Automation - XII Tel 13)

This guide provides instructions for setting up, running, and contributing to this project.

## Local Setup

### 1. Requirements

Ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **npm** or **Yarn** or **pnpm**
- **Git**

### 2. Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Ryhn-F/pre-order
cd po-automation
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Other configuration values if necessary
```

### 4. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

---

## Key Scripts

- **`npm run dev`**: Starts the development server with Hot Module Replacement (HMR).
- **`npm run build`**: Compiles and optimizes the app for production.
- **`npm run start`**: Runs the built version (use after `npm run build`).
- **`npm run lint`**: Checks the code for syntax errors and potential bugs.

---

## Best Practices & Contribution

- **Naming Convention**: Use **Kebab-case** for file names and **PascalCase** for React components.
- **Form Handling**: Always use `react-hook-form` paired with **Zod** schema validation.
- **Styling**: Stick to **Tailwind CSS** utility classes for consistency. Maintain responsiveness (mobile-first approach).
- **Git Workflow**:
  - Pull the latest changes from the `main` branch before starting.
  - Create a descriptive branch (e.g., `feature/order-export` or `fix/login-bug`).
  - Submit clear, concise pull requests.
