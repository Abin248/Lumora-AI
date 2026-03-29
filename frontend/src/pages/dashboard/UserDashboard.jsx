import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Award, MessageSquare, History, User, LogOut, LayoutDashboard, PenTool, Mic2, BookOpen } from 'lucide-react';
import ResumeATS from './ResumeATS';
import CourseRecommendations from './CourseRecommendations';
import MockInterview from './MockInterview';
import BuildResume from './BuildResume';
import SpeechTest from './SpeechTest';

import ResumeHistory from './ResumeHistory';
import UploadResume from './UploadResume';
import UserProfile from './UserProfile';
import bgImage from '../../assets/bg.jpg';
import logoImage from '../../assets/Logo1.png';


const UserDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();


    const [activeSection, setActiveSection] = useState('optimizer'); 

    const [optimizerMode, setOptimizerMode] = useState('upload');
    const [currentResumeId, setCurrentResumeId] = useState(null);
    const [resumeData, setResumeData] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };


    const handleAnalysisComplete = (data, resumeId) => {
        setResumeData(data);
        setCurrentResumeId(resumeId);
        setOptimizerMode('results');
    };

    const handleResetOptimizer = () => {
        setResumeData(null);
        setCurrentResumeId(null);
        setOptimizerMode('upload');
        setActiveSection('optimizer');
    };


    const handleViewHistoryResume = (resumeId, data) => {
        setCurrentResumeId(resumeId);
        setResumeData(data); 
        setActiveSection('optimizer');
        setOptimizerMode('results');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'optimizer':
                return optimizerMode === 'results' ? (
                    <ResumeATS
                        key={currentResumeId} 
                        resumeId={currentResumeId}
                        initialData={resumeData}
                        onBack={handleResetOptimizer}
                    />
                ) : (
                    <UploadResume onAnalysisComplete={handleAnalysisComplete} />
                );
            case 'courses':
                return <CourseRecommendations />;
            case 'build':
                return <BuildResume />;
            case 'speech-test':
                return <SpeechTest />;
            case 'skill-up':
                return <CourseRecommendations />;
            case 'interview':
                return <MockInterview />;
            case 'history':
                return <ResumeHistory onViewResume={handleViewHistoryResume} onCreateNew={handleResetOptimizer} />;
            case 'profile':
                return <UserProfile />;
            default:
                return <UploadResume onAnalysisComplete={handleAnalysisComplete} />;
        }
    };

    const navItems = [
        { id: 'optimizer', label: 'Resume Upload', icon: FileText },
        { id: 'build', label: 'Build Resume', icon: PenTool },
        { id: 'speech-test', label: 'Mock Interview', icon: Mic2 },
        { id: 'courses', label: 'Guidance', icon: Award },
        { id: 'interview', label: 'Mock Test', icon: MessageSquare },
        { id: 'history', label: 'History', icon: History },
    ];
    return (
        <div className="flex min-h-screen overflow-hidden bg-gray-100 font-sans">
            {/* Left Sidebar - 30% */}
            <aside className="w-[20%] bg-[#22424e] text-white flex flex-col shadow-2xl z-20">
                {/* Header */}
                <div className="p-8 border-b border-gray-600">
                    <div className="flex items-center gap-3 text-2xl font-bold tracking-wide">
                        <img
                            src={logoImage}
                            alt="Lumora Logo"
                            className="h-10 w-auto"
                        />
                        <span>Lumora</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 text-left group ${isActive
                                    ? 'bg-white/15 shadow-lg border-l-4 border-teal-300'
                                    : 'hover:bg-white/10 hover:translate-x-1'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-teal-400 text-white' : 'bg-gray-700/50 text-gray-300 group-hover:bg-gray-600 group-hover:text-white'}`}>
                                    <Icon size={22} />
                                </div>
                                <span className={`font-semibold text-lg ${isActive ? 'text-white' : 'text-gray-200'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
                {/* Footer: Profile & Logout */}
                <div className="p-4 border-t border-gray-600 bg-black/10">
                    <div className="flex items-center gap-2">
                        {/* User Profile Button - 70% width */}
                        <button
                            onClick={() => setActiveSection('profile')}
                            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'profile' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                            style={{ flex: '7' }} // 70% width
                        >
                            <div className="bg-teal-600 p-2 rounded-full">
                                <User size={20} className="text-teal-100" />
                            </div>
                            <span className="font-medium text-gray-200">{user?.name || 'User Profile'}</span>
                        </button>
                        {/* Logout Button - 30% width */}
                        <button
                            onClick={handleLogout}
                            className="flex-[3] flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-red-700 text-white hover:bg-red-800 transition-colors shrink-0"
                        >
                            <div className="p-1">
                                <LogOut size={18} />
                            </div>
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Right Content Area - 70% */}
            <main className="relative flex-1 flex overflow-hidden">
                {/* Background Image Layer */}
                <div
                    className="absolute inset-0 z-0 opacity-10"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* Scrollable Content */}
                <div className="relative z-10 flex-1 overflow-y-auto scroll-smooth">
                    <div className="w-full min-h-full bg-white/80 backdrop-blur-sm border border-white/50 p-8 shadow-inner">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};
export default UserDashboard;