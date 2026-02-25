import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { createManualResume, getResumes } from '../../api/resumeApi';

const BuildResume = () => {
    const [activeTab, setActiveTab] = useState('manual');
    const [resumesList, setResumesList] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [loadingResumes, setLoadingResumes] = useState(false);

    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(1);
    const [saving, setSaving] = useState(false);
    const resumeRef = useRef();

    // Preview controls
    const [previewFontSize, setPreviewFontSize] = useState(12);
    const [previewLineHeight, setPreviewLineHeight] = useState(1.5);

    const initialFormData = {
        personalInfo: { fullName: '', title: '', email: '', phone: '', linkedin: '', github: '' },
        summary: '',
        skills: [''],
        experiences: [{ jobTitle: '', company: '', startDate: '', endDate: '', description: '' }],
        education: [{ degree: '', institution: '', year: '', score: '' }],
        projects: [{ title: '', description: '', techStack: [''] }],
        certifications: [{ name: '', issuer: '', issueDate: '', expDate: '', credId: '', url: '', description: '' }],
        achievements: [{ title: '', organization: '', date: '', description: '' }],
        activities: [{ activity: '', role: '', organization: '', startDate: '', endDate: '', description: '' }],
        volunteering: [{ role: '', organization: '', startDate: '', endDate: '', description: '' }],
        workshops: [{ title: '', organization: '', startDate: '', endDate: '', role: '', description: '' }],
        references: [{ name: '', jobTitle: '', company: '', email: '', phone: '', relationship: '' }],
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchResumes = async () => {
            setLoadingResumes(true);
            try {
                const { data } = await getResumes();
                setResumesList(data);
            } catch (error) {
                console.error('Failed to load resumes', error);
            } finally {
                setLoadingResumes(false);
            }
        };
        fetchResumes();
    }, []);

    useEffect(() => {
        if (!selectedResumeId) return;
        const selected = resumesList.find(r => r._id === selectedResumeId);
        if (selected) {
            const merged = {
                personalInfo: { ...initialFormData.personalInfo, ...selected.personalInfo },
                summary: selected.summary || '',
                skills: selected.skills?.length ? selected.skills : [''],
                experiences: selected.experiences?.length ? selected.experiences : [{ jobTitle: '', company: '', startDate: '', endDate: '', description: '' }],
                education: selected.education?.length ? selected.education : [{ degree: '', institution: '', year: '', score: '' }],
                projects: selected.projects?.length ? selected.projects : [{ title: '', description: '', techStack: [''] }],
                certifications: selected.certifications?.length ? selected.certifications : [{ name: '', issuer: '', issueDate: '', expDate: '', credId: '', url: '', description: '' }],
                achievements: selected.achievements?.length ? selected.achievements : [{ title: '', organization: '', date: '', description: '' }],
                activities: selected.activities?.length ? selected.activities : [{ activity: '', role: '', organization: '', startDate: '', endDate: '', description: '' }],
                volunteering: selected.volunteering?.length ? selected.volunteering : [{ role: '', organization: '', startDate: '', endDate: '', description: '' }],
                workshops: selected.workshops?.length ? selected.workshops : [{ title: '', organization: '', startDate: '', endDate: '', role: '', description: '' }],
                references: selected.references?.length ? selected.references : [{ name: '', jobTitle: '', company: '', email: '', phone: '', relationship: '' }],
            };
            setFormData(merged);
            setStep(1);
        }
    }, [selectedResumeId, resumesList]);

    useEffect(() => {
        if (activeTab === 'manual') {
            setFormData(initialFormData);
            setSelectedResumeId('');
        }
    }, [activeTab]);

    const validateStep = (currentStep) => {
        const newErrors = {};
        const { personalInfo, experiences, education, certifications, references } = formData;

        if (currentStep === 1) {
            if (!personalInfo.fullName) newErrors.fullName = "Full Name is required";
            if (!personalInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) newErrors.email = "Valid Email is required";
            if (!personalInfo.phone || !/^\+?[\d\s-]{10,}$/.test(personalInfo.phone)) newErrors.phone = "Valid Phone Number is required";
        }

        if (currentStep === 2) {
            education.forEach((edu, index) => {
                if (!edu.institution) newErrors[`edu_${index}_institution`] = "Institution is required";
                if (!edu.degree) newErrors[`edu_${index}_degree`] = "Degree is required";
                if (!edu.year) newErrors[`edu_${index}_year`] = "Year is required";
            });
        }

        if (currentStep === 3) {
            experiences.forEach((exp, index) => {
                if (!exp.jobTitle) newErrors[`exp_${index}_title`] = "Job Title is required";
                if (!exp.company) newErrors[`exp_${index}_company`] = "Company is required";
                if (!exp.startDate) newErrors[`exp_${index}_start`] = "Start Date is required";
                if (exp.description && exp.description.length < 50) newErrors[`exp_${index}_desc`] = "Description must be at least 50 characters";
            });
        }

        if (currentStep === 5) {
            certifications.forEach((cert, index) => {
                if (cert.name && !cert.issuer) newErrors[`cert_${index}_issuer`] = "Issuer is required";
            });
        }

        if (currentStep === 7) {
            references.forEach((ref, index) => {
                if (ref.name && !ref.email && !ref.phone) {
                    newErrors[`ref_${index}_contact`] = "Provide at least email or phone";
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(8, prev + 1));
        }
    };

    const handleChange = (section, field, value, index = null, subField = null) => {
        setFormData(prev => {
            if (section === 'personalInfo') {
                return { ...prev, personalInfo: { ...prev.personalInfo, [field]: value } };
            }
            if (section === 'summary') {
                return { ...prev, summary: value };
            }
            if (Array.isArray(prev[section])) {
                const newArray = [...prev[section]];
                if (section === 'skills') {
                    newArray[index] = value;
                } else if (section === 'projects' && subField === 'techStack') {
                    const newProject = { ...newArray[index] };
                    newProject[field] = value.split(',').map(s => s.trim());
                    newArray[index] = newProject;
                } else {
                    if (typeof newArray[index] === 'object' && newArray[index] !== null) {
                        newArray[index] = { ...newArray[index], [field]: value };
                    } else {
                        newArray[index] = value;
                    }
                }
                return { ...prev, [section]: newArray };
            }
            return prev;
        });
    };

    const addItem = (section, initialItem) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], initialItem]
        }));
    };

    const removeItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    // Render Personal Info
    const renderPersonalInfo = () => (
        <div className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <input type="text" placeholder="Full Name" className={`p-3 border rounded-lg w-full ${errors.fullName ? 'border-red-500' : ''}`} value={formData.personalInfo.fullName} onChange={e => handleChange('personalInfo', 'fullName', e.target.value)} />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                    <input type="text" placeholder="Professional Title (e.g. Software Engineer)" className="p-3 border rounded-lg w-full" value={formData.personalInfo.title} onChange={e => handleChange('personalInfo', 'title', e.target.value)} />
                </div>
                <div>
                    <input type="email" placeholder="Email" className={`p-3 border rounded-lg w-full ${errors.email ? 'border-red-500' : ''}`} value={formData.personalInfo.email} onChange={e => handleChange('personalInfo', 'email', e.target.value)} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <input type="text" placeholder="Phone" className={`p-3 border rounded-lg w-full ${errors.phone ? 'border-red-500' : ''}`} value={formData.personalInfo.phone} onChange={e => handleChange('personalInfo', 'phone', e.target.value)} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <input type="text" placeholder="LinkedIn URL" className="p-3 border rounded-lg w-full" value={formData.personalInfo.linkedin} onChange={e => handleChange('personalInfo', 'linkedin', e.target.value)} />
                <input type="text" placeholder="GitHub URL" className="p-3 border rounded-lg w-full" value={formData.personalInfo.github} onChange={e => handleChange('personalInfo', 'github', e.target.value)} />
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Professional Summary</label>
                <textarea rows="4" className="w-full p-3 border rounded-lg" placeholder="Brief summary of your career..." value={formData.summary} onChange={e => handleChange('summary', null, e.target.value)} />
            </div>
        </div>
    );

    // Render Education (with score)
    const renderEducation = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 flex justify-between">
                Education
                <button onClick={() => addItem('education', { degree: '', institution: '', year: '', score: '' })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Education</button>
            </h3>
            {formData.education.map((edu, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group">
                    <button onClick={() => removeItem('education', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <input type="text" placeholder="Degree / Major" className={`p-2 border rounded w-full ${errors[`edu_${index}_degree`] ? 'border-red-500' : ''}`} value={edu.degree} onChange={e => handleChange('education', 'degree', e.target.value, index)} />
                            {errors[`edu_${index}_degree`] && <p className="text-red-500 text-xs">{errors[`edu_${index}_degree`]}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Institution / University" className={`p-2 border rounded w-full ${errors[`edu_${index}_institution`] ? 'border-red-500' : ''}`} value={edu.institution} onChange={e => handleChange('education', 'institution', e.target.value, index)} />
                            {errors[`edu_${index}_institution`] && <p className="text-red-500 text-xs">{errors[`edu_${index}_institution`]}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Year" className={`p-2 border rounded w-full ${errors[`edu_${index}_year`] ? 'border-red-500' : ''}`} value={edu.year} onChange={e => handleChange('education', 'year', e.target.value, index)} />
                            {errors[`edu_${index}_year`] && <p className="text-red-500 text-xs">{errors[`edu_${index}_year`]}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Percentage/CGPA" className="p-2 border rounded w-full" value={edu.score} onChange={e => handleChange('education', 'score', e.target.value, index)} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Render Experience
    const renderExperience = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 flex justify-between">
                Experience
                <button onClick={() => addItem('experiences', { jobTitle: '', company: '', startDate: '', endDate: '', description: '' })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Position</button>
            </h3>
            {formData.experiences.map((exp, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group">
                    <button onClick={() => removeItem('experiences', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <input type="text" placeholder="Job Title" className={`p-2 border rounded w-full ${errors[`exp_${index}_title`] ? 'border-red-500' : ''}`} value={exp.jobTitle} onChange={e => handleChange('experiences', 'jobTitle', e.target.value, index)} />
                            {errors[`exp_${index}_title`] && <p className="text-red-500 text-xs">{errors[`exp_${index}_title`]}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Company" className={`p-2 border rounded w-full ${errors[`exp_${index}_company`] ? 'border-red-500' : ''}`} value={exp.company} onChange={e => handleChange('experiences', 'company', e.target.value, index)} />
                            {errors[`exp_${index}_company`] && <p className="text-red-500 text-xs">{errors[`exp_${index}_company`]}</p>}
                        </div>
                        <div>
                            <input type="text" placeholder="Start Date" className={`p-2 border rounded w-full ${errors[`exp_${index}_start`] ? 'border-red-500' : ''}`} value={exp.startDate} onChange={e => handleChange('experiences', 'startDate', e.target.value, index)} />
                            {errors[`exp_${index}_start`] && <p className="text-red-500 text-xs">{errors[`exp_${index}_start`]}</p>}
                        </div>
                        <input type="text" placeholder="End Date" className="p-2 border rounded w-full" value={exp.endDate} onChange={e => handleChange('experiences', 'endDate', e.target.value, index)} />
                    </div>
                    <div>
                        <textarea rows="3" placeholder="Description of responsibilities (min 50 chars)..." className={`w-full p-2 border rounded ${errors[`exp_${index}_desc`] ? 'border-red-500' : ''}`} value={exp.description} onChange={e => handleChange('experiences', 'description', e.target.value, index)} />
                        {errors[`exp_${index}_desc`] && <p className="text-red-500 text-xs">{errors[`exp_${index}_desc`]}</p>}
                    </div>
                </div>
            ))}
        </div>
    );

    // Render Skills & Projects
    const renderSkillsAndProjects = () => (
        <div className="space-y-8 animate-fade-in">
            {/* Skills */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                    Skills
                    <button onClick={() => addItem('skills', '')} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Skill</button>
                </h3>
                <div className="flex flex-wrap gap-3">
                    {formData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center">
                            <input type="text" className="p-2 border rounded w-40" value={skill} onChange={e => handleChange('skills', null, e.target.value, index)} placeholder="Skill" />
                            <button onClick={() => removeItem('skills', index)} className="ml-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Projects */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                    Projects
                    <button onClick={() => addItem('projects', { title: '', description: '', techStack: [] })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Project</button>
                </h3>
                {formData.projects.map((proj, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group mb-3">
                        <button onClick={() => removeItem('projects', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                        <input type="text" placeholder="Project Title" className="w-full p-2 border rounded mb-2" value={proj.title} onChange={e => handleChange('projects', 'title', e.target.value, index)} />
                        <input type="text" placeholder="Tech Stack (comma separated)" className="w-full p-2 border rounded mb-2" defaultValue={proj.techStack.join(', ')} onBlur={e => {
                            handleChange('projects', 'techStack', e.target.value, index, 'techStack');
                        }} />
                        <textarea rows="2" placeholder="Project Description" className="w-full p-2 border rounded" value={proj.description} onChange={e => handleChange('projects', 'description', e.target.value, index)} />
                    </div>
                ))}
            </div>
        </div>
    );

    // Render Certifications & Achievements
    const renderCertificationsAndAchievements = () => (
        <div className="space-y-8 animate-fade-in">
            {/* Certifications */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                    Certifications
                    <button onClick={() => addItem('certifications', { name: '', issuer: '', issueDate: '', expDate: '', credId: '', url: '', description: '' })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Certification</button>
                </h3>
                {formData.certifications.map((cert, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group mb-3">
                        <button onClick={() => removeItem('certifications', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="text" placeholder="Certificate Name" className="w-full p-2 border rounded" value={cert.name} onChange={e => handleChange('certifications', 'name', e.target.value, index)} />
                            <input type="text" placeholder="Issuing Organization" className={`w-full p-2 border rounded ${errors[`cert_${index}_issuer`] ? 'border-red-500' : ''}`} value={cert.issuer} onChange={e => handleChange('certifications', 'issuer', e.target.value, index)} />
                            <input type="text" placeholder="Issue Date" className="w-full p-2 border rounded" value={cert.issueDate} onChange={e => handleChange('certifications', 'issueDate', e.target.value, index)} />
                            <input type="text" placeholder="Expiration Date (Optional)" className="w-full p-2 border rounded" value={cert.expDate} onChange={e => handleChange('certifications', 'expDate', e.target.value, index)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="text" placeholder="Credential ID (Optional)" className="w-full p-2 border rounded" value={cert.credId} onChange={e => handleChange('certifications', 'credId', e.target.value, index)} />
                            <input type="text" placeholder="Verification URL (Optional)" className="w-full p-2 border rounded" value={cert.url} onChange={e => handleChange('certifications', 'url', e.target.value, index)} />
                        </div>
                        <textarea rows="2" placeholder="Description / Notes (Optional)" className="w-full p-2 border rounded" value={cert.description} onChange={e => handleChange('certifications', 'description', e.target.value, index)} />
                        {errors[`cert_${index}_issuer`] && <p className="text-red-500 text-xs">{errors[`cert_${index}_issuer`]}</p>}
                    </div>
                ))}
            </div>

            {/* Achievements */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                    Achievements
                    <button onClick={() => addItem('achievements', { title: '', organization: '', date: '', description: '' })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Achievement</button>
                </h3>
                {formData.achievements.map((ach, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group mb-3">
                        <button onClick={() => removeItem('achievements', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="text" placeholder="Title / Name" className="w-full p-2 border rounded" value={ach.title} onChange={e => handleChange('achievements', 'title', e.target.value, index)} />
                            <input type="text" placeholder="Organization / Event" className="w-full p-2 border rounded" value={ach.organization} onChange={e => handleChange('achievements', 'organization', e.target.value, index)} />
                            <input type="text" placeholder="Date" className="w-full p-2 border rounded" value={ach.date} onChange={e => handleChange('achievements', 'date', e.target.value, index)} />
                        </div>
                        <textarea rows="2" placeholder="Description / Details" className="w-full p-2 border rounded" value={ach.description} onChange={e => handleChange('achievements', 'description', e.target.value, index)} />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAdditionalActivities = () => (
        <div className="space-y-8 animate-fade-in">
            {/* Extra-Curriculars */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                    Extra-Curricular Activities
                    <button onClick={() => addItem('activities', { activity: '', role: '', organization: '', startDate: '', endDate: '', description: '' })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Activity</button>
                </h3>
                {formData.activities.map((act, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group mb-3">
                        <button onClick={() => removeItem('activities', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="text" placeholder="Activity Name" className="w-full p-2 border rounded" value={act.activity} onChange={e => handleChange('activities', 'activity', e.target.value, index)} />
                            <input type="text" placeholder="Role / Position" className="w-full p-2 border rounded" value={act.role} onChange={e => handleChange('activities', 'role', e.target.value, index)} />
                            <input type="text" placeholder="Organization" className="w-full p-2 border rounded" value={act.organization} onChange={e => handleChange('activities', 'organization', e.target.value, index)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="text" placeholder="Start Date" className="w-full p-2 border rounded" value={act.startDate} onChange={e => handleChange('activities', 'startDate', e.target.value, index)} />
                            <input type="text" placeholder="End Date / Present" className="w-full p-2 border rounded" value={act.endDate} onChange={e => handleChange('activities', 'endDate', e.target.value, index)} />
                        </div>
                        <textarea rows="2" placeholder="Description / Achievements" className="w-full p-2 border rounded" value={act.description} onChange={e => handleChange('activities', 'description', e.target.value, index)} />
                    </div>
                ))}
            </div>

            {/* Volunteering */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                    Volunteering / Social Work
                    <button onClick={() => addItem('volunteering', { role: '', organization: '', startDate: '', endDate: '', description: '' })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Work</button>
                </h3>
                {formData.volunteering.map((vol, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group mb-3">
                        <button onClick={() => removeItem('volunteering', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="text" placeholder="Role / Position" className="w-full p-2 border rounded" value={vol.role} onChange={e => handleChange('volunteering', 'role', e.target.value, index)} />
                            <input type="text" placeholder="Organization" className="w-full p-2 border rounded" value={vol.organization} onChange={e => handleChange('volunteering', 'organization', e.target.value, index)} />
                            <input type="text" placeholder="Start Date" className="w-full p-2 border rounded" value={vol.startDate} onChange={e => handleChange('volunteering', 'startDate', e.target.value, index)} />
                            <input type="text" placeholder="End Date / Present" className="w-full p-2 border rounded" value={vol.endDate} onChange={e => handleChange('volunteering', 'endDate', e.target.value, index)} />
                        </div>
                        <textarea rows="2" placeholder="Description / Highlights" className="w-full p-2 border rounded" value={vol.description} onChange={e => handleChange('volunteering', 'description', e.target.value, index)} />
                    </div>
                ))}
            </div>

            {/* Workshops */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
                    Workshops / Internships
                    <button onClick={() => addItem('workshops', { title: '', organization: '', startDate: '', endDate: '', role: '', description: '' })} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"><Plus size={14} /> Add Entry</button>
                </h3>
                {formData.workshops.map((work, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group mb-3">
                        <button onClick={() => removeItem('workshops', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <input type="text" placeholder="Title / Topic" className="w-full p-2 border rounded" value={work.title} onChange={e => handleChange('workshops', 'title', e.target.value, index)} />
                            <input type="text" placeholder="Organization / Company" className="w-full p-2 border rounded" value={work.organization} onChange={e => handleChange('workshops', 'organization', e.target.value, index)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                            <input type="text" placeholder="Start Date" className="w-full p-2 border rounded" value={work.startDate} onChange={e => handleChange('workshops', 'startDate', e.target.value, index)} />
                            <input type="text" placeholder="End Date" className="w-full p-2 border rounded" value={work.endDate} onChange={e => handleChange('workshops', 'endDate', e.target.value, index)} />
                            <input type="text" placeholder="Role / Position" className="w-full p-2 border rounded" value={work.role} onChange={e => handleChange('workshops', 'role', e.target.value, index)} />
                        </div>
                        <textarea rows="2" placeholder="Key Learnings" className="w-full p-2 border rounded" value={work.description} onChange={e => handleChange('workshops', 'description', e.target.value, index)} />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReferences = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 flex justify-between">
                References
                <button
                    onClick={() => addItem('references', { name: '', jobTitle: '', company: '', email: '', phone: '', relationship: '' })}
                    className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-200"
                >
                    <Plus size={14} /> Add Reference
                </button>
            </h3>
            {formData.references.map((ref, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group">
                    <button
                        onClick={() => removeItem('references', index)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <input
                            type="text"
                            placeholder="Full Name *"
                            className="p-2 border rounded w-full"
                            value={ref.name}
                            onChange={e => handleChange('references', 'name', e.target.value, index)}
                        />
                        <input
                            type="text"
                            placeholder="Job Title"
                            className="p-2 border rounded w-full"
                            value={ref.jobTitle}
                            onChange={e => handleChange('references', 'jobTitle', e.target.value, index)}
                        />
                        <input
                            type="text"
                            placeholder="Company"
                            className="p-2 border rounded w-full"
                            value={ref.company}
                            onChange={e => handleChange('references', 'company', e.target.value, index)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-2 border rounded w-full"
                            value={ref.email}
                            onChange={e => handleChange('references', 'email', e.target.value, index)}
                        />
                        <input
                            type="text"
                            placeholder="Phone"
                            className="p-2 border rounded w-full"
                            value={ref.phone}
                            onChange={e => handleChange('references', 'phone', e.target.value, index)}
                        />
                        <input
                            type="text"
                            placeholder="Relationship (e.g., Manager, Colleague)"
                            className="p-2 border rounded w-full"
                            value={ref.relationship}
                            onChange={e => handleChange('references', 'relationship', e.target.value, index)}
                        />
                    </div>
                    {errors[`ref_${index}_contact`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`ref_${index}_contact`]}</p>
                    )}
                </div>
            ))}
        </div>
    );

    const renderPreview = () => {

        const nonEmptyExperiences = formData.experiences.filter(exp => 
            exp.jobTitle?.trim() || exp.company?.trim() || exp.startDate?.trim() || exp.endDate?.trim() || exp.description?.trim()
        );
        const nonEmptyEducation = formData.education.filter(edu => 
            edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim() || edu.score?.trim()
        );
        const nonEmptyProjects = formData.projects.filter(proj => 
            proj.title?.trim() || proj.description?.trim() || (proj.techStack && proj.techStack.some(t => t?.trim()))
        );
        const nonEmptyCertifications = formData.certifications.filter(cert => 
            cert.name?.trim() || cert.issuer?.trim() || cert.issueDate?.trim() || cert.expDate?.trim() || cert.credId?.trim() || cert.url?.trim() || cert.description?.trim()
        );
        const nonEmptyAchievements = formData.achievements.filter(ach => 
            ach.title?.trim() || ach.organization?.trim() || ach.date?.trim() || ach.description?.trim()
        );
        const nonEmptyActivities = formData.activities.filter(act => 
            act.activity?.trim() || act.role?.trim() || act.organization?.trim() || act.startDate?.trim() || act.endDate?.trim() || act.description?.trim()
        );
        const nonEmptyVolunteering = formData.volunteering.filter(vol => 
            vol.role?.trim() || vol.organization?.trim() || vol.startDate?.trim() || vol.endDate?.trim() || vol.description?.trim()
        );
        const nonEmptyWorkshops = formData.workshops.filter(ws => 
            ws.title?.trim() || ws.organization?.trim() || ws.startDate?.trim() || ws.endDate?.trim() || ws.role?.trim() || ws.description?.trim()
        );
        const nonEmptyReferences = formData.references.filter(ref => 
            ref.name?.trim() || ref.jobTitle?.trim() || ref.company?.trim() || ref.email?.trim() || ref.phone?.trim() || ref.relationship?.trim()
        );

        const getTech = (stack) => Array.isArray(stack) ? stack.join(', ') : stack;

        const renderReferencesSection = () => {
            if (nonEmptyReferences.length === 0) return null;
            return (
                <div className="mt-6">
                    <h2 className="text-lg font-bold uppercase text-gray-700 mb-3">References</h2>
                    {nonEmptyReferences.map((ref, i) => (
                        <div key={i} className="mb-3 text-sm">
                            <div className="font-bold">{ref.name}</div>
                            <div>{ref.jobTitle}{ref.company && `, ${ref.company}`}</div>
                            <div className="text-gray-600">
                                {ref.email && <span>{ref.email} </span>}
                                {ref.phone && <span>{ref.phone}</span>}
                            </div>
                            {ref.relationship && <div className="text-xs text-gray-500">({ref.relationship})</div>}
                        </div>
                    ))}
                </div>
            );
        };

        return (
            <div className="animate-fade-in">
                {/* Controls */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Font Size:</label>
                        <input
                            type="range"
                            min="10"
                            max="20"
                            step="1"
                            value={previewFontSize}
                            onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                            className="w-32"
                        />
                        <span className="text-sm text-gray-600 w-8">{previewFontSize}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Line Spacing:</label>
                        <input
                            type="range"
                            min="1"
                            max="2"
                            step="0.1"
                            value={previewLineHeight}
                            onChange={(e) => setPreviewLineHeight(Number(e.target.value))}
                            className="w-32"
                        />
                        <span className="text-sm text-gray-600 w-8">{previewLineHeight.toFixed(1)}</span>
                    </div>
                </div>

                {/* Preview container */}
                <div className="h-[600px] overflow-y-auto border-4 border-gray-300 rounded-lg p-2 bg-gray-100">
                    <div
                        ref={resumeRef}
                        className="preview-content bg-white min-h-full p-10 shadow-lg origin-top scale-95"
                        style={{
                            fontSize: `${previewFontSize}px`,
                            lineHeight: previewLineHeight,
                        }}
                    >
                        <style>{`
                            .preview-content * {
                                line-height: inherit;
                            }
                            .preview-content .text-xs { font-size: 0.75em; }
                            .preview-content .text-sm { font-size: 0.875em; }
                            .preview-content .text-base { font-size: 1em; }
                            .preview-content .text-lg { font-size: 1.125em; }
                            .preview-content .text-xl { font-size: 1.25em; }
                            .preview-content .text-2xl { font-size: 1.5em; }
                            .preview-content .text-3xl { font-size: 1.875em; }
                            .preview-content .text-4xl { font-size: 2.25em; }
                        `}</style>

                        {(() => {
                            const { personalInfo, summary, skills } = formData;

                            switch (selectedTemplate) {
                                case 2: // Modern Tech
                                    return (
                                        <div className="font-sans text-gray-800">
                                            <div className="bg-slate-800 text-white p-6 rounded-t-lg">
                                                <h1 className="text-4xl font-bold mb-1">{personalInfo.fullName}</h1>
                                                {personalInfo.title && <p className="text-lg text-slate-300 mb-3">{personalInfo.title}</p>}
                                                <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                                                    <span>{personalInfo.email}</span>
                                                    <span>{personalInfo.phone}</span>
                                                    <span>{personalInfo.linkedin}</span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                {summary && <div className="mb-6"><h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Summary</h3><p>{summary}</p></div>}
                                                {nonEmptyExperiences.length > 0 && (
                                                    <div className="mb-6"><h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Experience</h3>
                                                        {nonEmptyExperiences.map((exp, i) => (
                                                            <div key={i} className="mb-4">
                                                                <div className="flex justify-between font-bold"><span>{exp.jobTitle}</span><span>{exp.startDate} - {exp.endDate}</span></div>
                                                                <div className="text-slate-600 mb-1">{exp.company}</div>
                                                                <p className="text-sm">{exp.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {nonEmptyProjects.length > 0 && (
                                                    <div className="mb-6"><h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Projects</h3>
                                                        {nonEmptyProjects.map((proj, i) => (
                                                            <div key={i} className="mb-4">
                                                                <h4 className="font-bold">{proj.title}</h4>
                                                                {proj.techStack && proj.techStack.length > 0 && <div className="text-xs text-slate-500 mb-1">Tech: {getTech(proj.techStack)}</div>}
                                                                <p className="text-sm">{proj.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {nonEmptyEducation.length > 0 && (
                                                    <div className="mb-6"><h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Education</h3>
                                                        {nonEmptyEducation.map((edu, i) => (
                                                            <div key={i} className="flex justify-between">
                                                                <div>
                                                                    <div className="font-bold">{edu.institution}</div>
                                                                    <div>{edu.degree}</div>
                                                                    {edu.score && <div className="text-xs text-slate-500">Score: {edu.score}</div>}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{edu.year}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {skills.some(s => s.trim()) && (
                                                    <div><h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Skills</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skills.filter(s => s.trim()).map((s, i) => (
                                                                <span key={i} className="bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold text-slate-700">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {nonEmptyCertifications.length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Certifications</h3>
                                                        {nonEmptyCertifications.map((cert, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{cert.name}</div>
                                                                <div className="text-sm text-slate-600">{cert.issuer}{cert.issueDate && ` · ${cert.issueDate}`}</div>
                                                                {cert.description && <p className="text-xs text-slate-500 mt-1">{cert.description}</p>}
                                                                {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Verify</a>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyAchievements.length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Achievements</h3>
                                                        {nonEmptyAchievements.map((ach, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{ach.title}</div>
                                                                <div className="text-sm text-slate-600">{ach.organization}{ach.date && ` · ${ach.date}`}</div>
                                                                <p className="text-sm mt-1">{ach.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyActivities.length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Activities</h3>
                                                        {nonEmptyActivities.map((act, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{act.activity}</div>
                                                                <div className="text-sm text-slate-600">{act.role}{act.organization && `, ${act.organization}`}</div>
                                                                <div className="text-xs text-slate-500">{act.startDate} - {act.endDate}</div>
                                                                <p className="text-sm mt-1">{act.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyVolunteering.length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Volunteering</h3>
                                                        {nonEmptyVolunteering.map((vol, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{vol.role}</div>
                                                                <div className="text-sm text-slate-600">{vol.organization}</div>
                                                                <div className="text-xs text-slate-500">{vol.startDate} - {vol.endDate}</div>
                                                                <p className="text-sm mt-1">{vol.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyWorkshops.length > 0 && (
                                                    <div className="mt-6">
                                                        <h3 className="text-xl font-bold border-b-2 border-slate-800 mb-2">Workshops & Trainings</h3>
                                                        {nonEmptyWorkshops.map((ws, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{ws.title}</div>
                                                                <div className="text-sm text-slate-600">{ws.role}{ws.organization && `, ${ws.organization}`}</div>
                                                                <div className="text-xs text-slate-500">{ws.startDate} - {ws.endDate}</div>
                                                                <p className="text-sm mt-1">{ws.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {renderReferencesSection()}
                                            </div>
                                        </div>
                                    );
                                case 3: // Minimalist
                                    return (
                                        <div className="font-serif text-gray-900 max-w-3xl mx-auto">
                                            <div className="text-center border-b-2 border-gray-900 pb-6 mb-6">
                                                <h1 className="text-3xl uppercase tracking-widest mb-2">{personalInfo.fullName}</h1>
                                                {personalInfo.title && <p className="text-lg text-gray-700 mb-3">{personalInfo.title}</p>}
                                                <p className="text-sm text-gray-600">{personalInfo.email} | {personalInfo.phone}</p>
                                                <p className="text-sm text-blue-800">{personalInfo.linkedin}</p>
                                            </div>
                                            {summary && <div className="mb-8"><p className="text-center italic text-lg">{summary}</p></div>}
                                            {nonEmptyExperiences.length > 0 && (
                                                <div className="mb-8"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Experience</h2>
                                                    {nonEmptyExperiences.map((exp, i) => (
                                                        <div key={i} className="mb-6">
                                                            <div className="flex justify-between items-baseline mb-1"><h3 className="font-bold text-lg">{exp.company}</h3><span className="text-sm italic">{exp.startDate} - {exp.endDate}</span></div>
                                                            <div className="text-sm font-semibold mb-2">{exp.jobTitle}</div>
                                                            <p className="text-sm leading-relaxed">{exp.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {nonEmptyProjects.length > 0 && (
                                                <div className="mb-8"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Projects</h2>
                                                    {nonEmptyProjects.map((proj, i) => (
                                                        <div key={i} className="mb-4">
                                                            <h3 className="font-bold">{proj.title}</h3>
                                                            {proj.techStack && proj.techStack.length > 0 && <div className="text-xs italic text-gray-500 mb-1">{getTech(proj.techStack)}</div>}
                                                            <p className="text-sm leading-relaxed">{proj.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {nonEmptyEducation.length > 0 && (
                                                <div className="mb-8"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Education</h2>
                                                    {nonEmptyEducation.map((edu, i) => (
                                                        <div key={i} className="flex justify-between items-baseline mb-2">
                                                            <h3 className="font-bold">{edu.institution}</h3>
                                                            <span className="text-sm">{edu.year}</span>
                                                            <div className="flex-1 ml-4 text-right italic">
                                                                {edu.degree}
                                                                {edu.score && <span className="block text-xs text-gray-400">Score: {edu.score}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyCertifications.length > 0 && (
                                                <div className="mb-8">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Certifications</h2>
                                                    {nonEmptyCertifications.map((cert, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{cert.name}</div>
                                                            <div className="text-sm text-gray-600">{cert.issuer}{cert.issueDate && ` · ${cert.issueDate}`}</div>
                                                            {cert.description && <p className="text-xs text-gray-500 mt-1">{cert.description}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyAchievements.length > 0 && (
                                                <div className="mb-8">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Achievements</h2>
                                                    {nonEmptyAchievements.map((ach, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{ach.title}</div>
                                                            <div className="text-sm text-gray-600">{ach.organization}{ach.date && ` · ${ach.date}`}</div>
                                                            <p className="text-sm">{ach.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyActivities.length > 0 && (
                                                <div className="mb-8">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Activities</h2>
                                                    {nonEmptyActivities.map((act, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{act.activity}</div>
                                                            <div className="text-sm text-gray-600">{act.role}{act.organization && `, ${act.organization}`}</div>
                                                            <div className="text-xs text-gray-400">{act.startDate} - {act.endDate}</div>
                                                            <p className="text-sm">{act.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyVolunteering.length > 0 && (
                                                <div className="mb-8">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Volunteering</h2>
                                                    {nonEmptyVolunteering.map((vol, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{vol.role}</div>
                                                            <div className="text-sm text-gray-600">{vol.organization}</div>
                                                            <div className="text-xs text-gray-400">{vol.startDate} - {vol.endDate}</div>
                                                            <p className="text-sm">{vol.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyWorkshops.length > 0 && (
                                                <div className="mb-8">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-4 text-gray-500">Workshops & Trainings</h2>
                                                    {nonEmptyWorkshops.map((ws, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{ws.title}</div>
                                                            <div className="text-sm text-gray-600">{ws.role}{ws.organization && `, ${ws.organization}`}</div>
                                                            <div className="text-xs text-gray-400">{ws.startDate} - {ws.endDate}</div>
                                                            <p className="text-sm">{ws.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {renderReferencesSection()}
                                        </div>
                                    );
                                case 4: // Creative
                                    return (
                                        <div className="font-sans flex h-full min-h-[800px]">
                                            <div className="w-1/3 bg-gray-900 text-white p-6">
                                                <h1 className="text-2xl font-bold mb-2 break-words">{personalInfo.fullName}</h1>
                                                {personalInfo.title && <p className="text-sm text-gray-300 mb-6">{personalInfo.title}</p>}
                                                <div className="mb-8 text-sm space-y-2 opacity-80">
                                                    <p>{personalInfo.email}</p>
                                                    <p>{personalInfo.phone}</p>
                                                    <p>{personalInfo.linkedin}</p>
                                                </div>
                                                <div className="mb-8">
                                                    <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4">Skills</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {skills.filter(s => s.trim()).map(s => (
                                                            <span className="bg-gray-800 px-2 py-1 text-xs rounded" key={s}>{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {nonEmptyEducation.length > 0 && (
                                                    <div>
                                                        <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4">Education</h3>
                                                        {nonEmptyEducation.map((edu, i) => (
                                                            <div key={i} className="mb-4 text-sm">
                                                                <p className="font-bold">{edu.degree}</p>
                                                                <p>{edu.institution}</p>
                                                                <p className="opacity-60">{edu.year} {edu.score && `| Score: ${edu.score}`}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {nonEmptyCertifications.length > 0 && (
                                                    <div className="mt-8">
                                                        <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4">Certifications</h3>
                                                        {nonEmptyCertifications.map((cert, i) => (
                                                            <div key={i} className="mb-3 text-sm text-gray-300">
                                                                <div className="font-bold">{cert.name}</div>
                                                                <div>{cert.issuer}{cert.issueDate && ` · ${cert.issueDate}`}</div>
                                                                {cert.description && <p className="text-xs">{cert.description}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-2/3 bg-white p-8">
                                                {summary && <div className="mb-8"><h3 className="text-xl font-bold text-gray-900 mb-2 uppercase">Profile</h3><p className="text-gray-600">{summary}</p></div>}
                                                {nonEmptyExperiences.length > 0 && (
                                                    <div className="mb-8"><h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">Experience</h3>
                                                        {nonEmptyExperiences.map((exp, i) => (
                                                            <div key={i} className="mb-6">
                                                                <h4 className="font-bold text-lg">{exp.jobTitle}</h4>
                                                                <p className="text-indigo-600 font-medium mb-1">{exp.company}</p>
                                                                <p className="text-gray-400 text-sm mb-2">{exp.startDate} - {exp.endDate}</p>
                                                                <p className="text-gray-600 text-sm">{exp.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {nonEmptyProjects.length > 0 && (
                                                    <div><h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">Projects</h3>
                                                        {nonEmptyProjects.map((proj, i) => (
                                                            <div key={i} className="mb-5">
                                                                <h4 className="font-bold text-lg">{proj.title}</h4>
                                                                {proj.techStack && proj.techStack.length > 0 && <p className="text-indigo-600 text-sm mb-1">Tech Stack: {getTech(proj.techStack)}</p>}
                                                                <p className="text-gray-600 text-sm">{proj.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyAchievements.length > 0 && (
                                                    <div className="mt-8">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">Achievements</h3>
                                                        {nonEmptyAchievements.map((ach, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{ach.title}</div>
                                                                <div className="text-sm text-gray-600">{ach.organization}{ach.date && ` · ${ach.date}`}</div>
                                                                <p className="text-sm">{ach.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyActivities.length > 0 && (
                                                    <div className="mt-8">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">Activities</h3>
                                                        {nonEmptyActivities.map((act, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{act.activity}</div>
                                                                <div className="text-sm text-gray-600">{act.role}{act.organization && `, ${act.organization}`}</div>
                                                                <div className="text-xs text-gray-400">{act.startDate} - {act.endDate}</div>
                                                                <p className="text-sm">{act.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyVolunteering.length > 0 && (
                                                    <div className="mt-8">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">Volunteering</h3>
                                                        {nonEmptyVolunteering.map((vol, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{vol.role}</div>
                                                                <div className="text-sm text-gray-600">{vol.organization}</div>
                                                                <div className="text-xs text-gray-400">{vol.startDate} - {vol.endDate}</div>
                                                                <p className="text-sm">{vol.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {nonEmptyWorkshops.length > 0 && (
                                                    <div className="mt-8">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">Workshops & Trainings</h3>
                                                        {nonEmptyWorkshops.map((ws, i) => (
                                                            <div key={i} className="mb-3">
                                                                <div className="font-bold">{ws.title}</div>
                                                                <div className="text-sm text-gray-600">{ws.role}{ws.organization && `, ${ws.organization}`}</div>
                                                                <div className="text-xs text-gray-400">{ws.startDate} - {ws.endDate}</div>
                                                                <p className="text-sm">{ws.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {renderReferencesSection()}
                                            </div>
                                        </div>
                                    );
                                case 5: // Executive
                                    return (
                                        <div className="font-serif border-t-8 border-indigo-900 p-8 max-w-4xl mx-auto">
                                            <header className="flex justify-between items-end border-b-2 border-gray-200 pb-6 mb-6">
                                                <div>
                                                    <h1 className="text-4xl font-bold text-indigo-900">{personalInfo.fullName}</h1>
                                                    {personalInfo.title && <p className="text-xl text-gray-500 mt-2">{personalInfo.title}</p>}
                                                </div>
                                                <div className="text-right text-sm space-y-1 text-gray-600">
                                                    <p>{personalInfo.email}</p>
                                                    <p>{personalInfo.phone}</p>
                                                    <p>{personalInfo.linkedin}</p>
                                                </div>
                                            </header>
                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="col-span-2 space-y-6">
                                                    {summary && <section><h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Executive Summary</h3><p className="text-gray-700 leading-relaxed">{summary}</p></section>}
                                                    {nonEmptyExperiences.length > 0 && (
                                                        <section><h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-4">Experience</h3>
                                                            {nonEmptyExperiences.map((exp, i) => (
                                                                <div key={i} className="mb-5 border-l-2 border-indigo-100 pl-4">
                                                                    <h4 className="font-bold text-gray-800">{exp.jobTitle}</h4>
                                                                    <div className="flex justify-between text-sm text-indigo-600 font-medium mb-2"><span>{exp.company}</span><span>{exp.startDate} - {exp.endDate}</span></div>
                                                                    <p className="text-sm text-gray-600">{exp.description}</p>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}
                                                    {nonEmptyProjects.length > 0 && (
                                                        <section><h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-4">Key Projects</h3>
                                                            {nonEmptyProjects.map((proj, i) => (
                                                                <div key={i} className="mb-4 border-l-2 border-indigo-100 pl-4">
                                                                    <h4 className="font-bold text-gray-800">{proj.title}</h4>
                                                                    {proj.techStack && proj.techStack.length > 0 && <p className="text-xs text-indigo-600 mb-1">Technologies: {getTech(proj.techStack)}</p>}
                                                                    <p className="text-sm text-gray-600">{proj.description}</p>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}

                                                    {nonEmptyAchievements.length > 0 && (
                                                        <section className="mt-6">
                                                            <h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Achievements</h3>
                                                            {nonEmptyAchievements.map((ach, i) => (
                                                                <div key={i} className="mb-3 pl-4 border-l-2 border-indigo-100">
                                                                    <h4 className="font-bold text-gray-800">{ach.title}</h4>
                                                                    <div className="text-xs text-gray-600">{ach.organization}{ach.date && ` · ${ach.date}`}</div>
                                                                    <p className="text-sm text-gray-600">{ach.description}</p>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}

                                                    {nonEmptyActivities.length > 0 && (
                                                        <section className="mt-6">
                                                            <h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Activities</h3>
                                                            {nonEmptyActivities.map((act, i) => (
                                                                <div key={i} className="mb-3 pl-4 border-l-2 border-indigo-100">
                                                                    <h4 className="font-bold text-gray-800">{act.activity}</h4>
                                                                    <div className="text-xs text-gray-600">{act.role}{act.organization && `, ${act.organization}`}</div>
                                                                    <div className="text-xs text-gray-400">{act.startDate} - {act.endDate}</div>
                                                                    <p className="text-sm text-gray-600">{act.description}</p>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}

                                                    {nonEmptyVolunteering.length > 0 && (
                                                        <section className="mt-6">
                                                            <h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Volunteering</h3>
                                                            {nonEmptyVolunteering.map((vol, i) => (
                                                                <div key={i} className="mb-3 pl-4 border-l-2 border-indigo-100">
                                                                    <h4 className="font-bold text-gray-800">{vol.role}</h4>
                                                                    <div className="text-xs text-gray-600">{vol.organization}</div>
                                                                    <div className="text-xs text-gray-400">{vol.startDate} - {vol.endDate}</div>
                                                                    <p className="text-sm text-gray-600">{vol.description}</p>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}

                                                    {nonEmptyWorkshops.length > 0 && (
                                                        <section className="mt-6">
                                                            <h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Workshops & Trainings</h3>
                                                            {nonEmptyWorkshops.map((ws, i) => (
                                                                <div key={i} className="mb-3 pl-4 border-l-2 border-indigo-100">
                                                                    <h4 className="font-bold text-gray-800">{ws.title}</h4>
                                                                    <div className="text-xs text-gray-600">{ws.role}{ws.organization && `, ${ws.organization}`}</div>
                                                                    <div className="text-xs text-gray-400">{ws.startDate} - {ws.endDate}</div>
                                                                    <p className="text-sm text-gray-600">{ws.description}</p>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}

                                                    {renderReferencesSection()}
                                                </div>
                                                <div className="space-y-6">
                                                    {skills.some(s => s.trim()) && (
                                                        <section className="bg-gray-50 p-4 rounded-lg"><h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Expertise</h3>
                                                            <ul className="space-y-2 text-sm text-gray-700">
                                                                {skills.filter(s => s.trim()).map((s, i) => (
                                                                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />{s}</li>
                                                                ))}
                                                            </ul>
                                                        </section>
                                                    )}
                                                    {nonEmptyEducation.length > 0 && (
                                                        <section><h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Education</h3>
                                                            {nonEmptyEducation.map((edu, i) => (
                                                                <div key={i} className="mb-3">
                                                                    <p className="font-bold text-gray-800 text-sm">{edu.institution}</p>
                                                                    <p className="text-xs text-gray-600">{edu.degree}</p>
                                                                    <p className="text-xs text-gray-400">{edu.year} {edu.score && `- ${edu.score}`}</p>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}

                                                    {nonEmptyCertifications.length > 0 && (
                                                        <section className="mt-6">
                                                            <h3 className="text-indigo-900 font-bold uppercase tracking-wider mb-3">Credentials</h3>
                                                            {nonEmptyCertifications.map((cert, i) => (
                                                                <div key={i} className="mb-3">
                                                                    <div className="font-bold text-gray-800 text-sm">{cert.name}</div>
                                                                    <div className="text-xs text-gray-600">{cert.issuer}{cert.issueDate && ` · ${cert.issueDate}`}</div>
                                                                    {cert.description && <p className="text-xs text-gray-500 mt-1">{cert.description}</p>}
                                                                </div>
                                                            ))}
                                                        </section>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );

                                default: // 1: Clean Corporate (Default)
                                    return (
                                        <div className="font-sans text-gray-800 p-6 max-w-[800px] mx-auto border border-gray-200 shadow-sm bg-white">
                                            <h1 className="text-3xl font-bold text-center mb-1">{personalInfo.fullName}</h1>
                                            {personalInfo.title && <p className="text-center text-gray-600 text-sm mb-2">{personalInfo.title}</p>}
                                            <div className="flex justify-center gap-4 text-sm text-gray-600 mb-6 border-b pb-4">
                                                <span>{personalInfo.email}</span>
                                                <span>|</span>
                                                <span>{personalInfo.phone}</span>
                                                {personalInfo.linkedin && <><span>|</span><span>{personalInfo.linkedin}</span></>}
                                            </div>
                                            {summary && <div className="mb-6"><h2 className="text-lg font-bold uppercase text-gray-700 mb-2">Summary</h2><p className="text-sm leading-relaxed">{summary}</p></div>}
                                            {nonEmptyExperiences.length > 0 && (
                                                <div className="mb-6"><h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Experience</h2>
                                                    {nonEmptyExperiences.map((exp, i) => (
                                                        <div key={i} className="mb-4">
                                                            <div className="flex justify-between items-baseline mb-1"><h3 className="font-bold">{exp.jobTitle}</h3><span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span></div>
                                                            <div className="text-sm font-semibold text-gray-600 mb-1">{exp.company}</div>
                                                            <p className="text-sm">{exp.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {nonEmptyProjects.length > 0 && (
                                                <div className="mb-6"><h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Projects</h2>
                                                    {nonEmptyProjects.map((proj, i) => (
                                                        <div key={i} className="mb-4">
                                                            <h3 className="font-bold">{proj.title}</h3>
                                                            {proj.techStack && proj.techStack.length > 0 && <div className="text-xs text-gray-500 mb-1">Technologies: {getTech(proj.techStack)}</div>}
                                                            <p className="text-sm">{proj.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {nonEmptyEducation.length > 0 && (
                                                <div className="mb-6"><h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Education</h2>
                                                    {nonEmptyEducation.map((edu, i) => (
                                                        <div key={i} className="flex justify-between items-baseline mb-2">
                                                            <div>
                                                                <div className="font-bold">{edu.institution}</div>
                                                                <div className="text-sm">{edu.degree}</div>
                                                                {edu.score && <div className="text-xs text-gray-500">Score: {edu.score}</div>}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{edu.year}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {skills.some(s => s.trim()) && (
                                                <div><h2 className="text-lg font-bold uppercase text-gray-700 mb-2">Skills</h2>
                                                    <div className="text-sm">{skills.filter(s => s.trim()).join(' • ')}</div>
                                                </div>
                                            )}

                                            {nonEmptyCertifications.length > 0 && (
                                                <div className="mt-6">
                                                    <h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Certifications</h2>
                                                    {nonEmptyCertifications.map((cert, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{cert.name}</div>
                                                            <div className="text-sm text-gray-600">{cert.issuer}{cert.issueDate && ` · ${cert.issueDate}`}</div>
                                                            {cert.description && <p className="text-xs text-gray-500 mt-1">{cert.description}</p>}
                                                            {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Verify</a>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyAchievements.length > 0 && (
                                                <div className="mt-6">
                                                    <h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Achievements</h2>
                                                    {nonEmptyAchievements.map((ach, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{ach.title}</div>
                                                            <div className="text-sm text-gray-600">{ach.organization}{ach.date && ` · ${ach.date}`}</div>
                                                            <p className="text-sm">{ach.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyActivities.length > 0 && (
                                                <div className="mt-6">
                                                    <h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Activities</h2>
                                                    {nonEmptyActivities.map((act, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{act.activity}</div>
                                                            <div className="text-sm text-gray-600">{act.role}{act.organization && `, ${act.organization}`}</div>
                                                            <div className="text-xs text-gray-400">{act.startDate} - {act.endDate}</div>
                                                            <p className="text-sm">{act.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyVolunteering.length > 0 && (
                                                <div className="mt-6">
                                                    <h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Volunteering</h2>
                                                    {nonEmptyVolunteering.map((vol, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{vol.role}</div>
                                                            <div className="text-sm text-gray-600">{vol.organization}</div>
                                                            <div className="text-xs text-gray-400">{vol.startDate} - {vol.endDate}</div>
                                                            <p className="text-sm">{vol.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {nonEmptyWorkshops.length > 0 && (
                                                <div className="mt-6">
                                                    <h2 className="text-lg font-bold uppercase text-gray-700 mb-3">Workshops & Trainings</h2>
                                                    {nonEmptyWorkshops.map((ws, i) => (
                                                        <div key={i} className="mb-3">
                                                            <div className="font-bold">{ws.title}</div>
                                                            <div className="text-sm text-gray-600">{ws.role}{ws.organization && `, ${ws.organization}`}</div>
                                                            <div className="text-xs text-gray-400">{ws.startDate} - {ws.endDate}</div>
                                                            <p className="text-sm">{ws.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {renderReferencesSection()}
                                        </div>
                                    );
                            }
                        })()}
                    </div>
                </div>
            </div>
        );
    };

    const handleSave = async () => {
        let isValid = true;
        let allErrors = {};

        const stepsToCheck = [1, 2, 3];
        stepsToCheck.forEach(s => {
            const stepValid = validateStep(s);
            if (!stepValid) isValid = false;
        });

        const { personalInfo, experiences, education } = formData;
        const newErrors = {};

        if (!personalInfo.fullName) newErrors.fullName = "Full Name is required";
        if (!personalInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) newErrors.email = "Valid Email is required";
        if (!personalInfo.phone || !/^\+?[\d\s-]{10,}$/.test(personalInfo.phone)) newErrors.phone = "Valid Phone Number is required";

        education.forEach((edu, index) => {
            if (!edu.institution) newErrors[`edu_${index}_institution`] = "Institution is required";
            if (!edu.degree) newErrors[`edu_${index}_degree`] = "Degree is required";
            if (!edu.year) newErrors[`edu_${index}_year`] = "Year is required";
        });

        experiences.forEach((exp, index) => {
            if (!exp.jobTitle) newErrors[`exp_${index}_title`] = "Job Title is required";
            if (!exp.company) newErrors[`exp_${index}_company`] = "Company is required";
            if (!exp.startDate) newErrors[`exp_${index}_start`] = "Start Date is required";
            if (exp.description && exp.description.length < 50) newErrors[`exp_${index}_desc`] = "Description must be at least 50 characters";
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("Please fix validation errors before saving.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) return alert("Not authenticated");

            setSaving(true);
            await createManualResume({ ...formData, jobDescription: "Manual Entry" });
            alert("Resume saved to History!");
            setSaving(false);
        } catch (error) {
            console.error(error);
            alert("Failed to save resume");
            setSaving(false);
        }
    };

    const handleDownload = () => {
        const element = resumeRef.current;
        const opt = {
            margin: 0,
            filename: `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

//     const handleDownload = () => {
//     const element = resumeRef.current;

//     const opt = {
//         margin: [0.5, 0.5],
//         filename: `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
//         image: { type: 'jpeg', quality: 1 },
//         html2canvas: {
//             scale: 3,
//             useCORS: true
//         },
//         jsPDF: {
//             unit: 'in',
//             format: 'a4',
//             orientation: 'portrait'
//         },
//         pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
//     };

//     html2pdf().set(opt).from(element).save();
// };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Resume Builder</h2>
                <div className="flex gap-2">
                    {step === 8 ? (
                        <>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Resume'}
                            </button>
                            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                                <Download size={18} /> Download PDF
                            </button>
                        </>
                    ) : (
                        <div className="text-sm text-gray-500 font-medium">Step {step} of 8</div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('manual')}
                >
                    Manual Build
                </button>
                <button
                    className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Load from History
                </button>
            </div>

            {/* History selection dropdown */}
            {activeTab === 'history' && (
                <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select a previously saved resume
                    </label>
                    {loadingResumes ? (
                        <p className="text-gray-500">Loading resumes...</p>
                    ) : (
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                            value={selectedResumeId}
                            onChange={(e) => setSelectedResumeId(e.target.value)}
                        >
                            <option value="">-- Choose a resume --</option>
                            {resumesList.map((res) => (
                                <option key={res._id} value={res._id}>
                                    {res.fileName} - {new Date(res.createdAt).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    )}
                    {resumesList.length === 0 && !loadingResumes && (
                        <p className="text-sm text-gray-500 mt-2">No resumes found. Upload one first.</p>
                    )}
                </div>
            )}

            {/* Step Navigation – 8 steps */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {['Personal', 'Education', 'Experience', 'Skills & Projects', 'Certifications', 'Activities', 'References', 'Preview'].map((label, i) => (
                    <button key={i} onClick={() => setStep(i + 1)} className={`pb-2 px-2 border-b-2 transition-colors whitespace-nowrap ${step === i + 1 ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pb-20">
                {step === 1 && renderPersonalInfo()}
                {step === 2 && renderEducation()}
                {step === 3 && renderExperience()}
                {step === 4 && renderSkillsAndProjects()}
                {step === 5 && renderCertificationsAndAchievements()}
                {step === 6 && renderAdditionalActivities()}
                {step === 7 && renderReferences()}
                {step === 8 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className="font-bold text-gray-700">Select Template</h3>
                            {[1, 2, 3, 4, 5].map(tId => (
                                <button
                                    key={tId}
                                    onClick={() => setSelectedTemplate(tId)}
                                    className={`w-full p-4 border rounded-lg text-left transition-all ${selectedTemplate === tId ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="font-bold text-gray-800">
                                        {tId === 1 && 'Clean Corporate'}
                                        {tId === 2 && 'Modern Tech'}
                                        {tId === 3 && 'Minimalist Serif'}
                                        {tId === 4 && 'Creative Split'}
                                        {tId === 5 && 'Executive Bold'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {tId === 1 && 'Standard professional layout'}
                                        {tId === 2 && 'Dark header, high contrast'}
                                        {tId === 3 && 'Elegant serif typography'}
                                        {tId === 4 && 'Two-column creative layout'}
                                        {tId === 5 && 'Strong header with accent colors'}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="lg:col-span-2">
                            {renderPreview()}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-gray-200 flex justify-between mt-auto">
                <button
                    onClick={() => setStep(p => Math.max(1, p - 1))}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-6 py-2 rounded border ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                    <ChevronLeft size={18} /> Previous
                </button>
                {step < 8 && (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                    >
                        Next <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default BuildResume;