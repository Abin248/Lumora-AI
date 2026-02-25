import InterviewChat from '../../components/InterviewChat/InterviewChat';
import rightDivimage from '../../assets/rightdiv.jpg';
const MockInterview = () => {
    return (
        <div className="w-full h-full bg-[url(${rightDivimage})]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">AI Mock Interview</h2>
            <p className="mb-8 text-gray-600">Simulate a real interview experience. Provide a job description, and our AI will conduct a technical interview tailored to the role.</p>

            <InterviewChat />
        </div>
    );
};

export default MockInterview;