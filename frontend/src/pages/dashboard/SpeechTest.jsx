// import { useState, useEffect, useRef } from 'react';
// import { Mic, MicOff, Send, Play, FileText, CheckCircle, AlertCircle, Volume2 } from 'lucide-react';
// import axiosClient from '../../api/axiosClient';
// import stareImage from '../../assets/stare.png';

// const SpeechTest = () => {
//     // State
//     const [jobPosition, setJobPosition] = useState('');
//     const [isStarted, setIsStarted] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [isSpeaking, setIsSpeaking] = useState(false);
//     const [transcript, setTranscript] = useState('');
//     const [conversation, setConversation] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [report, setReport] = useState(null);
//     const [error, setError] = useState('');
//     const [questionCount, setQuestionCount] = useState(0);

//     // Refs
//     const recognitionRef = useRef(null);

//     // Text-to-Speech
//     const speak = (text) => {
//         if ('speechSynthesis' in window) {
//             window.speechSynthesis.cancel();
//             const speech = new SpeechSynthesisUtterance(text);
//             speech.lang = "en-US";
//             speech.rate = 1;
//             speech.pitch = 1;
//             setIsSpeaking(true);
//             speech.onend = () => setIsSpeaking(false);
//             speech.onerror = () => setIsSpeaking(false);
//             window.speechSynthesis.speak(speech);
//         } else {
//             console.warn('Text-to-speech not supported');
//         }
//     };

//     useEffect(() => {
//         if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//             const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//             recognitionRef.current = new SpeechRecognition();
//             recognitionRef.current.continuous = true;
//             recognitionRef.current.interimResults = true;
//             recognitionRef.current.lang = 'en-US';

//             recognitionRef.current.onresult = (event) => {
//                 let interimTranscript = '';
//                 let finalTranscript = '';
//                 for (let i = event.resultIndex; i < event.results.length; ++i) {
//                     if (event.results[i].isFinal) {
//                         finalTranscript += event.results[i][0].transcript;
//                     } else {
//                         interimTranscript += event.results[i][0].transcript;
//                     }
//                 }
//                 if (finalTranscript) {
//                     setTranscript(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
//                 }
//             };

//             recognitionRef.current.onerror = (event) => {
//                 if (event.error === 'no-speech') {
//                     setIsListening(false);
//                 } else if (event.error === 'not-allowed') {
//                     setError("Microphone access denied.");
//                     setIsListening(false);
//                 } else {
//                     setIsListening(false);
//                 }
//             };

//             recognitionRef.current.onend = () => {
//                 setIsListening(false);
//             };
//         } else {
//             setError("Browser does not support Speech Recognition.");
//         }
//     }, []);

//     useEffect(() => {
//         return () => {
//             window.speechSynthesis.cancel();
//         };
//     }, []);

//     const toggleListening = () => {
//         if (isListening) {
//             recognitionRef.current?.stop();
//             setIsListening(false);
//         } else {
//             setError('');
//             try {
//                 recognitionRef.current?.start();
//                 setIsListening(true);
//             } catch (err) {
//                 setIsListening(true);
//             }
//         }
//     };

//     const handleStartInterview = async () => {
//         if (!jobPosition.trim()) return setError("Please enter a job position.");
//         setLoading(true);
//         setError('');
//         try {
//             const { data } = await axiosClient.post('/interview/speech/start', { jobPosition });
//             setConversation([{ role: 'ai', text: data.question }]);
//             setIsStarted(true);
//             setQuestionCount(1);
//             speak(data.question);
//         } catch (err) {
//             console.error(err);
//             setError("Failed to start interview.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSendAnswer = async () => {
//         if (!transcript.trim()) return;
//         if (isListening) toggleListening();

//         const currentAnswer = transcript;
//         setTranscript('');

//         const newHistory = [...conversation, { role: 'user', text: currentAnswer }];
//         setConversation(newHistory);
//         setLoading(true);

