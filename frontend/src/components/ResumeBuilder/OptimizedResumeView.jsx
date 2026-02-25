import { useRef } from 'react';
import { Download, CheckCircle, User, Briefcase, GraduationCap, Award, Code } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const OptimizedResumeView = ({ resumeData }) => {
    const contentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `Optimized_Resume_${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}`,
        onAfterPrint: () => console.log('Print successful'),
        onPrintError: (error) => console.log('Print error', error),
    });

    return (
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6 no-print">
                <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600 w-6 h-6" />
                    <h3 className="text-xl font-bold text-gray-800">AI Optimized Resume</h3>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    <Download size={18} /> Download / Print PDF
                </button>
            </div>

            {/* Resume Preview */}
            <div
                ref={contentRef}
                className="bg-white p-8 shadow-lg max-w-[8.5in] mx-auto text-gray-800 print-content"
                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.5' }}
            >
                {/* Header */}
                <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">{resumeData.personalInfo.fullName}</h1>
                    <div className="text-sm mt-2 flex justify-center gap-4 text-gray-600">
                        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                        {resumeData.personalInfo.phone && <span>| {resumeData.personalInfo.phone}</span>}
                        {resumeData.personalInfo.linkedin && <span>| LinkedIn</span>}
                    </div>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                            <User size={16} /> PROFESSIONAL SUMMARY
                        </h2>
                        <p className="text-sm text-gray-700 text-justify">{resumeData.summary}</p>
                    </div>
                )}

                {/* Skills */}
                {resumeData.skills && resumeData.skills.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                            <Code size={16} /> TECHNICAL SKILLS
                        </h2>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                            {resumeData.skills.join(' • ')}
                        </div>
                    </div>
                )}

                {/* Experience */}
                {resumeData.experiences && resumeData.experiences.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                            <Briefcase size={16} /> WORK EXPERIENCE
                        </h2>
                        <div className="space-y-4">
                            {resumeData.experiences.map((exp, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-md">{exp.jobTitle}</h3>
                                        <span className="text-sm font-semibold">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className="text-sm italic text-gray-600 mb-2">{exp.company}</p>
                                    <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                                        {/* Auto-detect if description is bulleted or paragraph */}
                                        {exp.description.includes('•') || exp.description.includes('- ')
                                            ? exp.description.split(/•|- /).filter(line => line.trim()).map((line, i) => <li key={i}>{line}</li>)
                                            : <li>{exp.description}</li>
                                        }
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {resumeData.projects && resumeData.projects.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                            <Award size={16} /> PROJECTS
                        </h2>
                        <div className="space-y-3">
                            {resumeData.projects.map((proj, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-md">{proj.title}</h3>
                                    <p className="text-sm text-gray-700">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                            <GraduationCap size={16} /> EDUCATION
                        </h2>
                        <div className="space-y-2">
                            {resumeData.education.map((edu, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <div>
                                        <span className="font-bold block">{edu.institution}</span>
                                        <span className="text-gray-700">{edu.degree}</span>
                                    </div>
                                    <span className="font-semibold">{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {resumeData.certifications && resumeData.certifications.length > 0 && resumeData.certifications.some(c => c.name) && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                            <Award size={16} /> CERTIFICATIONS
                        </h2>
                        <div className="space-y-2">
                            {resumeData.certifications.map((cert, idx) => cert.name && (
                                <div key={idx} className="mb-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold">{cert.name}</span>
                                        <span className="text-gray-600">{cert.issueDate}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">{cert.issuer}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                {resumeData.achievements && resumeData.achievements.length > 0 && resumeData.achievements.some(a => a.title) && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                            <Award size={16} /> ACHIEVEMENTS
                        </h2>
                        <div className="space-y-2">
                            {resumeData.achievements.map((ach, idx) => ach.title && (
                                <div key={idx} className="mb-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold">{ach.title}</span>
                                        <span className="text-gray-600">{ach.date}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">{ach.organization}</div>
                                    <div className="text-sm text-gray-700">{ach.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Activities */}
                {((resumeData.activities && resumeData.activities.some(a => a.activity)) ||
                    (resumeData.volunteering && resumeData.volunteering.some(v => v.role)) ||
                    (resumeData.workshops && resumeData.workshops.some(w => w.title))) && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 mb-2 flex items-center gap-2">
                                <Award size={16} /> ACTIVITIES & VOLUNTEERING
                            </h2>
                            <div className="space-y-3">
                                {resumeData.activities && resumeData.activities.map((act, idx) => act.activity && (
                                    <div key={`act-${idx}`} className="mb-1">
                                        <div className="font-bold text-sm">{act.activity}</div>
                                        <div className="text-xs text-gray-600">{act.role} | {act.organization}</div>
                                    </div>
                                ))}
                                {resumeData.volunteering && resumeData.volunteering.map((vol, idx) => vol.role && (
                                    <div key={`vol-${idx}`} className="mb-1">
                                        <div className="font-bold text-sm">{vol.role} (Volunteer)</div>
                                        <div className="text-xs text-gray-600">{vol.organization}</div>
                                    </div>
                                ))}
                                {resumeData.workshops && resumeData.workshops.map((work, idx) => work.title && (
                                    <div key={`work-${idx}`} className="mb-1">
                                        <div className="font-bold text-sm">{work.title} (Workshop)</div>
                                        <div className="text-xs text-gray-600">{work.organization}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default OptimizedResumeView;
