# Learning Management System (LMS) Frontend

A modern, responsive Learning Management System frontend built with React.js, featuring role-based dashboards for students, teachers, and administrators.

## ✨ Key Features

### 🔐 Authentication
- JWT-based authentication with token management
- Secure login page with demo credentials
- Protected routes with role-based access control
- Automatic logout on token expiration

### 📚 Student Features
- Dashboard showing enrolled courses with progress
- Browse and enroll in available courses
- Access course materials and download PDFs
- Submit assignments with deadline tracking
- Take MCQ tests with timer and auto-submit
- View detailed test results with score breakdown
- Manage user profile

### 👨‍🏫 Teacher Features
- Dashboard with student statistics
- Create and manage courses
- Upload course materials
- Create assignments and set deadlines
- Create MCQ tests with multiple questions
- View student submissions and grades
- Analytics dashboard

### 🏛️ Admin Features
- System dashboard with statistics
- User management (create, edit, delete users)
- System health monitoring
- Activity log and analytics

### 🎨 UI/UX
- Responsive design (mobile, tablet, desktop)
- Professional blue/white color scheme
- Card-based modern layout
- Smooth animations and transitions
- Role-based dynamic navigation

## 🚀 Quick Start

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```
Open http://localhost:3000 in your browser

### 3. Login with Demo Credentials

**Student:**
- Email: student1@example.com
- Password: password

**Teacher:**
- Email: teacher1@example.com
- Password: password

**Admin:**
- Email: admin@example.com
- Password: password

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Sidebar, TopNav, MainLayout
│   ├── common/         # Button, Card, ProtectedRoute
│   └── ...
├── pages/              # Page components (one per route)
│   ├── auth/          # Login, Register
│   ├── dashboard/     # Student, Teacher, Admin dashboards
│   ├── course/        # Courses list, course detail
│   ├── student/       # Materials, Assignments, Tests, Results
│   ├── teacher/       # Course management, submissions
│   └── admin/         # User management, analytics
├── services/          # API service layer
│   └── api.js        # Axios with JWT interceptors
├── context/           # Global state (Auth context)
├── routes/           # Route definitions
├── data/             # Mock data for development
└── App.jsx           # Main app component
```

## 🔌 API Integration

### Current: Mock Data
The app uses mock data from `src/data/mockData.js` for development.

### To Connect Real Backend:

1. Update API URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-django-backend.com/api';
```

2. Create actual API service methods to replace mock data

3. Replace mock data calls in pages with API calls

### Expected API Endpoints:
- `POST /api/token/` - Login
- `GET /api/courses/` - List courses
- `GET /api/courses/{id}/` - Course detail
- `POST /api/courses/{id}/enroll/` - Enroll in course
- `GET /api/assignments/` - Get assignments
- `GET /api/tests/` - Get tests
- `GET /api/tests/{id}/questions/` - Get test questions
- `POST /api/test-results/` - Submit test result

## 🎯 Main Features Explained

### Authentication Flow
1. User logs in with email/password
2. Receives JWT token from backend
3. Token stored in localStorage
4. Token auto-added to all API requests via interceptor
5. 401 errors trigger logout

### MCQ Test System
- Question-by-question display
- Timer with auto-submit on expiry
- Single option selection per question
- Question navigator for quick access
- Detailed results with correct answers marked

### Role-Based Dashboard
Routes automatically redirect to role-specific dashboard:
- **Student** → Student dashboard with courses
- **Teacher** → Teacher dashboard with course management
- **Admin** → Admin dashboard with system stats

### Responsive Design
- Sidebar collapses to hamburger menu on mobile
- Grid layouts adapt to screen width
- Touch-friendly buttons and inputs
- Readable on all screen sizes

## 🛣️ Available Routes

**Public:**
- `/login` - Login page

**Protected:**
- `/dashboard` - Role-based dashboard
- `/profile` - User profile

**Student:**
- `/courses` - All courses
- `/courses/:id` - Course detail with tabs
- `/materials` - Download materials
- `/assignments` - View assignments
- `/tests` - Available tests
- `/tests/:id` - Take test
- `/results/:id` - Test results

**Teacher:**
- `/teacher/courses` - Manage courses
- `/teacher/create-course` - Create new course
- `/teacher/submissions` - View submissions

**Admin:**
- `/admin/users` - Manage users
- `/admin/analytics` - System analytics

## 🧪 Testing

### Test Student Workflow:
1. Login as student1@example.com
2. See enrolled courses on dashboard
3. Click course to view details
4. Browse materials, assignments, tests
5. Take a test (select answers, click submit)
6. View results with score breakdown

### Test Teacher Workflow:
1. Login as teacher1@example.com
2. See dashboard with stats
3. View courses being taught
4. Manage course content

### Test Admin Workflow:
1. Login as admin@example.com
2. See system statistics
3. Access user management
4. View analytics

## 🎨 Customization

### Change Color Scheme
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#your-color',
  secondary: '#your-color',
}
```

### Add New Role
1. Add role to mock data
2. Add menu items in SidebarNav
3. Create role-specific pages
4. Add routes in AppRoutes

### Add New Page
1. Create in `pages/` folder
2. Add route in AppRoutes
3. Add sidebar link
4. Export and import correctly

## 📦 Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` folder.

Deploy the `build/` folder to your server.

## 🐛 Troubleshooting

**Port 3000 in use:**
```bash
npx kill-port 3000
npm start
```

**Import errors:**
- Check file paths use correct relative paths
- Ensure `.jsx` extension for React components
- Run `npm install` if modules missing

**Styling not working:**
- Restart dev server
- Check `index.css` has Tailwind directives
- Clear browser cache

## 📝 Notes

- Uses Tailwind CSS v3.3.6 for styling
- React Router v6 for navigation
- Axios for HTTP requests
- Context API for authentication state
- Mock data simulates backend before real API integration

## 🎓 Next Steps

1. Connect real Django REST Framework backend
2. Implement all CRUD operations
3. Add form validation
4. Implement dark mode toggle
5. Add email notifications
6. Set up automated testing
7. Deploy to production

---

**App is ready!** The development server is running on http://localhost:3000

Login with demo credentials to explore the full LMS experience.
