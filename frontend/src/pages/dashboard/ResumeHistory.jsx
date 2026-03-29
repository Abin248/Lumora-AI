import { useEffect, useState } from 'react';
import { getResumes, deleteResume } from '../../api/resumeApi';
import Loader from '../../components/Loader/Loader';
import { Trash2, Eye, FileText, Plus } from 'lucide-react';

const ResumeHistory = ({ onViewResume, onCreateNew }) => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchResumes = async () => {
        try {
            const { data } = await getResumes();
            setResumes(data);
        } catch (err) {
            setError('Failed to fetch resumes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    // --- Selection Logic ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(resumes.map(r => r._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} resume(s)?`)) {
            try {
                await Promise.all(selectedIds.map(id => deleteResume(id)));
                setResumes(prev => prev.filter(r => !selectedIds.includes(r._id)));
                setSelectedIds([]);
            } catch (err) {
                console.error(err);
                alert('Failed to delete some resumes. Please try again.');
                fetchResumes();
            }
        }
    };

    const handleView = (resume) => {
        if (onViewResume) {
            onViewResume(resume._id, resume);
        } else {
            window.location.href = `/resume/${resume._id}`;
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="w-full h-full animate-fade-in">
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">My Resume History</h2>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-200 text-xs font-semibold flex items-center gap-1 hover:bg-red-100 transition"
                        >
                            <Trash2 size={12} /> Delete {selectedIds.length} Selected
                        </button>
                    )}
                </div>
                {onCreateNew && (
                    <button
                        onClick={onCreateNew}
                        className="bg-primary text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 flex items-center gap-1 shadow-sm transition-all hover:shadow-md text-sm"
                    >
                        <Plus size={14} />
                        Upload New
                    </button>
                )}
            </div>

            {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

            {resumes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm mb-3">No resumes found.</p>
                    {onCreateNew && (
                        <button onClick={onCreateNew} className="text-primary font-bold text-sm hover:underline">
                            Upload your first one!
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left w-8">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                        onChange={handleSelectAll}
                                        checked={resumes.length > 0 && selectedIds.length === resumes.length}
                                    />
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded On</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ATS Score</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {resumes.map((resume) => {
                                const isSelected = selectedIds.includes(resume._id);
                                return (
                                    <tr key={resume._id} className={`transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                                checked={isSelected}
                                                onChange={() => handleSelectOne(resume._id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className={`h-4 w-4 mr-2 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                <div className="text-xs font-medium text-gray-900">{resume.fileName}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                PDF
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(resume.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 font-bold">
                                            <span className={resume.atsScore >= 70 ? 'text-green-600' : 'text-yellow-600'}>
                                                {resume.atsScore}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                                            <button
                                                onClick={() => handleView(resume)}
                                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center transition-transform hover:scale-105"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" /> View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResumeHistory;