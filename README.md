# RailPass: Railway Ticket Booking System

A state-of-the-art full-stack railway booking application inspired by IRCTC, featuring a unique **Nominee Replacement System** and a premium, modern user interface.

## ✨ Key Features

- **User Authentication**: Secure Login/Register with JWT-based authorization.
- **Train Management**: Search trains by source, destination, and date with real-time seat availability.
- **Booking Engine**: Seamless ticket booking process with PNR generation.
- **Admin Dashboard**: Comprehensive control over trains, schedules, and user bookings.
- **Nominee Replacement System**: 
  - Add a backup passenger during the booking process.
  - Perform one-click passenger replacement if the primary traveler is unable to go.
  - Security via OTP verification (Mock OTP: `123456`).
  - Strict adherence to the 4-hour departure rule for replacements.

## 🛠️ Technology Stack

### Backend
- **Framework**: Java 17, Spring Boot 3.2.4
- **Security**: Spring Security + JWT (JSON Web Tokens)
- **Database**: MySQL with Spring Data JPA & Hibernate
- **Utilities**: Lombok, Validation API, OpenHTMLToPDF

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 4.0, Lucide React (Icons)
- **Animations**: Framer Motion
- **Routing**: React Router 7
- **HTTP Client**: Axios

## 📁 Project Structure

```text
rail-pass/
├── rail-pass-backend/          # Spring Boot 3 Backend
│   ├── src/main/java/          # Java Source Code
│   │   └── com/railpass/
│   │       ├── controller/     # REST Endpoints (Auth, Admin, Booking)
│   │       ├── dto/            # Data Transfer Objects (LoginRequest, etc.)
│   │       ├── model/          # JPA Entities (User, Train, Booking)
│   │       ├── repository/     # Data Access Layer (Spring Data JPA)
│   │       ├── security/       # JWT Configuration & Security Filter Chain
│   │       └── service/        # Business Logic (Booking & Replacement)
│   └── src/main/resources/     # Configuration (application.properties)
├── rail-pass-v2/               # Modern React 19 Frontend
│   ├── src/
│   │   ├── api/                # API Service Layer (Axios)
│   │   ├── components/         # Reusable UI Components
│   │   ├── pages/              # Main Views (Home, Dashboard, Login)
│   │   ├── utils/              # Helper functions
│   │   └── App.jsx             # Main Application Logic
│   ├── package.json            # Frontend Dependencies
│   └── vite.config.js          # Vite Configuration
└── README.md                   # Project Documentation
```

## 🚀 Getting Started

### 1. Database Setup
1. Ensure **MySQL** is running on your machine.
2. Create a database named `railpass_db`.
3. Update `rail-pass-backend/src/main/resources/application.properties` with your database credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/railpass_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 2. Run the Backend
```bash
cd rail-pass-backend
mvn clean install
mvn spring-boot:run
```

### 3. Run the Frontend
```bash
cd rail-pass-v2
npm install
npm run dev
```
The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 🛂 Nominee Replacement Rules
1. **Timing**: Replacements must be initiated at least **4 hours** before the scheduled departure.
2. **Usage**: Only **one** replacement is permitted per PNR.
3. **Verification**: Requires a valid OTP (Use `123456` for testing).
4. **Continuity**: The original seat/berth assignment remains unchanged.

---

#   M i n o r - _ P r o j e c t  