import InterviewChat from '../../components/InterviewChat/InterviewChat';

const MockInterview = () => {
    return (
        <div className="w-full h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Mock Test</h2>
            <p className="mb-6 text-base text-gray-600">
                Simulate a real interview experience. Provide a job description, and our AI will conduct a technical interview tailored to the role.
            </p>
            <InterviewChat />
        </div>
    );
};

export default MockInterview;