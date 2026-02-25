import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import regImage from '../../assets/reg.png';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#22424e] p-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">

                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form Container with Teal Border */}
                    <div className="bg-teal-50 border-2 border-teal-400 rounded-2xl p-6 space-y-5">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>

                        <div className="flex items-center justify-center text-sm pt-2">
                            <span className="text-gray-600 mr-2">Already have an account?</span>
                            <button
                                type="button"
                                onClick={handleSignIn}
                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Illustration */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-teal-50 to-white p-8 md:p-12 lg:p-16 flex-col items-center justify-center text-center">
                    <div className="max-w-md">
                        {/* Character Circle */}
                        <div className="w-48 h-48 mx-auto mb-8 bg-purple-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden">
                            <img src={regImage} alt="Registration Character" className="w-full h-full object-cover" />
                        </div>

                        {/* Text */}
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                            Join the Community!
                        </h3>
                        <p className="text-xl md:text-2xl font-semibold text-gray-700">
                            Start your journey with us today.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;