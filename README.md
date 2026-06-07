# WeDo: Project Collaboration Platform

WeDo is a project management and collaboration platform designed for dynamic teams. Built with flexibility, WeDo allows teams to manage their workflows with custom-tailored Kanban boards, real-time collaboration features, and a seamless invitation system.

## Key Features

- **Customizable Kanban Boards:** Define your own project stages that adapt to your team's unique workflow.
- **Role-Based Access Control:** Secure project management with distinct roles (Owner/Member) and granular permission handling.
- **Collaborative Invitation System:** Easily invite team members to projects and manage invitations securely.
- **Privacy-First Design:** Role-restricted access ensures that sensitive project data remains protected.

## Architecture Highlights

WeDo is built with a modern tech stack and adheres to professional design patterns to ensure maintainability:

- **Facade Pattern:** Streamlines dashboard operations by aggregating project status, tasks, and invitations into a single, efficient API call.
- **Strategy Pattern:** Manages complex access logic for task manipulation based on user roles (Owner vs. Member).
- **Builder Pattern:** Facilitates dynamic project and board creation, allowing for flexible stage configurations.

## Tech Stack

### Backend

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL/MySQL
- **ORM:** Prisma

### Frontend

- **Framework:** React
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Installation & Setup

### Prerequisites

- Node.js (v18+)
- Database (MySQL)

### Backend

1. Clone the repository.
2. Navigate to the `backend` folder.
3. Install dependencies: `npm install`
4. Set up your `.env` file with database credentials.
5. Run migrations: `npx prisma migrate dev`
6. Start the server: `npm run start:dev`

### Frontend

1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`
