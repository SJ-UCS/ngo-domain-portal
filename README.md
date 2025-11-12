# NGO Domain Portal

A full-stack web application that connects donors, volunteers, and NGOs (Non-Governmental Organizations) to facilitate social causes, campaigns, and donations. This platform enables NGOs to create and manage campaigns, while users can discover NGOs, make donations, and volunteer for various social initiatives.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Frontend Routes](#frontend-routes)
- [Database Schema](#database-schema)
- [Development Notes](#development-notes)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Management**
  - User registration and authentication (JWT-based)
  - Role-based access control (User, NGO)
  - User profiles with customizable profile icons
  - Campaign participation tracking

- **NGO Management**
  - NGO registration and profile management
  - NGO listing and detailed profiles
  - Domain-based organization categorization
  - Location and contact information

- **Campaign Management**
  - Create and manage fundraising campaigns
  - Set campaign goals and track progress
  - View campaign details and statistics

- **Donation System**
  - Make donations to campaigns
  - Track donation history
  - Simulated payment processing (for demo purposes)

- **Volunteer System**
  - Apply to volunteer for campaigns
  - Track volunteer applications and status

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **pg** - PostgreSQL client
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS** - Styling

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

Alternatively, you can use **Docker** to run PostgreSQL in a container.

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Assignment
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ngo_portal

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-secret-key-here

# Server Port
PORT=5000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

## 🗄 Database Setup

### Option 1: Using PostgreSQL Directly

1. Install PostgreSQL and start the service
2. Create a database:

```bash
createdb ngo_portal
```

Or using psql:

```sql
CREATE DATABASE ngo_portal;
```

3. Run the migration script:

```bash
psql -h localhost -U postgres -d ngo_portal -f backend/migrations/init.sql
```

### Option 2: Using Docker

1. Run PostgreSQL container:

```bash
docker run --name ngo-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

2. Create the database:

```bash
docker exec -it ngo-postgres psql -U postgres -c "CREATE DATABASE ngo_portal;"
```

3. Run the migration:

```bash
docker exec -i ngo-postgres psql -U postgres -d ngo_portal < backend/migrations/init.sql
```

Or copy the SQL file into the container and execute it.

## ▶️ Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start the Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
Assignment/
├── backend/
│   ├── db.js                 # Database connection configuration
│   ├── server.js             # Express server entry point
│   ├── middlewares/
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Authentication routes (register, login, profile)
│   │   ├── ngos.js          # NGO management routes
│   │   ├── campaigns.js     # Campaign management routes
│   │   └── donations.js     # Donation routes
│   ├── migrations/
│   │   └── init.sql         # Database schema initialization
│   ├── package.json
│   └── .env                 # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── api.js           # Axios API client configuration
│   │   ├── App.jsx          # Main React component with routing
│   │   ├── main.jsx         # React entry point
│   │   ├── styles.css       # Global styles
│   │   └── pages/
│   │       ├── Home.jsx     # Home page
│   │       ├── NGOs.jsx     # NGO listing page
│   │       ├── NGOProfile.jsx # Individual NGO profile page
│   │       ├── Login.jsx    # Login page
│   │       ├── Register.jsx # Registration page
│   │       └── Donate.jsx   # Donation page
│   ├── index.html
│   ├── package.json
│   └── .env                 # Environment variables (create this)
│
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user or NGO
  - Body: `{ name, email, password, role, age?, mobile?, area?, profile_icon? }`
  - Returns: `{ user, token }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ user, token }`

- `GET /api/auth/profile` - Get user profile (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user }` (includes campaign participation count)

### NGOs (`/api/ngos`)

- `GET /api/ngos` - Get all NGOs
- `GET /api/ngos/:id` - Get NGO by ID
- `POST /api/ngos` - Create NGO (Protected)
- `PUT /api/ngos/:id` - Update NGO (Protected)
- `DELETE /api/ngos/:id` - Delete NGO (Protected)

### Campaigns (`/api/campaigns`)

- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `GET /api/campaigns/ngo/:ngoId` - Get campaigns by NGO
- `POST /api/campaigns` - Create campaign (Protected)
- `PUT /api/campaigns/:id` - Update campaign (Protected)
- `DELETE /api/campaigns/:id` - Delete campaign (Protected)

### Donations (`/api/donations`)

- `GET /api/donations` - Get all donations (Protected)
- `GET /api/donations/user/:userId` - Get user's donations
- `GET /api/donations/campaign/:campaignId` - Get donations for a campaign
- `POST /api/donations` - Create donation (Protected)
  - Body: `{ campaign_id, amount }`

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Registration/Login**: Users receive a JWT token upon successful registration or login
2. **Token Storage**: The frontend stores the token in `localStorage`
3. **Protected Routes**: API requests to protected endpoints must include the token in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```
4. **Token Expiration**: Tokens expire after 7 days

The frontend automatically attaches the token to all API requests via Axios interceptors.

## 🎨 Frontend Routes

- `/` - Home page
- `/ngos` - List all NGOs
- `/ngos/:id` - View individual NGO profile
- `/donate/:campaignId` - Donate to a specific campaign
- `/login` - User login
- `/register` - User registration

## 🗃 Database Schema

### Tables

1. **users**
   - `id`, `name`, `email`, `password`, `role`, `age`, `mobile`, `area`, `profile_icon`, `created_at`

2. **ngos**
   - `id`, `name`, `domain`, `location`, `contact`, `description`, `objectives`, `goals`, `owner_id`, `created_at`

3. **campaigns**
   - `id`, `ngo_id`, `title`, `description`, `goal_amount`, `collected_amount`, `created_at`

4. **donations**
   - `id`, `user_id`, `campaign_id`, `amount`, `donated_at`

5. **volunteers**
   - `id`, `user_id`, `campaign_id`, `status`, `applied_at`

All tables include appropriate indexes for optimized queries.

## 📝 Development Notes

### Current Limitations (Demo/Scaffold)

- **Payment Processing**: Donations are simulated by saving records to the database. No actual payment gateway integration is implemented.
- **File Uploads**: Image uploads for NGOs, campaigns, or user profiles are not implemented.
- **Validation**: Basic validation is in place, but stricter validation should be added for production.
- **Role-Based Access**: Basic role checking exists, but more comprehensive role-based access control (RBAC) should be implemented.
- **Pagination**: List endpoints do not include pagination (should be added for production).
- **Error Handling**: Basic error handling is implemented, but more comprehensive error handling and logging should be added.

### Security Considerations

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens are used for authentication
- SQL injection protection via parameterized queries
- CORS is enabled (configure appropriately for production)

## 🚀 Future Enhancements

To make this application production-ready, consider adding:

- [ ] Payment gateway integration (Stripe, PayPal, etc.)
- [ ] Image upload and storage (AWS S3, Cloudinary, etc.)
- [ ] Email notifications for donations and volunteer applications
- [ ] Advanced search and filtering for NGOs and campaigns
- [ ] Pagination for all list endpoints
- [ ] Input validation and sanitization (Joi, express-validator)
- [ ] Rate limiting for API endpoints
- [ ] Comprehensive error logging and monitoring
- [ ] Admin dashboard for managing users, NGOs, and campaigns
- [ ] Campaign analytics and reporting
- [ ] Social media sharing for campaigns
- [ ] Email verification for user accounts
- [ ] Password reset functionality
- [ ] Multi-factor authentication (MFA)
- [ ] Real-time notifications (WebSockets)
- [ ] Mobile responsive design improvements
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization for easy deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available for educational purposes.

## 👥 Authors

- Project scaffold for NGO Domain Portal

## 🙏 Acknowledgments

- Built with React, Express, and PostgreSQL
- Designed for educational and demonstration purposes

---

**Note**: This is a scaffold/demo application. For production use, implement the security measures, payment integration, and enhancements listed in the Future Enhancements section.

Good luck with your presentation! 🗿