//         try {
//             const { data } = await axiosClient.post('/interview/speech/answer', {
//                 jobPosition,
//                 history: newHistory,
//                 currentAnswer
//             });

//             setConversation(prev => [
//                 ...prev,
//                 { role: 'feedback', text: data.feedback },
//                 { role: 'ai', text: data.nextQuestion }
//             ]);

//             setQuestionCount(prev => prev + 1);
//             speak(data.nextQuestion);
//         } catch (err) {
//             console.error(err);
//             setError("Failed to process answer.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleGenerateReport = async () => {
//         window.speechSynthesis.cancel();
//         setLoading(true);
//         try {
//             const { data } = await axiosClient.post('/interview/speech/report', {
//                 jobPosition,
//                 history: conversation
//             });
//             setReport(data);
//         } catch (err) {
//             console.error(err);
//             setError("Failed to generate report.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Helper to get the latest AI message
//     const lastAIMessage = [...conversation].reverse().find(msg => msg.role === 'ai')?.text;

//     // Report view
//     if (report) {
//         return (
//             <div className="w-full h-full p-6 overflow-y-auto animate-fade-in bg-gray-50">
//                 <div className="max-w-4xl mx-auto space-y-8">
//                     <h2 className="text-3xl font-bold text-gray-900 text-center">Interview Performance Report</h2>
//                     <div className="bg-white p-6 rounded-xl shadow-lg flex justify-center items-center gap-8">
//                         <div className="w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center relative">
//                             <span className="text-4xl font-bold text-indigo-600">{report.score}%</span>
//                         </div>
//                         <div className="space-y-2">
//                             <p className="text-gray-500 font-medium">Overall Score</p>
//                             <h3 className="text-xl font-bold text-gray-800">{report.score >= 70 ? "Ready to Hire!" : "Needs Improvement"}</h3>
//                             {report.confidenceLevel && (
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm text-gray-600">Confidence:</span>
//                                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${report.confidenceLevel === 'High' ? 'bg-green-100 text-green-700' :
//                                         report.confidenceLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
//                                             'bg-red-100 text-red-700'
//                                         }`}>
//                                         {report.confidenceLevel}
//                                     </span>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="bg-white p-6 rounded-xl shadow-md">
//                             <div className="flex justify-between items-center mb-4">
//                                 <h4 className="font-bold text-lg flex items-center gap-2 text-blue-600"><CheckCircle size={20} /> Grammar & Speech</h4>
//                                 <span className="text-2xl font-bold text-blue-600">{report.grammarScore || 'N/A'}%</span>
//                             </div>
//                             <p className="text-gray-700 leading-relaxed">{report.grammarFeedback}</p>
//                         </div>
//                         <div className="bg-white p-6 rounded-xl shadow-md">
//                             <div className="flex justify-between items-center mb-4">
//                                 <h4 className="font-bold text-lg flex items-center gap-2 text-purple-600"><FileText size={20} /> Technical Accuracy</h4>
//                                 <span className="text-2xl font-bold text-purple-600">{report.technicalScore || 'N/A'}%</span>
//                             </div>
//                             <p className="text-gray-700 leading-relaxed">{report.technicalFeedback}</p>
//                         </div>
//                         <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
//                             <div className="flex justify-between items-center mb-4">
//                                 <h4 className="font-bold text-lg flex items-center gap-2 text-green-600"><AlertCircle size={20} /> Communication Style</h4>
//                                 <span className="text-2xl font-bold text-green-600">{report.communicationScore || 'N/A'}%</span>
//                             </div>
//                             <p className="text-gray-700 leading-relaxed">{report.communicationFeedback}</p>
//                         </div>
//                     </div>
//                     <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-400">
//                         <h4 className="font-bold text-lg mb-4">Improvement Tips</h4>
//                         <ul className="space-y-2">
//                             {report.improvementTips.map((tip, i) => (
//                                 <li key={i} className="flex gap-2 items-start text-gray-700">
//                                     <span className="text-yellow-500 font-bold">•</span>
//                                     {tip}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                     <div className="flex justify-center pt-8">
//                         <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg">Start New Interview</button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full h-full flex flex-col">
//             {/* Header */}
//             <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex justify-between items-center shrink-0">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Mic className="text-red-500" /> Speech Mock Interview</h2>
//                     <p className="text-sm text-gray-500">Practice verbal answers with real-time AI feedback</p>
//                 </div>
//                 {isStarted && (
//                     <button onClick={handleGenerateReport} disabled={loading || conversation.length < 4} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium">
//                         End & Generate Report
//                     </button>
//                 )}
//             </div>

