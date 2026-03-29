import { useState, useRef, useEffect } from 'react';
import { chatInterview } from '../../api/interviewApi';
import { Bot } from 'lucide-react';

const InterviewChat = () => {

    const [messages, setMessages] = useState([]);
    const [jobDescription, setJobDescription] = useState('');
    const [started, setStarted] = useState(false);
    const [interviewId, setInterviewId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // =============================
    // START INTERVIEW
    // =============================
    const startInterview = async () => {
        if (!jobDescription) return;

        setLoading(true);

        try {
            const { data } = await chatInterview({ jobDescription });

            setInterviewId(data.interviewId);
            setMessages(data.history.filter(m => m.role !== 'system'));
            setStarted(true);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // =============================
    // SUBMIT OPTION
    // =============================
    const sendSelectedOption = async () => {
        if (!selectedOption) return;

        setLoading(true);

        try {
            const { data } = await chatInterview({
                interviewId,
                message: selectedOption
            });

            setMessages(data.history.filter(m => m.role !== 'system'));
            setSelectedOption(null);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // =============================
    // FIND LAST QUESTION INDEX
    // =============================
    const getLastQuestionIndex = () => {
        let lastIndex = -1;

        messages.forEach((msg, index) => {
            if (
                msg.role === 'assistant' &&
                msg.content.includes("A)") &&
                msg.content.includes("Correct Answer")
            ) {
                lastIndex = index;
            }
        });

        return lastIndex;
    };

    const lastQuestionIndex = getLastQuestionIndex();

    // =============================
    // RENDER MESSAGE
    // =============================
    const renderMessage = (msg, index) => {

        if (msg.role === 'assistant') {

            if (msg.content.includes("A)") && msg.content.includes("Correct Answer")) {

                const isActiveQuestion = index === lastQuestionIndex;

                const questionMatch = msg.content.match(/Q\d+:[\s\S]*?(?=\nA\))/);
                const questionText = questionMatch ? questionMatch[0] : '';

                const optionRegex = /([A-D])\)\s*(.*)/g;
                let match;
                const options = [];

                while ((match = optionRegex.exec(msg.content)) !== null) {
                    if (match[2].includes("Correct Answer")) break;

                    options.push({
                        letter: match[1],
                        text: match[2].trim()
                    });

                    if (options.length === 4) break;
                }

                return (
                    <div className="flex flex-col gap-3">
                        <div className="font-medium text-base whitespace-pre-wrap">
                            {questionText}
                        </div>

                        {options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => isActiveQuestion && setSelectedOption(opt.letter)}
                                disabled={!isActiveQuestion}
                                className={`border rounded-md p-3 text-left transition text-base ${
                                    selectedOption === opt.letter && isActiveQuestion
                                        ? "bg-primary text-white"
                                        : "bg-white hover:bg-gray-100"
                                } ${
                                    !isActiveQuestion
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                <strong>{opt.letter})</strong> {opt.text}
                            </button>
                        ))}

                        {isActiveQuestion && (
                            <button
                                onClick={sendSelectedOption}
                                disabled={!selectedOption}
                                className="bg-green-600 text-white py-2 px-4 rounded-md text-base mt-2 hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Submit Answer
                            </button>
                        )}
                    </div>
                );
            }

            return <div className="whitespace-pre-wrap text-base">{msg.content}</div>;
        }

        return <div className="text-base">{msg.content}</div>;
    };

    // =============================
    // UI
    // =============================
    if (!started) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Start New Session</h2>

                <textarea
                    className="w-full border border-gray-300 rounded-md p-4 mb-5 h-36 text-base"
                    placeholder="Paste Job Description..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />

                <button
                    onClick={startInterview}
                    disabled={!jobDescription || loading}
                    className="w-full bg-primary text-white py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Starting...' : 'Start Interview'}
                </button>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col h-[650px] bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {messages.map((msg, idx) => (
                    <div key={idx} className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 text-gray-800 text-base">
                            <div className="flex gap-2 items-start">
                                <Bot size={20} className="mt-0.5 flex-shrink-0" />
                                <div className="w-full">
                                    {renderMessage(msg, idx)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-gray-500 italic text-base">AI is thinking...</div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default InterviewChat;