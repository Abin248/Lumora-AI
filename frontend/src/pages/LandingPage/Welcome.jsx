import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';

const Welcome = () => {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const speechRef = useRef(null);
    const timerRef = useRef(null);

    const fullText = `We've built a chatbot that interacts in a natural, conversational way.
Its dialogue format makes it possible to answer follow-up questions, clarify doubts, and provide helpful information with ease.
This chatbot is designed to assist, guide, and engage users while continuously improving from interactions. We're excited to share it with you and learn from your feedback to make it even better.
Start chatting now and see what it can do!`;

    useEffect(() => {
        return () => {
            if (speechRef.current) {
                window.speechSynthesis.cancel();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
            clearInterval(timerRef.current);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else {
                speechRef.current = new SpeechSynthesisUtterance(fullText);
                speechRef.current.rate = 0.9;
                speechRef.current.onend = () => {
                    setIsPlaying(false);
                    clearInterval(timerRef.current);
                    setCurrentTime(0);
                };
                window.speechSynthesis.speak(speechRef.current);
            }

            setIsPlaying(true);
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => prev + 1);
            }, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-[#22424e] text-white flex flex-col items-center justify-center p-8 font-sans">
            <div className="max-w-4xl w-full">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-normal tracking-wide text-[#5daeb3] mb-4 shadow-teal-glow">
                        Hi I am Lumora.
                    </h1>
                    <p className="text-[#3c7a80] text-xl font-medium tracking-wide">
                        Let me help you
                    </p>
                </div>

                {/* Audio Player Control */}
                <div className="border-t border-b border-gray-600/50 py-4 mb-4 flex items-center gap-4 text-[#3c7a80]">
                    <button
                        onClick={handlePlay}
                        className="flex items-center gap-2 hover:text-[#5daeb3] transition-colors focus:outline-none"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        <span className="font-semibold uppercase tracking-wider text-sm">
                            {isPlaying ? 'Pause article' : 'Listen to article'}
                        </span>
                    </button>
                    <span className="text-gray-500/50">|</span>
                    <span className="text-sm font-mono tracking-widest">{formatTime(currentTime)}</span>
                </div>

                {/* Text Content */}
                <div className="space-y-6 text-[#5daeb3] text-lg leading-relaxed max-w-3xl">
                    <p>
                        "We've built a chatbot that interacts in a natural, conversational way.
                    </p>
                    <p>
                        Its dialogue format makes it possible to answer follow-up questions, clarify doubts, and provide helpful information with ease.
                    </p>
                    <p>
                        This chatbot is designed to assist, guide, and engage users while continuously improving from interactions. We're excited to share it with you and learn from your feedback to make it even better.
                    </p>
                    <p>
                        Start chatting now and see what it can do!"
                    </p>
                </div>

                {/* Action Button */}
                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-10 py-3 bg-transparent border border-[#5daeb3] text-[#5daeb3] rounded-full hover:bg-[#5daeb3] hover:text-[#22424e] transition-all duration-300 font-semibold tracking-wider uppercase text-sm"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Welcome;