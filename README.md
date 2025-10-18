# Event-Finder-Microservices

## Overview
Event Finder is a microservices-based application designed to help users discover, create, and manage events. The system supports user authentication, event management, and organizer application workflows, leveraging a modular architecture with separate services for users, events, and organizers. Built with Node.js, Express, MongoDB, and Nginx, it ensures scalability, maintainability, and secure communication between services.

## Features
- **User Management**: Register, login, and manage user profiles with role-based access (user, organizer, admin).
- **Event Management**: Create, update, delete, like, comment on, and search events by category, date, price, or city.
- **Organizer Applications**: Apply to become an organizer, check application status, and admin review of applications.
- **Admin Functionality**: Manage user roles and review organizer applications (integrated into User and Organizer Services).
- **Authentication**: JWT-based authentication for secure access to protected routes.
- **Role-Based Authorization**: Restrict access to admin or organizer-specific actions.
- **API Gateway**: Nginx routes requests to appropriate services, ensuring seamless communication.

## Architecture
The application follows a microservices architecture, with the following services:

- **User Service** (`user-service`, port 4000):
  - Handles user registration, login, profile retrieval, and role updates (admin-only).
  - Stores user data in the `event-finder-users` MongoDB database.
  - Generates JWT tokens for authentication.

- **Event Service** (`event-service`, port 3000):
  - Manages event creation, updates, deletion, likes, comments, and searches.
  - Stores event data in the `event-finder` MongoDB database.
  - Supports filtering events by category, date, price, and city.

- **Organizer Service** (`organizer-service`, port 8000):
  - Manages organizer application submissions, status checks, and admin reviews.
  - Stores application data in the `event-finder-organizers` MongoDB database.
  - Includes admin routes for reviewing organizer applications.

- **API Gateway** (Nginx, port 8080):
  - Proxies requests to the appropriate service based on the URL path (e.g., `/api/users`, `/api/events`, `/api/organizer`).
  - Provides a unified entry point for the frontend.

**Admin Functionality**: Admin tasks, such as reviewing organizer applications and updating user roles, are integrated into the Organizer Service (`/api/organizer/applications`) and User Service (`/api/users/:userId`). These routes are protected by the `authorizeRoles(["admin"])` middleware.

Each service uses Express for routing, Mongoose for MongoDB interactions, and middleware for authentication (`auth.js`) and role-based authorization (`authorizeRoles.js`).

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Nginx (for API Gateway)
- Docker (optional, for containerized deployment)
- Environment variables (see `.env.example` below)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/JPV2207/Event-Finder-Microservices.git
cd Event-Finder-Microservices
```

### 2. Set Up Environment Variables
Create a `.env` file in each service directory (`user-service`, `event-service`, `organizer-service`) based on the following example:

```text
# .env.example
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=your_jwt_secret
PORT=3000 # Adjust per service: 3000 (event), 4000 (user), 8000 (organizer)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword
```

### 3. Install Dependencies
For each service (`user-service`, `event-service`, `organizer-service`):
```bash
cd <service-directory>
npm install
```

### 4. Set Up MongoDB
Ensure MongoDB is running locally or in a cloud instance. The services connect to:
- `event-finder` (Event Service)
- `event-finder-users` (User Service)
- `event-finder-organizers` (Organizer Service)

### 5. Set Up Nginx
Configure Nginx to proxy requests to the services. Example configuration (`nginx.conf`):
```nginx
http {
  server {
    listen 8080;
    location /api/users/ {
      proxy_pass http://localhost:4000/;
    }
    location /api/events/ {
      proxy_pass http://localhost:3000/;
    }
    location /api/organizer/ {
      proxy_pass http://localhost:8000/;
    }
  }
}
```
Start Nginx:
```bash
nginx -c /path/to/nginx.conf
```

### 6. Create Admin User
Run the admin creation script in the User Service:
```bash
cd user-service
node scripts/createAdmin.js
```

### 7. Start the Services
For each service:
```bash
cd <service-directory>
npm start
```
- User Service: `http://localhost:4000`
- Event Service: `http://localhost:3000`
- Organizer Service: `http://localhost:8000`
- API Gateway: `http://localhost:8080`

## Usage

### API Endpoints
All endpoints are prefixed with `http://localhost:8080/api/`.

#### User Service (`/users`)
- `POST /signup`: Register a new user (body: `{ username, email, password }`).
- `POST /login`: Log in and receive a JWT token (body: `{ email, password }`).
- `GET /profile`: Get authenticated user's profile (requires JWT).
- `PATCH /:userId`: Update user role (admin-only, requires JWT, body: `{ role }`).

#### Event Service (`/events`)
- `POST /`: Create an event (organizer-only, requires JWT, body: event data).
- `GET /`: Search events (optional query params: `category`, `futureOnly`, `timeRange`, `year`, `priceMin`, `priceMax`, `city`, `sortBy`).
- `GET /nearby`: Get events in a city (query params: `city`, `limit`).
- `PUT /:id`: Update an event (organizer-only, requires JWT).
- `DELETE /:id`: Delete an event (organizer-only, requires JWT).
- `POST /:id/like`: Like an event (requires JWT).
- `POST /:id/unlike`: Unlike an event (requires JWT).
- `POST /:id/comment`: Comment on an event (requires JWT, body: `{ text }`).
- `PUT /:id/comments/:commentId`: Update a comment (requires JWT, body: `{ text }`).
- `DELETE /:id/comments/:commentId`: Delete a comment (requires JWT).

#### Organizer Service (`/organizer`)
- `POST /apply`: Submit an organizer application (requires JWT, body: `{ fullName, organizationName, contactNumber, description }`).
- `GET /application/status`: Check application status (requires JWT).
- `GET /applications`: Get all pending applications (admin-only, requires JWT).
- `POST /applications/:id/approve`: Approve an application (admin-only, requires JWT).
- `POST /applications/:id/reject`: Reject an application (admin-only, requires JWT, body: `{ reason }`).

### Authentication
- Use the `/api/users/login` endpoint to obtain a JWT token.
- Include the token in the `Authorization` header: `Bearer <token>` for protected routes.

## Development

### Folder Structure
```
event-finder-microservices/
├── event-service/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   └── server.js
├── organizer-service/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/    
│   ├── repositories/
│   ├── routes/
│   └── index.js
├── user-service/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── scripts/
│   └── index.js
├── admin-service/
│   ├── middlewares/
│   ├── routes/
│   └── index.js
├── api-gateway/
│   ├── nginx.conf

```

### Running Locally
1. Start MongoDB.
2. Start each service (`npm start` in each service directory).
3. Start Nginx to route requests.

### Testing
- Use tools like Postman or curl to test API endpoints.
- Ensure the JWT token is included for protected routes.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/branch-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature/branch-name`).
5. Create a pull request.

## License
This project is licensed under the MIT License.
