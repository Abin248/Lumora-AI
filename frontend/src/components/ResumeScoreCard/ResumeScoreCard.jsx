import { motion } from 'framer-motion';

const ResumeScoreCard = ({ score, feedback }) => {
    const getScoreColor = (s) => {
        if (s >= 80) return 'text-green-600';
        if (s >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">ATS Score</h3>
                <span className={`text-4xl font-extrabold ${getScoreColor(score)}`}>{score}/100</span>
            </div>
            <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Feedback</h4>
                <p className="text-gray-600 whitespace-pre-line">{feedback}</p>
            </div>
        </motion.div>
    );
};

export default ResumeScoreCard;
