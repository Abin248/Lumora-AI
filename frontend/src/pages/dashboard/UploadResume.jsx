import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, getResumes, reanalyzeResume } from '../../api/resumeApi';
import Loader from '../../components/Loader/Loader';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

const UploadResume = ({ onAnalysisComplete }) => {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'history'
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [historyResumes, setHistoryResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');

    const navigate = useNavigate();

    // Fetch history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await getResumes();
                setHistoryResumes(data);
            } catch (err) {
                console.error("Failed to load history");
            }
        };
        fetchHistory();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (activeTab === 'upload') {
                if (!file) return;
                const formData = new FormData();
                formData.append('resume', file);
                formData.append('jobDescription', jobDescription);

                const { data } = await uploadResume(formData);

                if (onAnalysisComplete) {
                    onAnalysisComplete(null, data._id); // We might need to fetch analysis separately or pass null to force fetch in child
                } else {
                    navigate(`/resume/${data._id}`);
                }
            } else {
                // History Re-Analyze
                if (!selectedResumeId) return;

                const { data } = await reanalyzeResume({
                    resumeId: selectedResumeId,
                    jobDescription
                });

                if (onAnalysisComplete) {
                    onAnalysisComplete(data, selectedResumeId);
                } else {
                    navigate(`/resume/${selectedResumeId}`, {
                        state: { resumeData: data }
                    });
                }
            }
        } catch (err) {
            console.error(err);
            setError('Failed to process resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="w-full h-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Analyze Resume</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'upload'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('upload')}
                >
                    <div className="flex items-center gap-2">
                        <UploadCloud size={18} />
                        Upload New
                    </div>
                </button>
                <button
                    className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('history')}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        Select from History
                    </div>
                </button>
            </div>

            {/* Common JD Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Job Description (Optional but Recommended)
                </label>
                <textarea
                    rows="4"
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-primary focus:border-primary"
                    placeholder="Paste the job description here to get a targeted ATS score..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>

            {/* Tab Content */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50">

                {activeTab === 'upload' ? (
                    <>
                        <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="mb-4 text-gray-500">Select a PDF file to upload</p>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-indigo-700"
                        />
                    </>
                ) : (
                    <div className="w-full max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Fast-Track: Select a previously uploaded resume
                        </label>
                        {historyResumes.length === 0 ? (
                            <p className="text-center text-gray-500 italic">No history found. Please upload a new resume first.</p>
                        ) : (
                            <div className="space-y-3">
                                {historyResumes.map((res) => (
                                    <div
                                        key={res._id}
                                        onClick={() => setSelectedResumeId(res._id)}
                                        className={`p-3 rounded-md border cursor-pointer flex items-center justify-between transition-all ${selectedResumeId === res._id
                                            ? 'border-primary bg-indigo-50 ring-1 ring-primary'
                                            : 'border-gray-200 hover:border-indigo-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-gray-400" size={20} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{res.fileName}</p>
                                                <p className="text-xs text-gray-500">{new Date(res.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {selectedResumeId === res._id && <CheckCircle className="text-primary" size={20} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={activeTab === 'upload' ? !file : !selectedResumeId}
                    className={`mt-8 px-8 py-3 rounded-md text-white font-medium shadow-md transition-all ${(activeTab === 'upload' ? file : selectedResumeId)
                        ? 'bg-primary hover:bg-indigo-700 transform hover:-translate-y-1'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    {activeTab === 'upload' ? 'Upload & Analyze' : 'Re-Analyze Selected Resume'}
                </button>

                {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default UploadResume;
