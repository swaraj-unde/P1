# 🎬 P1 - Video Streaming Backend

A modern Node.js backend application for a video streaming platform built with Express.js, MongoDB, JWT authentication, and Cloudinary integration.

---

# 📌 Project Overview

P1 is a scalable and modular backend API designed for a video streaming platform. It supports secure authentication, video management, media uploads, subscriptions, and user profile management.

The project follows industry-standard backend architecture practices with clear separation of concerns and reusable utilities.

---

# 🚀 Features

## 🔐 Authentication & Authorization
- User registration with avatar and cover image upload
- Secure login system using JWT
- Access & Refresh token mechanism
- Password hashing with bcrypt
- Logout functionality
- Token refresh endpoint
- Protected routes using middleware

## 🎥 Video Management
- Upload videos with thumbnails
- Store media on Cloudinary
- Video metadata handling
- Publish / unpublish videos
- View count tracking
- Pagination support

## 👤 User Features
- User profile management
- Avatar & cover image support
- Watch history tracking
- Subscription system

## ☁️ File Uploads
- Multer-based multipart handling
- Cloudinary integration
- Support for image & video uploads

---

# 🏗️ Project Structure

```bash
src/
├── controllers/      # Business logic and request handlers
├── models/           # MongoDB schemas and models
├── routes/           # API route definitions
├── middlewares/      # Authentication & upload middleware
├── utils/            # Utility/helper functions
├── db/               # Database connection setup
└── app.js            # Express app configuration
```

---

# 🛠️ Tech Stack

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT (jsonwebtoken)
- bcrypt

## File Upload & Storage
- Multer
- Cloudinary

## Utilities
- Cookie Parser
- CORS
- Mongoose Aggregate Paginate

---

# 📦 Dependencies

## Core Dependencies

| Package | Purpose |
|---|---|
| express | Web framework |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT authentication |
| bcrypt | Password hashing |
| multer | File uploads |
| cloudinary | Cloud media storage |
| cors | Cross-origin requests |
| cookie-parser | Cookie handling |
| mongoose-aggregate-paginate-v2 | Pagination |

## Dev Dependencies

| Package | Purpose |
|---|---|
| nodemon | Auto reload server |
| prettier | Code formatting |

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000

MONGODB_URI=mongodb://your-mongodb-uri

CORS_ORIGIN=http://localhost:3000

# JWT Configuration
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary Configuration
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd p1
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Setup Environment Variables

Create a `.env` file using the example above.

## 4️⃣ Start Development Server

```bash
npm run dev
```

Server will run on:

```bash
http://localhost:8000
```

---

# 📡 API Endpoints

Base URL:

```bash
/api/v1
```

---

# 👤 User Routes

## Register User

### `POST /users/register`

Create a new user account.

### Form Data

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "userName": "johndoe",
  "password": "securePassword123",
  "avatar": "<file>",
  "coverImage": "<file>"
}
```

---

## Login User

### `POST /users/login`

Authenticate user and receive tokens.

### Request Body

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

## Logout User

### `POST /users/logout`

Logout authenticated user.

### Authentication
Bearer Token Required

---

## Refresh Access Token

### `POST /users/refresh-token`

Generate a new access token using refresh token.

### Request Body

```json
{
  "refreshToken": "your-refresh-token"
}
```

---

# 🔐 Authentication System

The application uses JWT authentication.

## Access Token
- Short-lived token
- Used for authenticated API requests
- Default expiry: `1 day`

## Refresh Token
- Long-lived token
- Used to generate new access tokens
- Default expiry: `7 days`

Tokens can be sent through:
- Cookies
- Authorization header

Example:

```http
Authorization: Bearer <token>
```

---

# 🧩 Middleware

## verifyJWT
- Verifies access tokens
- Validates user existence
- Attaches user data to request

## Multer Middleware
Handles:
- Avatar uploads
- Cover image uploads
- Video uploads
- Thumbnail uploads

---

# 📊 Database Models

## User Schema

```js
{
  userName: String,
  email: String,
  fullName: String,
  avatar: String,
  coverImage: String,
  password: String,
  refreshToken: String,
  watchHistory: [ObjectId]
}
```

---

## Video Schema

```js
{
  videoFile: String,
  thumbnail: String,
  title: String,
  description: String,
  duration: Number,
  views: Number,
  isPublished: Boolean,
  owner: ObjectId
}
```

---

## Subscription Schema

```js
{
  subscriber: ObjectId,
  channel: ObjectId
}
```

---

# ☁️ Cloudinary Integration

The project uses Cloudinary for:
- Avatar storage
- Cover image storage
- Video uploads
- Thumbnail storage

Utility:
```bash
utils/cloudinary.js
```

---

# 🧠 Utilities

| Utility | Purpose |
|---|---|
| asyncHandler.js | Async error wrapper |
| ApiError.js | Custom error handling |
| ApiResponse.js | Standardized API responses |
| cloudinary.js | Cloudinary helper |

---

# 🐛 Error Handling

The application uses:
- Custom `ApiError` class
- Centralized async error handling
- Standardized API responses

Benefits:
- Cleaner controllers
- Consistent errors
- Better debugging

---

# 🧪 Development Scripts

## Run Development Server

```bash
npm run dev
```

---

# 🎨 Code Formatting

This project uses Prettier.

### Config Files
- `.prettierrc`
- `.prettierignore`

---

# 🔥 Key Highlights

✅ JWT Authentication
✅ Refresh Token System
✅ Cloudinary Integration
✅ Modular Architecture
✅ Secure Password Hashing
✅ File Upload Support
✅ MongoDB Aggregation Pagination
✅ RESTful API Design

---

# 📈 Future Improvements

- Like & Comment System
- Playlist Feature
- Search & Recommendation
- Real-time Notifications
- Video Streaming Optimization
- Admin Dashboard
- API Documentation with Swagger

---

# 👨‍💻 Author

**Swaraj Unde**

---

# 📄 License

ISC License

---

# 📌 Version Info

| Property | Value |
|---|---|
| Version | 1.0.0 |
| Database | MongoDB |
| API Version | v1 |

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.