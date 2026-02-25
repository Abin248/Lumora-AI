const CourseCard = ({ course }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{course.courseTitle}</h3>
            <div className="flex items-center justify-between mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{course.platform}</span>
            </div>
            <p className="text-gray-600 text-sm">{course.reason}</p>
        </div>
    );
};

export default CourseCard;
