import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Calendar } from 'lucide-react';

const UserProfile = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div className="p-10 text-center">Please log in to view profile.</div>;

    return (
        <div className="w-full h-full">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h2>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                <div className="bg-primary px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full text-primary">
                            <User size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 text-gray-700">
                        <Mail className="text-gray-400" />
                        <span className="text-lg">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-700">
                        <span className="font-semibold w-6 text-center">ID</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{user._id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
