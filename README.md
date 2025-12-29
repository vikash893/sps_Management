# School Management System

A comprehensive MERN stack application for managing school operations with role-based access for Admin, Teacher, and Student.

## Features

### 🔐 Authentication & Roles
- Admin, Teacher, and Student login
- Admin assigns username; DOB as default password for students
- JWT-based authentication & protected routes

### 👨‍🏫 Teacher Dashboard
- Select Class & Section to mark student attendance
- Upload marks (subject-wise)
- Apply for leave (sent to Admin)
- Early Student Leave Feature:
  - Enter student details, pickup person name & relation
  - Automatically send SMS/WhatsApp to parent

### 👨‍🎓 Student Dashboard
- View attendance with statistics
- View marks by subject and exam type
- Submit teacher feedback
- View fee status & updates
- Profile with photo and basic details

### 🧑‍💼 Admin Dashboard
- Add/Edit/Delete Students & Teachers
- While adding students, collect:
  - Name, Class, Section
  - Father's mobile number (for SMS/WhatsApp)
  - DOB (used as password)
  - Student photo
- Manage attendance & marks data
- Student fee updates
- Teacher leave approvals
- Feedback review (students & teachers)

## Technology Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Multer
- **SMS/WhatsApp**: Twilio API

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Twilio account (for SMS/WhatsApp - optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
npm run setup-env
```

This will create a `.env` file with a randomly generated JWT_SECRET. You can also manually create a `.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Twilio for SMS/WhatsApp (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Upload
UPLOAD_PATH=./uploads
```

4. Create an admin user (optional, but recommended):
```bash
npm run create-admin
```

This will create an admin user with:
- Username: `admin`
- Password: `admin123`
- ⚠️ **Please change the password after first login!**

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### Creating Admin Account

Run the admin creation script:
```bash
cd backend
npm run create-admin
```

This creates an admin user with username `admin` and password `admin123`. **Please change the password after first login!**

### Student Login
- Username: Assigned by admin (format: `firstname_lastname_class_section`)
- Password: DOB in DDMMYYYY format (e.g., 15012010 for 15/01/2010)

### Teacher Login
- Username: Assigned by admin
- Password: Set by admin

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/students` - Get all students
- `POST /api/admin/students` - Add student
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student
- Similar routes for teachers, leaves, feedback, fees

### Teacher Routes
- `GET /api/teacher/students` - Get students by class/section
- `POST /api/teacher/attendance` - Mark attendance
- `POST /api/teacher/marks` - Upload marks
- `POST /api/teacher/early-leave` - Record early student leave
- `POST /api/teacher/leaves` - Apply for leave

### Student Routes
- `GET /api/student/profile` - Get profile
- `GET /api/student/attendance` - Get attendance
- `GET /api/student/marks` - Get marks
- `GET /api/student/fees` - Get fees
- `POST /api/student/feedback` - Submit feedback

## Project Structure

```
sps/
├── backend/
│   ├── config/
│   │   └── multer.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Attendance.js
│   │   ├── Mark.js
│   │   ├── Fee.js
│   │   ├── Feedback.js
│   │   ├── Leave.js
│   │   └── EarlyLeave.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── teacher.js
│   │   └── student.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── sendSMS.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Features in Detail

### SMS/WhatsApp Integration
The system uses Twilio API to send notifications to parents when a student leaves early. Configure your Twilio credentials in the `.env` file. If not configured, the system will log the messages instead.

### File Uploads
Student photos are uploaded to the `backend/uploads` directory and served statically.

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

