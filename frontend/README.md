# ClashGuard Frontend

Modern React frontend for ClashGuard - Academic Deadline Collision & Burnout Detection System

## 🎨 Features

- **Modern UI Design** with Glassmorphism, Gradients & Animations
- **Responsive Design** - Works on mobile, tablet, and desktop
- **User Authentication** - Register, Login, Logout with JWT tokens
- **Protected Routes** - Secure pages accessible only to authenticated users
- **Dashboard** - Overview of deadlines, alerts, and academic info
- **Profile Management** - View and edit user information
- **Password Management** - Secure password change functionality
- **Real-time API Integration** - Axios with automatic token management

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🚀 Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── LoginPage.jsx          # Login page
│   ├── RegisterPage.jsx       # Registration page
│   ├── DashboardPage.jsx      # Main dashboard
│   └── ProfilePage.jsx        # User profile & settings
├── components/
│   ├── ProtectedRoute.jsx     # Protected route wrapper
│   └── Sidebar.jsx            # Navigation sidebar
├── context/
│   └── AuthContext.jsx        # Authentication context
├── services/
│   └── api.js                 # Axios API setup & endpoints
├── App.jsx                    # Main app component with routing
├── main.jsx                   # Entry point
├── App.css                    # App styling
└── index.css                  # Global styles (Tailwind)
```

## 🔐 Authentication Flow

### Login
1. User enters email and password
2. Request sent to `/api/auth/login`
3. JWT token received and stored in localStorage
4. User redirected to dashboard

### Registration
1. User fills registration form
2. Request sent to `/api/auth/register`
3. JWT token received and stored in localStorage
4. User redirected to dashboard

### Protected Routes
- Dashboard and Profile pages are protected
- If no token found, user is redirected to login
- Automatic logout if token expires or becomes invalid

## 🎯 Pages & Features

### Login Page
- Email and password input
- Demo credentials button
- Link to registration
- Feature highlights
- Modern glassmorphism design

### Register Page
- Full Name
- Email
- Student ID
- Faculty selection
- Degree program selection
- Academic year selection
- Password (with confirmation)
- Form validation

### Dashboard
- Welcome message
- Statistics cards (deadlines, alerts, burnout risk)
- Upcoming deadlines list
- Collision detection alerts
- Academic information
- Wellness tips
- Responsive sidebar navigation

### Profile Page
- View profile information
- Edit personal information
- Change password
- Account information
- Security settings

## 🎨 Design Features

### Glassmorphism
- Semi-transparent cards with backdrop blur
- Subtle borders with white transparency
- Modern and clean appearance

### Gradient Backgrounds
- Purple to pink gradient theme
- Gradient buttons and accents
- Dynamic color transitions

### Responsive Design
- Mobile-first approach
- Hamburger menu on mobile
- Collapsible sidebar
- Grid layouts that adapt to screen size

### Animations
- Fade-in animations
- Slide-up animations on page load
- Hover effects on interactive elements
- Smooth transitions

## 🔗 API Configuration

The frontend communicates with the backend at `http://localhost:5000/api`

### API Endpoints Used

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password

**User Management**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin)

## 🔧 Customization

### Change API Base URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'your-api-url/api';
```

### Modify Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  primary: '#your-color',
  secondary: '#your-color',
  // ...
}
```

### Change Gradient Background
Edit `src/index.css`:
```css
body {
  background: linear-gradient(135deg, #your-color 0%, #other-color 100%);
}
```

## 💡 Key Features Implementation

### Protected Routes
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Authentication Context
Provides authentication state and methods globally:
- `user` - Current logged-in user
- `isAuthenticated` - Authentication status
- `login()` - Login function
- `register()` - Register function
- `logout()` - Logout function

### Automatic Token Management
Axios interceptor automatically:
- Adds token to request headers
- Removes token on 401 (unauthorized) response
- Redirects to login if token is invalid

## 🐛 Troubleshooting

### "Cannot connect to API"
- Ensure backend is running on `http://localhost:5000`
- Check CORS configuration in backend
- Verify API base URL in `src/services/api.js`

### "Token not working"
- Clear localStorage and re-login
- Check if JWT_SECRET matches between frontend and backend
- Verify token format in localStorage

### "Styles not loading"
- Ensure Tailwind CSS is properly configured
- Run `npm install` to install all dependencies
- Rebuild with `npm run build`

## 📱 Device Support

- ✅ Desktop (1024px and above)
- ✅ Tablet (768px to 1023px)
- ✅ Mobile (below 768px)

## 🔄 State Management

### AuthContext
Global state for:
- User information
- Authentication status
- Loading states

### Local Component State
Used for:
- Form data
- Loading/error messages
- UI interactions (edit mode, form visibility)

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

## 📝 Environment Variables

No environment variables needed for the frontend. Configuration is handled through `src/services/api.js`

## 🚀 Deployment

### Deploy to Vercel
```bash
npm run build
# Upload the dist folder to Vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload the dist folder to Netlify
```

### Deploy to GitHub Pages
Update `vite.config.js`:
```javascript
export default {
  base: '/repository-name/',
  // ...
}
```

## 📄 License

ISC

## 👥 Contributors

Created for SLIIT Malabe students

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Project**: ClashGuard - Academic Deadline Collision & Burnout Detection System
**Version**: 1.0.0
**Built With**: React + Vite + Tailwind CSS
