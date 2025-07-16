# StudySync - Student Management System

## Overview

StudySync is a comprehensive student management system built with modern web technologies. It's a full-stack application that helps students manage their academic life including courses, assignments, notes, study groups, and progress tracking. The application uses a React frontend with TypeScript and shadcn/ui components, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a traditional monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: shadcn/ui components with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Structure**: Modern React with functional components and hooks
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI
- **Icons**: Heroicons and Lucide React icons
- **Responsive Design**: Mobile-first approach with responsive sidebar

### Backend Architecture
- **API Structure**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between frontend and backend
- **Storage Interface**: Abstract storage interface for database operations
- **Error Handling**: Centralized error handling middleware

### Database Schema
The database includes the following main entities:
- **Users**: User authentication and profile information
- **Courses**: Academic courses with metadata
- **Assignments**: Tasks with due dates, priorities, and grading
- **Notes**: Study notes with tagging and sharing capabilities
- **Study Groups**: Collaborative study sessions
- **Study Sessions**: Individual study tracking

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack React Query
2. **API Layer**: Express.js routes handle requests and validate data
3. **Business Logic**: Storage interface abstracts database operations
4. **Database Operations**: Drizzle ORM executes type-safe queries
5. **Response**: JSON responses sent back to client
6. **State Management**: React Query manages caching and synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for component variants

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

The application is configured for deployment with:

- **Build Process**: Vite builds the frontend, esbuild bundles the backend
- **Production Setup**: Node.js server serving static files and API
- **Database**: PostgreSQL with connection pooling
- **Environment**: Configuration through environment variables

### Development Workflow
1. **Development**: `npm run dev` starts both frontend and backend
2. **Type Checking**: `npm run check` validates TypeScript
3. **Database**: `npm run db:push` applies schema changes
4. **Build**: `npm run build` creates production bundle
5. **Production**: `npm start` runs the production server

The architecture prioritizes type safety, developer experience, and maintainability while providing a scalable foundation for a student management system.