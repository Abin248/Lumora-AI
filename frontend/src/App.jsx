import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/dashboard/UserDashboard';
import UploadResume from './pages/dashboard/UploadResume';
import ResumeATS from './pages/dashboard/ResumeATS';
import CourseRecommendations from './pages/dashboard/CourseRecommendations';
import MockInterview from './pages/dashboard/MockInterview';
import BuildResume from './pages/dashboard/BuildResume';
import UserProfile from './pages/dashboard/UserProfile';
import ResumeHistory from './pages/dashboard/ResumeHistory';
import Welcome from './pages/LandingPage/Welcome';
import Loader from './components/Loader/Loader';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <Loader />;
    if (!user) return <Navigate to="/login" />;

    return children;
};

const App = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/login', '/register', '/dashboard', '/welcome'];
    const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {shouldShowNavbar && <Navbar />}
            <main className={`flex-1 ${shouldShowNavbar ? 'pb-10' : 'pb-0'}`}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/welcome" element={
                        <ProtectedRoute>
                            <Welcome />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <ResumeHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/resume/upload" element={
                        <ProtectedRoute>
                            <UploadResume />
                        </ProtectedRoute>
                    } />
                    <Route path="/resume/:id" element={
                        <ProtectedRoute>
                            <ResumeATS />
                        </ProtectedRoute>
                    } />
                    <Route path="/resume/build" element={
                        <ProtectedRoute>
                            <BuildResume />
                        </ProtectedRoute>
                    } />
                    <Route path="/career/courses" element={
                        <ProtectedRoute>
                            <CourseRecommendations />
                        </ProtectedRoute>
                    } />
                    <Route path="/interview" element={
                        <ProtectedRoute>
                            <MockInterview />
                        </ProtectedRoute>
                    } />

                    {/* Redirects */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
