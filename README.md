# CamCol - Campus Collaboration Platform

<div align="center">

![CamCol Logo](https://img.shields.io/badge/CamCol-Campus_Collaboration-blue?style=for-the-badge)

**A Full-Stack Web Application for Student Gig Discovery, Peer Collaboration, and Campus Opportunity Management**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About

CamCol (Campus Collaboration Platform) is a hyperlocal, student-focused digital marketplace designed to bridge the gap between skills and opportunities within college campuses. Students can:

- 🎨 Publish services and gigs (design, coding, content writing, etc.)
- 🤝 Browse and collaborate on projects
- 💬 Communicate directly with peers
- ⭐ Exchange reviews and ratings
- 📊 Build trust scores based on reliability

The platform operates as a **peer-to-peer ecosystem** where students can efficiently monetize their skills, find affordable help for academic projects, and collaborate on mini-projects within their campus community.

### The Problem We Solve

Modern college campuses are filled with talented students possessing diverse technical and creative competencies. However, without a structured platform:
- Skills often go unused
- Students struggle to find affordable, peer-sourced help
- Collaboration opportunities are missed
- Campus talent remains untapped

CamCol creates a **structured, campus-specific marketplace** that connects students efficiently and builds a sustainable collaboration ecosystem.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based stateless authentication
- Automatic token refresh mechanism
- Protected route enforcement
- Secure password hashing with bcrypt

### 💼 Gig Management
- Create and publish service offerings
- Browse gigs with advanced filters (category, price, rating)
- Search functionality for quick discovery
- Gig detail pages with provider profiles

### 🚀 Project Collaboration
- Post collaborative projects with required skills
- Request to join projects
- Team management and member approval
- Project progress tracking

### ⭐ Review & Rating System
- 5-star rating system
- Written reviews for completed orders
- Trust score calculation (0-100)
- Historical reliability metrics

### 💬 Messaging System
- Real-time direct messaging between users
- Inbox with conversation threads
- Message history persistence
- User presence indicators

### 📦 Order Management
- Order creation and tracking
- Status updates (Pending, In Progress, Completed, Cancelled)
- Order history and analytics
- Payment tracking

### 👤 User Profiles
- Public profile pages
- Skills and bio showcase
- Portfolio integration
- Average rating and review count

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool with HMR
- **Tailwind CSS v4** - Utility-first CSS framework
- **Axios** - Promise-based HTTP client with interceptors
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Minimalist web framework
- **PostgreSQL** - ACID-compliant relational database
- **JWT** - Stateless authentication tokens
- **bcrypt** - Password hashing

### Architecture Patterns
- **MVC (Model-View-Controller)** - Clear separation of concerns
- **RESTful API** - Resource-based API design
- **Modular Architecture** - Dedicated route, controller, and middleware layers
- **Centralized Error Handling** - Consistent error responses
- **Request/Response Interceptors** - Automatic token injection and error normalization

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │    Pages     │  │   Services   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Axios Client  │                        │
│                    │  (Interceptors)│                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                      Backend (Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Routes    │─▶│ Controllers  │─▶│    Models    │       │
│  └──────────────┘  └──────────────┘  └──────┬───────┘       │
│         │                                     │               │
│  ┌──────▼──────────────────┐                 │               │
│  │  Middleware (Auth/Err)  │                 │               │
│  └─────────────────────────┘                 │               │
└───────────────────────────────────────────────┼───────────────┘
                                                │
                                         ┌──────▼───────┐
                                         │  PostgreSQL  │
                                         └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Mrutyunjaya22/camcol-project.git
cd camcol-project
```

2. **Install Backend Dependencies**

```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

4. **Set Up Database**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE camcol;

# Run migrations (if available)
# npm run migrate
```

5. **Configure Environment Variables**

Create `.env` files in both `backend` and `frontend` directories (see [Environment Variables](#environment-variables) section).

6. **Start the Development Servers**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=camcol
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=CamCol
```

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/auth/me` | Get authenticated user profile | Yes |

### Gig Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gigs` | List all gigs with filters | Yes |
| POST | `/api/gigs` | Create a new gig | Yes |
| GET | `/api/gigs/:id` | Get gig details | Yes |
| PUT | `/api/gigs/:id` | Update own gig | Yes |
| DELETE | `/api/gigs/:id` | Delete own gig | Yes |

### Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | List projects with skill filter | Yes |
| POST | `/api/projects` | Create new project | Yes |
| GET | `/api/projects/:id` | Get project details + team | Yes |
| POST | `/api/projects/:id/join` | Request to join project | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order on gig | Yes |
| PATCH | `/api/orders/:id/status` | Update order status | Yes |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reviews` | Submit review for completed order | Yes |

### Messaging Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/messages` | Send message | Yes |
| GET | `/api/messages/inbox` | Get inbox conversation list | Yes |
| GET | `/api/messages/:userId` | Get message thread with user | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:id` | Get user public profile | Yes |
| PATCH | `/api/users/:id` | Update own profile | Yes |

### Request/Response Examples

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePass123!",
  "name": "John Doe",
  "skills": ["Web Development", "UI/UX Design"]
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@university.edu",
    "name": "John Doe",
    "trustScore": 50
  }
}
```

---

## 📁 Project Structure

```
camcol-project/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, error handling
│   │   ├── config/           # Configuration files
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env
│
└── README.md
```

---

## 👥 Team

CamCol is developed by students of the 6th Semester, B.Tech (Computer Science & Engineering), C.V. Raman Global University, Bhubaneswar, Odisha.

**Development Team:**
- **Sai Suman Samantaray** - Roll No: 2301020565
- **Suvrajit Senapati**
- **Sanjay Kumar Sahoo**
- **Satya Spandan Rout**
- **Rohan Anand**

**Institution:** C.V. Raman Global University, Bhubaneswar  
**Department:** Computer Science & Engineering  
**Academic Year:** 2025-26

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📜 License

This project is developed as an academic project at C.V. Raman Global University. All rights reserved by the development team.

For commercial use or redistribution, please contact the team members.

---

## 🙏 Acknowledgments

We express our sincere gratitude to:

- **Faculty Supervisor** at the Department of Computer Science & Engineering, C.V. Raman Global University, for invaluable guidance and support
- **Head of Department, CSE**, for providing access to infrastructure and development tools
- **Open-Source Community** behind React.js, Node.js, Express.js, PostgreSQL, Vite, Tailwind CSS, and TypeScript
- **Fellow students** who participated in usability testing and provided valuable feedback
- **Our families and friends** for their continuous support and encouragement

---

## 📞 Contact

For questions, suggestions, or collaboration opportunities:

- **GitHub Repository:** [https://github.com/Mrutyunjaya22/camcol-project](https://github.com/Mrutyunjaya22/camcol-project)
- **Issues:** [Report a bug or request a feature](https://github.com/Mrutyunjaya22/camcol-project/issues)

---

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ Core authentication system
- ✅ Gig marketplace
- ✅ Project collaboration
- ✅ Review and rating system
- ✅ Direct messaging
- ✅ Order management

### Future Enhancements (v2.0)
- 🔄 Real-time notifications
- 🔄 Payment gateway integration
- 🔄 Advanced search with AI-powered recommendations
- 🔄 Mobile app (React Native)
- 🔄 Video call integration for consultations
- 🔄 Analytics dashboard
- 🔄 Multi-language support
- 🔄 Dark mode

---

<div align="center">

**Made with ❤️ by the CamCol Team**

**C.V. Raman Global University, Bhubaneswar**

[⬆ Back to Top](#camcol---campus-collaboration-platform)

</div>
