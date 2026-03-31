# Tech Stack (PO Automation - XII Tel 13)

This project uses modern web development technologies to ensure performance, scalability, and an excellent developer experience.

## Core Framework & Logic

- **Next.js 16 (App Router)**: React-based framework for server-side rendering, routing, and efficient builds.
- **TypeScript**: Typed JavaScript for better code safety and clarity.
- **React 19**: Utilizing the latest React features for a dynamic UI.

## Styling & Components

- **Tailwind CSS 4**: A utility-first CSS framework for rapid and responsive UI development.
- **Radix UI**: Foundational headless components (Dialog, Select, Dropdown, etc.) for accessibility and robustness.
- **Lucide React**: Clean, modern icons for a professional appearance.
- **Sonner**: High-performance toast notification system.

## Backend & Database

- **Supabase**: A backend-as-a-service using PostgreSQL, used for data storage and real-time capabilities.
- **Custom Auth Middleware**: Role-based access control protecting `/dashboard` routes, utilizing Base64-encoded session tokens for simplicity and speed.

## Forms & Validation

- **React Hook Form**: Flexible and performant form state management.
- **Zod**: TypeScript-first schema validation for both client and API inputs.

## API Architecture

- **Next.js Route Handlers**: RESTful API endpoints for:
  - Product fetching (`/api/products`)
  - Order creation (`/api/create-order`)
  - Dashboard analytics and data exporting (`/api/dashboard/export`)