//             {/* Error Banner */}
//             {error && (
//                 <div className="bg-red-100 text-red-700 p-3 text-center text-sm font-medium">
//                     {error}
//                 </div>
//             )}

//             {/* Start Screen */}
//             {!isStarted && !report ? (
//                 <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
//                     <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
//                         <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
//                             <Mic size={40} className="text-indigo-600" />
//                         </div>
//                         <h3 className="text-xl font-bold text-gray-800">Ready to speak?</h3>
//                         <p className="text-gray-600">Enter the job role you want to practice for. The AI will interview you via voice.</p>
//                         <input
//                             type="text"
//                             className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center text-lg shadow-sm"
//                             placeholder="e.g. Frontend Developer, Project Manager"
//                             value={jobPosition}
//                             onChange={(e) => setJobPosition(e.target.value)}
//                         />
//                         <button
//                             onClick={handleStartInterview}
//                             disabled={loading || !jobPosition}
//                             className="w-full py-4 bg-[#22424e] text-white rounded-xl font-bold text-lg hover:bg-[#4e2e22] transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg"
//                         >
//                             {loading ? 'Generating Interview...' : 'Start Interview'}
//                         </button>
//                         <p className="text-xs text-gray-400 mt-4">*Requires Microphone Access</p>
//                     </div>
//                 </div>
//             ) : (
//                 /* Voice-Only Interview Area */
//                 <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full my-4">
//                     {/* Voice Visualization Center Stage */}
//                     <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
//                         {/* Status Indicator */}
//                         <div className="text-center space-y-2">
//                             <p className="text-sm text-gray-500 font-medium">Question {questionCount}</p>
//                             <h3 className="text-2xl font-bold text-gray-800">
//                                 {isSpeaking ? 'AI is speaking...' : isListening ? 'Listening to you...' : loading ? 'Processing...' : 'Ready to answer'}
//                             </h3>
//                         </div>

//                         {/* Visualization Area */}
//                         <div className="relative w-full max-w-md h-64 flex items-center justify-center">
//                             {/* AI Speaking Animation */}
//                             {isSpeaking && (
//                                 <img
//                                     src={stareImage}
//                                     alt="AI Speaking"
//                                     className="w-48 h-48 object-cover rounded-full animate-pulse drop-shadow-xl"
//                                 />
//                             )}
//                             {/* User Listening Animation */}
//                             {isListening && !isSpeaking && (
//                                 <div className="relative">
//                                     <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
//                                     <div className="relative w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-2xl">
//                                         <Mic size={64} className="text-white" />
//                                     </div>
//                                 </div>
//                             )}
//                             {/* Idle State */}
//                             {!isSpeaking && !isListening && !loading && (
//                                 <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
//                                     <Mic size={64} className="text-gray-500" />
//                                 </div>
//                             )}
//                             {/* Loading State */}
//                             {loading && !isSpeaking && (
//                                 <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center shadow-lg animate-pulse">
//                                     <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* NEW: Bot Message Display */}
//                         {lastAIMessage && (
//                             <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 max-w-md w-full">
//                                 <div className="flex items-start gap-2">
//                                     <Volume2 size={20} className="text-indigo-500 mt-1 flex-shrink-0" />
//                                     <p className="text-gray-800">{lastAIMessage}</p>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Controls */}
//                         <div className="flex flex-col items-center gap-4 w-full max-w-md">
//                             {/* Microphone Toggle Button */}
//                             <button
//                                 onClick={toggleListening}
//                                 disabled={isSpeaking || loading}
//                                 className={`w-20 h-20 rounded-full transition-all shadow-xl ${isListening
//                                     ? 'bg-red-500 text-white scale-110'
//                                     : 'bg-white text-gray-700 border-4 border-gray-300 hover:border-indigo-500'
//                                     } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
//                                 title={isListening ? "Stop Recording" : "Start Recording"}
//                             >
//                                 {isListening ? <MicOff size={32} /> : <Mic size={32} />}
//                             </button>

