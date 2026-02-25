import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getResumeById, optimizeResume } from '../../api/resumeApi';
import ResumeScoreCard from '../../components/ResumeScoreCard/ResumeScoreCard';
import Loader from '../../components/Loader/Loader';
import OptimizedResumeView from '../../components/ResumeBuilder/OptimizedResumeView';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const ResumeATS = ({ resumeId, initialData, onBack }) => {
    const location = useLocation();
    const { id } = useParams();


    const activeId = resumeId || id;

    const [resume, setResume] = useState(initialData || location.state?.resumeData || null);
    const [loading, setLoading] = useState(!resume);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState(null);

    useEffect(() => {
        if (resume && (resume._id === activeId || !activeId)) return;

        if (!activeId) return;

        const fetchResume = async () => {
            setLoading(true);
            try {
                const { data } = await getResumeById(activeId);
                setResume(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, [activeId, resume]);

    const handleOptimize = async () => {
        console.log(">>> [ResumeATS] Optimize button clicked");
        if (!resume?.jobDescription) {
            console.log(">>> [ResumeATS] Job Description missing, aborting.");
            alert("No Job Description found! Optimization requires a JD.");
            return;
        }

        console.log(">>> [ResumeATS] Starting optimization...");
        console.log(">>> [ResumeATS] Payload:", {
            resumeId: resume._id || activeId,
            jobDescriptionLength: resume.jobDescription.length
        });

        setOptimizing(true);
        try {
            console.log(">>> [ResumeATS] Calling optimizeResume API...");
            const { data } = await optimizeResume({
                resumeId: resume._id || activeId,
                jobDescription: resume.jobDescription
            });
            console.log(">>> [ResumeATS] Optimization successful. Response Data:", data);
            setOptimizedData(data);
        } catch (error) {
            console.error(">>> [ResumeATS] Optimization error:", error);
            if (error.response) {
                console.error(">>> [ResumeATS] Error Response Data:", error.response.data);
                console.error(">>> [ResumeATS] Error Status:", error.response.status);
            }
            alert("Optimization failed. Please try again.");
        } finally {
            console.log(">>> [ResumeATS] Optimization process finished (finally block).");
            setOptimizing(false);
        }
    };

    if (loading) return <Loader />;
    if (!resume) return <div className="text-center mt-10">Resume not found</div>;

    return (
        <div className="w-full h-full">
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Upload
                </button>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Resume Analysis</h2>

                {!optimizedData && (
                    <button
                        onClick={handleOptimize}
                        disabled={optimizing || !resume.jobDescription}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-white font-bold transition-all shadow-lg ${!resume.jobDescription
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105'
                            }`}
                    >
                        {optimizing ? (
                            <span>Optimizing...</span>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Optimize Resume
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Original Analysis */}
                <div className="space-y-8">
                    <ResumeScoreCard score={resume.atsScore} feedback={resume.atsFeedback} />

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold mb-4">Extracted Details</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold">Name:</span> {resume.personalInfo?.fullName}</p>
                            <p><span className="font-semibold">Email:</span> {resume.personalInfo?.email}</p>
                            <p><span className="font-semibold">Skills:</span> {resume.skills?.join(', ')}</p>
                        </div>

                        {/* Warning Section */}
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-yellow-800">Important Note:</h4>
                                    <div className="mt-1 text-sm text-yellow-700">
                                        <p className="font-semibold">WARNING:</p>
                                        <p>The AI Optimized Resume will update only the PROFESSIONAL SUMMARY part and other keywords.</p>
                                        <p>To achieve max ATS score you need to add work experience and projects related to the Job Position.</p>
                                        <p className="text-red-600 font-bold  p-2 ">The AI will not add work experience and project skills in the "AI Optimized Resume" because it's against the law.</p>
                                        <p>The AI-generated PDF might show a lower ATS score because you need to manually add work experience and projects related to the job position.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Optimized Result or Details */}
                <div>
                    {optimizedData ? (
                        <div className="animate-fade-in">
                            <OptimizedResumeView resumeData={optimizedData} />
                        </div>
                    ) : (
                        <div className=" p-6 rounded-lg border h-full">


                            {!resume.jobDescription && (
                                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">
                                    <strong>Note:</strong> To use AI Optimization, you must analyze the resume with a Job Description.
                                    Please go to "Upload/History" and add a JD.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeATS;
