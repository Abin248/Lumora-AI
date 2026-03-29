// const CourseCard = ({ course }) => {
//     return (
//         <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
//             <h3 className="text-lg font-bold text-gray-900 mb-2">{course.courseTitle}</h3>
//             <div className="flex items-center justify-between mb-4">
//                 <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{course.platform}</span>
//             </div>
//             <p className="text-gray-600 text-sm">{course.reason}</p>
//         </div>
//     );
// };

// export default CourseCard;

const CourseCard = ({ course }) => {
  // Generate a platform-specific search URL
  const getCourseUrl = (course) => {
    const platform = course.platform.toLowerCase();
    const title = encodeURIComponent(course.courseTitle);

    if (platform.includes('coursera')) {
      return `https://www.coursera.org/search?query=${title}`;
    } else if (platform.includes('udemy')) {
      return `https://www.udemy.com/courses/search/?q=${title}`;
    } else if (platform.includes('edx')) {
      return `https://www.edx.org/search?q=${title}`;
    } else if (platform.includes('pluralsight')) {
      return `https://www.pluralsight.com/search?q=${title}`;
    } else if (platform.includes('linkedin')) {
      return `https://www.linkedin.com/learning/search?keywords=${title}`;
    } else {
      // Default: Google search including platform name
      return `https://www.google.com/search?q=${title}+${encodeURIComponent(course.platform)}`;
    }
  };

  return (
    <a
      href={getCourseUrl(course)}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">{course.courseTitle}</h3>
      <div className="flex items-center justify-between mb-4">
        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
          {course.platform}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{course.reason}</p>
    </a>
  );
};

export default CourseCard;