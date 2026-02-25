import { useState, useRef, useEffect } from 'react';
import { chatInterview } from '../../api/interviewApi';
import { Send, User, Bot } from 'lucide-react';

const InterviewChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [started, setStarted] = useState(false);
    const [interviewId, setInterviewId] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startInterview = async () => {
        if (!jobDescription) return;
        setLoading(true);
        try {
            const { data } = await chatInterview({ jobDescription });
            setInterviewId(data.interviewId);
            setMessages(data.history.filter(m => m.role !== 'system')); // Hide system prompt
            setStarted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await chatInterview({
                interviewId,
                message: userMsg.content
            });
            setMessages(data.history.filter(m => m.role !== 'system'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!started) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Start New Session</h2>
                <textarea
                    className="w-full border border-gray-300 rounded-md p-3 mb-4 h-32 focus:ring-primary focus:border-primary"
                    placeholder="Paste the Job Description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
                <button
                    onClick={startInterview}
                    disabled={!jobDescription || loading}
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {loading ? 'Starting...' : 'Start Interview'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[900px]">
            <div className="bg-gray-100 p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-700">Interview in Progress</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 flex gap-3 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
                            }`}>
                            <div className="mt-1">
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div>
                                {msg.role === 'user' ? (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                ) : (
                                    (() => {
                                        // Detect pattern: Feedback followed by "Q<number>:"
                                        // We use [\s\S]* to match across newlines
                                        const match = msg.content.match(/^(.*?)(Q\d+:[\s\S]*)$/);

                                        if (match) {
                                            const feedback = match[1].trim();
                                            const question = match[2].trim();

                                            return (
                                                <div className="flex flex-col gap-2 w-full">
                                                    {feedback && (
                                                        <div className="whitespace-pre-wrap text-gray-700 bg-white/50 p-2 rounded">
                                                            {feedback}
                                                        </div>
                                                    )}
                                                    <div className={`whitespace-pre-wrap font-medium ${feedback ? 'border-t border-gray-300 pt-2 mt-1' : ''}`}>
                                                        {question}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return <div className="whitespace-pre-wrap">{msg.content}</div>;
                                    })()
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-500 rounded-lg p-3 italic">
                            AI is thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-primary"
                    placeholder="Type your answer..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-primary text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default InterviewChat;