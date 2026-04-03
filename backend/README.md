# ClashGuard Backend

Academic Deadline Collision & Burnout Detection System - Backend API

## Project Overview

ClashGuard is a comprehensive system designed to help university students manage their academic deadlines and prevent burnout by detecting deadline collisions and providing intelligent scheduling recommendations.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## Project Structure

```
backend/
├── server.js                 # Main application entry point
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
└── src/
    ├── config/
    │   └── db.js            # MongoDB connection configuration
    ├── models/
    │   └── User.js          # User database schema and model
    ├── controllers/
    │   ├── authController.js   # Authentication logic
    │   └── userController.js   # User management logic
    ├── middleware/
    │   └── authMiddleware.js   # JWT authentication middleware
    └── routes/
        ├── authRoutes.js       # Authentication routes
        └── userRoutes.js       # User management routes
```

## Installation

### 1. Clone or navigate to the backend directory

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/clashguard
JWT_SECRET=your_secret_key_change_this_in_production_123456789
NODE_ENV=development
```

**Note**: Change `JWT_SECRET` to a strong random string for production.

### 4. Set up MongoDB

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create an account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update `MONGO_URI` in `.env` file

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "faculty": "Faculty of Engineering",
  "degree": "Bachelor of Software Engineering",
  "year": 2,
  "studentId": "ENG/2022/001"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6547c1a2b3c4d5e6f7g8h9i0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "faculty": "Faculty of Engineering",
    "degree": "Bachelor of Software Engineering",
    "year": 2,
    "campus": "SLIIT Malabe"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6547c1a2b3c4d5e6f7g8h9i0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "faculty": "Faculty of Engineering",
    "degree": "Bachelor of Software Engineering",
    "year": 2,
    "campus": "SLIIT Malabe"
  }
}
```

#### Get Current User Profile
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "6547c1a2b3c4d5e6f7g8h9i0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "studentId": "ENG/2022/001",
    "faculty": "Faculty of Engineering",
    "degree": "Bachelor of Software Engineering",
    "year": 2,
    "campus": "SLIIT Malabe"
  }
}
```

#### Change Password
```
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newPassword456",
  "passwordConfirm": "newPassword456"
}
```

### User Routes (Protected)

#### Get User Profile
```
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "faculty": "Faculty of Engineering",
  "degree": "Bachelor of Software Engineering",
  "year": 3,
  "studentId": "ENG/2022/001",
  "campus": "SLIIT Colombo"
}
```

#### Get All Users (Admin Only)
```
GET /api/users
Authorization: Bearer <admin_token>
```

## User Model

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | User's full name |
| email | String | Yes | User's email (unique) |
| password | String | Yes | Hashed password (bcrypt) |
| role | String | No | User role (default: 'student', can be 'lecturer', 'admin') |
| studentId | String | No | Student ID number |
| faculty | String | Yes | Faculty/Department |
| degree | String | Yes | Degree program |
| year | Number | Yes | Academic year (1-4) |
| campus | String | No | Campus location (default: 'SLIIT Malabe') |
| createdAt | Date | Auto | Account creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

## Security Features

### 1. Password Hashing
All passwords are hashed using bcryptjs with salt rounds of 10 before being stored in the database. Passwords are never returned in API responses.

### 2. JWT Authentication
- Tokens are issued upon successful registration and login
- Token expires after 7 days
- Protected routes require valid JWT token in Authorization header
- Format: `Authorization: Bearer <token>`

### 3. Input Validation
- Email validation with regex pattern
- Password length validation (minimum 6 characters)
- Required field validation
- Data type validation through Mongoose schemas

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Missing or invalid required fields
- **401 Unauthorized**: Authentication failed or missing token
- **403 Forbidden**: User doesn't have permission to access resource
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Environment Variables Explanation

- `PORT`: Port number for the server (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for signing JWT tokens
- `NODE_ENV`: Node environment (development/production)

## Development Tips

### Using Postman/Thunder Client for Testing

1. **Register a new user**
   - POST to `http://localhost:5000/api/auth/register`
   - Copy the token from response

2. **Use the token**
   - In Authorization header, select "Bearer Token"
   - Paste the token
   - Make requests to protected routes

### Useful Terminal Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache (if you face issues)
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- Email verification for user registration
- Password reset functionality
- Role-based access control (RBAC)
- Deadline management module
- Burnout detection algorithm
- Analytics and reporting
- Real-time notifications
- API rate limiting

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

**Project**: ClashGuard - Academic Deadline Collision & Burnout Detection System
**Version**: 1.0.0
**Year**: 2024
