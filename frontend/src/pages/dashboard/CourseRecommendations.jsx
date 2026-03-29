import { useState, useEffect } from 'react';
import { getCourseRecommendations } from '../../api/careerApi';
import { getResumes } from '../../api/resumeApi';
import CourseCard from '../../components/CourseCard/CourseCard';
import Loader from '../../components/Loader/Loader';
import { BookOpen, TrendingUp, AlertTriangle, CheckCircle, Briefcase, MapPin, DollarSign, ExternalLink, Linkedin, Search, UploadCloud } from 'lucide-react';

const CourseRecommendations = () => {
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingResumes, setFetchingResumes] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const { data } = await getResumes();
                setResumes(data);
                if (data.length > 0) setSelectedResume(data[0]._id);
            } catch (error) {
                console.error("Failed to load resumes");
            } finally {
                setFetchingResumes(false);
            }
        };
        fetchResumes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedResume) return;

        setLoading(true);
        setAnalysis(null);
        try {
            const { data } = await getCourseRecommendations({ resumeId: selectedResume });
            setAnalysis(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingResumes) return <Loader />;

    return (
        <div className="w-full h-full max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Career & Skill Analysis</h2>
            <p className="text-gray-600 text-sm mb-8">Select a resume to get a comprehensive analysis of your career path, gaps, and recommended learning.</p>

            {/* Selection Area - styled like UploadResume's dashed container */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 mb-8">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Resume to Analyze</label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-primary focus:border-primary"
                            value={selectedResume}
                            onChange={(e) => setSelectedResume(e.target.value)}
                            required
                        >
                            <option value="" disabled>-- Choose a Resume --</option>
                            {resumes.map(r => (
                                <option key={r._id} value={r._id}>{r.fileName} - {new Date(r.createdAt).toLocaleDateString()}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={!selectedResume || loading}
                        className={`px-6 py-2 rounded-md text-white font-medium shadow-md transition-all ${
                            !selectedResume || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-indigo-700 transform hover:-translate-y-1'
                        }`}
                    >
                        {loading ? 'Analyzing...' : 'Generate Analysis'}
                    </button>
                </form>
            </div>

            {loading && <Loader />}

            {analysis && (
                <div className="space-y-8 animate-fade-in">
                    {/* Gap & Skills Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-400">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={20} className="text-yellow-500" />
                                <h3 className="text-lg font-bold text-gray-800">Gap & Timeline Analysis</h3>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{analysis.gapAnalysis}</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-400">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle size={20} className="text-blue-500" />
                                <h3 className="text-lg font-bold text-gray-800">Skills Assessment</h3>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{analysis.skillsFeedback}</p>
                        </div>
                    </div>

                    {/* Future Career Paths */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={24} className="text-purple-600" />
                            <h3 className="text-xl font-bold text-gray-900">Recommended Career Paths</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analysis.careerPath?.map((path, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                                    <h4 className="text-base font-bold text-purple-700 mb-2">{path.role}</h4>
                                    <p className="text-gray-600 text-sm">{path.advice}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Recommendations */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase size={24} className="text-teal-600" />
                            <h3 className="text-xl font-bold text-gray-900">Recommended Job Roles</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {analysis.jobRecommendations?.map((job, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all transform hover:-translate-y-0.5 group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">{job.jobTitle}</h4>
                                            <p className="text-sm font-semibold text-gray-700">{job.company}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            job.matchPercentage >= 80 ? 'bg-green-100 text-green-700' :
                                            job.matchPercentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {job.matchPercentage}% Match
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} className="text-gray-400" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={14} className="text-gray-400" />
                                            {job.salaryRange}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 border-t border-gray-100 pt-3">{job.reason}</p>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <a
                                            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.jobTitle + ' ' + job.company)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 bg-[#0077b5] text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-[#005582] transition-colors"
                                        >
                                            <Linkedin size={14} /> LinkedIn
                                        </a>
                                        <a
                                            href={`https://www.indeed.com/jobs?q=${encodeURIComponent(job.jobTitle + ' ' + job.company)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 bg-[#2557a7] text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-[#164081] transition-colors"
                                        >
                                            <ExternalLink size={14} /> Indeed
                                        </a>
                                        <a
                                            href={`https://www.google.com/search?q=${encodeURIComponent(job.jobTitle + ' ' + job.company + ' careers')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-200 border border-gray-300 transition-colors"
                                        >
                                            <Search size={14} /> Search
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Recommendations */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={24} className="text-green-600" />
                            <h3 className="text-xl font-bold text-gray-900">Recommended Courses</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {analysis.recommendations?.map((course, index) => (
                                <CourseCard key={index} course={course} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseRecommendations;