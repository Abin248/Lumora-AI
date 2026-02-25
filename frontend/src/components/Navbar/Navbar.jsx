import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Menu, LogOut, User as UserIcon, History } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-2xl text-primary">CareerAI</span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                <Link to="/history" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <History className="w-4 h-4 mr-1" /> History
                                </Link>
                                <Link to="/profile" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <UserIcon className="w-4 h-4 mr-1" /> Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium ml-4 border border-red-100 rounded-full hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4 mr-1" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                <Link to="/register" className="bg-primary text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