//                             <p className="text-sm text-gray-600 text-center">
//                                 {isSpeaking ? 'Listen to the question' : isListening ? 'Speak your answer' : 'Click the microphone to answer'}
//                             </p>

//                             {/* Submit Answer Button */}
//                             {transcript.trim() && !isListening && (
//                                 <button
//                                     onClick={handleSendAnswer}
//                                     disabled={loading || isSpeaking}
//                                     className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg"
//                                 >
//                                     <Send size={20} /> Submit Answer
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SpeechTest;

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, FileText, CheckCircle, AlertCircle, Volume2, Speaker } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import stareImage from '../../assets/stare.png';

const SpeechTest = () => {
    // State
    const [jobPosition, setJobPosition] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    const [questionCount, setQuestionCount] = useState(0);

    // Voice state
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const selectedVoiceRef = useRef(null); // Keep latest voice in ref for speak function

    // Refs
    const recognitionRef = useRef(null);

    // --- Load available voices ---
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            console.log('Available voices:', availableVoices);
            setVoices(availableVoices);

            // Try to load previously selected voice from localStorage
            const savedVoiceName = localStorage.getItem('preferredVoice');
            if (savedVoiceName) {
                const savedVoice = availableVoices.find(v => v.name === savedVoiceName);
                if (savedVoice) {
                    setSelectedVoice(savedVoice);
                    selectedVoiceRef.current = savedVoice;
                    return;
                }
            }
            // Default to first English voice or any voice
            const defaultVoice = availableVoices.find(v => v.lang.includes('en-')) || availableVoices[0];
            setSelectedVoice(defaultVoice || null);
            selectedVoiceRef.current = defaultVoice || null;
        };

        // Voices might already be loaded
        if (window.speechSynthesis.getVoices().length) {
            loadVoices();
        } else {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Update ref whenever selectedVoice changes
    useEffect(() => {
        selectedVoiceRef.current = selectedVoice;
    }, [selectedVoice]);

    // --- Text-to-Speech with selected voice (using ref to avoid stale closure) ---
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 1;
            utterance.pitch = 1;

            // Use the voice from ref (always latest)
            const voiceToUse = selectedVoiceRef.current;
            if (voiceToUse) {
                utterance.voice = voiceToUse;
                console.log('Speaking with voice:', voiceToUse.name);
            } else {
                console.warn('No voice selected, using default');
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.error('Speech error:', e);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Text-to-speech not supported');
        }
    };

    // --- Test voice function ---
    const testSelectedVoice = () => {
        if (!selectedVoice) {
            setError('No voice selected');
            return;
        }
        speak(`Hello, I am ${selectedVoice.name}. This is how I sound.`);
    };

    // --- Speech Recognition setup ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                if (event.error === 'no-speech') {
                    setIsListening(false);
                } else if (event.error === 'not-allowed') {
                    setError("Microphone access denied.");
                    setIsListening(false);
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            setError("Browser does not support Speech Recognition.");
        }
    }, []);

    // Cancel speech on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setError('');
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                setIsListening(true);
            }
        }
    };

    const handleStartInterview = async () => {
        if (!jobPosition.trim()) return setError("Please enter a job position.");
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.post('/interview/speech/start', { jobPosition });
            setConversation([{ role: 'ai', text: data.question }]);
            setIsStarted(true);
            setQuestionCount(1);
            speak(data.question);
        } catch (err) {
            console.error(err);
            setError("Failed to start interview.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendAnswer = async () => {
        if (!transcript.trim()) return;
        if (isListening) toggleListening();

        const currentAnswer = transcript;
        setTranscript('');

        const newHistory = [...conversation, { role: 'user', text: currentAnswer }];
        setConversation(newHistory);
        setLoading(true);

        try {
            const { data } = await axiosClient.post('/interview/speech/answer', {
                jobPosition,
                history: newHistory,
                currentAnswer
            });

            setConversation(prev => [
                ...prev,
                { role: 'feedback', text: data.feedback },
                { role: 'ai', text: data.nextQuestion }
            ]);

            setQuestionCount(prev => prev + 1);
            speak(data.nextQuestion);
        } catch (err) {
            console.error(err);
            setError("Failed to process answer.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        window.speechSynthesis.cancel();
        setLoading(true);
        try {
            const { data } = await axiosClient.post('/interview/speech/report', {
                jobPosition,
                history: conversation
            });
            setReport(data);
        } catch (err) {
            console.error(err);
            setError("Failed to generate report.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get the latest AI message
    const lastAIMessage = [...conversation].reverse().find(msg => msg.role === 'ai')?.text;

    // Voice change handler
    const handleVoiceChange = (e) => {
        const voice = voices.find(v => v.name === e.target.value);
        setSelectedVoice(voice);
        if (voice) {
            localStorage.setItem('preferredVoice', voice.name);
        }
    };

    // Report view
    if (report) {
        return (
            <div className="w-full h-full p-6 overflow-y-auto animate-fade-in bg-gray-50">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center">Interview Performance Report</h2>
                    <div className="bg-white p-6 rounded-xl shadow-lg flex justify-center items-center gap-8">
                        <div className="w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center relative">
                            <span className="text-4xl font-bold text-indigo-600">{report.score}%</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-500 font-medium">Overall Score</p>
                            <h3 className="text-xl font-bold text-gray-800">{report.score >= 70 ? "Ready to Hire!" : "Needs Improvement"}</h3>
                            {report.confidenceLevel && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Confidence:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        report.confidenceLevel === 'High' ? 'bg-green-100 text-green-700' :
                                        report.confidenceLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {report.confidenceLevel}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg flex items-center gap-2 text-blue-600"><CheckCircle size={20} /> Grammar & Speech</h4>
                                <span className="text-2xl font-bold text-blue-600">{report.grammarScore || 'N/A'}%</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{report.grammarFeedback}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg flex items-center gap-2 text-purple-600"><FileText size={20} /> Technical Accuracy</h4>
                                <span className="text-2xl font-bold text-purple-600">{report.technicalScore || 'N/A'}%</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{report.technicalFeedback}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg flex items-center gap-2 text-green-600"><AlertCircle size={20} /> Communication Style</h4>
                                <span className="text-2xl font-bold text-green-600">{report.communicationScore || 'N/A'}%</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{report.communicationFeedback}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-400">
                        <h4 className="font-bold text-lg mb-4">Improvement Tips</h4>
                        <ul className="space-y-2">
                            {report.improvementTips.map((tip, i) => (
                                <li key={i} className="flex gap-2 items-start text-gray-700">
                                    <span className="text-yellow-500 font-bold">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-center pt-8">
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg">Start New Interview</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Mic className="text-red-500" /> Speech Mock Interview</h2>
                    <p className="text-sm text-gray-500">Practice verbal answers with real-time AI feedback</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Voice Selector Dropdown */}
                    {voices.length > 0 && (
                        <div className="flex items-center gap-2">
                            <label htmlFor="voiceSelect" className="text-sm text-gray-600 whitespace-nowrap">AI Voice:</label>
                            <select
                                id="voiceSelect"
                                value={selectedVoice ? selectedVoice.name : ''}
                                onChange={handleVoiceChange}
                                className="px-2 py-1 border rounded text-sm bg-white"
                            >
                                {voices.map(voice => (
                                    <option key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                            {/* Test Voice Button */}
                            <button
                                onClick={testSelectedVoice}
                                disabled={!selectedVoice || isSpeaking}
                                className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50"
                                title="Test selected voice"
                            >
                                <Speaker size={18} />
                            </button>
                        </div>
                    )}
                    {isStarted && (
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading || conversation.length < 4}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
                        >
                            End & Generate Report
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 text-center text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Start Screen */}
            {!isStarted && !report ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
                    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                            <Mic size={40} className="text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Ready to speak?</h3>
                        <p className="text-gray-600">Enter the job role you want to practice for. The AI will interview you via voice.</p>
                        <input
                            type="text"
                            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center text-lg shadow-sm"
                            placeholder="e.g. Frontend Developer, Project Manager"
                            value={jobPosition}
                            onChange={(e) => setJobPosition(e.target.value)}
                        />
                        <button
                            onClick={handleStartInterview}
                            disabled={loading || !jobPosition}
                            className="w-full py-4 bg-[#22424e] text-white rounded-xl font-bold text-lg hover:bg-[#4e2e22] transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg"
                        >
                            {loading ? 'Generating Interview...' : 'Start Interview'}
                        </button>
                        <p className="text-xs text-gray-400 mt-4">*Requires Microphone Access</p>
                    </div>
                </div>
            ) : (
                /* Voice-Only Interview Area */
                <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full my-4">
                    {/* Voice Visualization Center Stage */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                        {/* Status Indicator */}
                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-500 font-medium">Question {questionCount}</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {isSpeaking ? 'AI is speaking...' : isListening ? 'Listening to you...' : loading ? 'Processing...' : 'Ready to answer'}
                            </h3>
                        </div>

                        {/* Visualization Area */}
                        <div className="relative w-full max-w-md h-64 flex items-center justify-center">
                            {/* AI Speaking Animation */}
                            {isSpeaking && (
                                <img
                                    src={stareImage}
                                    alt="AI Speaking"
                                    className="w-48 h-48 object-cover rounded-full animate-pulse drop-shadow-xl"
                                />
                            )}
                            {/* User Listening Animation */}
                            {isListening && !isSpeaking && (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-2xl">
                                        <Mic size={64} className="text-white" />
                                    </div>
                                </div>
                            )}
                            {/* Idle State */}
                            {!isSpeaking && !isListening && !loading && (
                                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                                    <Mic size={64} className="text-gray-500" />
                                </div>
                            )}
                            {/* Loading State */}
                            {loading && !isSpeaking && (
                                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Bot Message Display */}
                        {lastAIMessage && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 max-w-md w-full">
                                <div className="flex items-start gap-2">
                                    <Volume2 size={20} className="text-indigo-500 mt-1 flex-shrink-0" />
                                    <p className="text-gray-800">{lastAIMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                            {/* Microphone Toggle Button */}
                            <button
                                onClick={toggleListening}
                                disabled={isSpeaking || loading}
                                className={`w-20 h-20 rounded-full transition-all shadow-xl ${
                                    isListening
                                        ? 'bg-red-500 text-white scale-110'
                                        : 'bg-white text-gray-700 border-4 border-gray-300 hover:border-indigo-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                                title={isListening ? "Stop Recording" : "Start Recording"}
                            >
                                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                            </button>

                            <p className="text-sm text-gray-600 text-center">
                                {isSpeaking ? 'Listen to the question' : isListening ? 'Speak your answer' : 'Click the microphone to answer'}
                            </p>

                            {/* Submit Answer Button */}
                            {transcript.trim() && !isListening && (
                                <button
                                    onClick={handleSendAnswer}
                                    disabled={loading || isSpeaking}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg"
                                >
                                    <Send size={20} /> Submit Answer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeechTest;