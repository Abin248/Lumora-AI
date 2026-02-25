// const grokClient = require('../config/grokClient');

// const calculateATSScore = async (resumeJson, jobDescription) => {
//     try {
//         console.log(`Calculating ATS Score. JD Length: ${jobDescription ? jobDescription.length : 0}`);

//         const safeJD = jobDescription ? jobDescription.replace(/`/g, "'") : '';

//         const jdContext = safeJD
//             ? `\n\nCRITICAL INSTRUCTION: COMPARE AGAINST THIS SPECIFIC JOB DESCRIPTION:\n"${safeJD}"\n\nTask: Calculate a match score (0-100) based strictly on keyword overlap, required skills, and experience alignment. Penalize heavily for missing technical skills found in the JD.`
//             : `\nAnalyze this resume for general software engineering suitability.`;

//         const chatCompletion = await grokClient.chat.completions.create({
//             messages: [
//                 {
//                     role: "system",
//                     content: `
// You are a Ruthless ATS Scoring Engine.

// Your job is to screen candidates out. 
// - If the resume matches the JD perfectly, score ~95.
// - If it matches well but misses minor things, score ~80.
// - If it misses key technical skills, score < 60.
// - If it is irrelevant, score < 30.

// STRICT OUTPUT RULES:
// - Return ONLY JSON.
// - No markdown.
// - No commentary.
// - Must match this schema exactly:

// {
//   "overallScore": number (0-100),
//   "matchedKeywords": [string],
//   "missingKeywords": [string],
//   "suggestions": [string]
// }
// `
//                 },
//                 {
//                     role: "user",
//                     content: `Evaluate this resume data: ${JSON.stringify(resumeJson)}${jdContext}`
//                 }
//             ],
//             model: 'llama-3.1-8b-instant',
//             temperature: 0.1,
//         });

//         let content = chatCompletion.choices[0]?.message?.content || "{}";

//         // Robust JSON extraction
//         const jsonStart = content.indexOf('{');
//         const jsonEnd = content.lastIndexOf('}');

//         if (jsonStart !== -1 && jsonEnd !== -1) {
//             content = content.substring(jsonStart, jsonEnd + 1);
//         } else {
//             content = content.trim().replace(/```json/g, '').replace(/```/g, '');
//         }

//         const result = JSON.parse(content);

//         // Normalize Score (Handle 0-1 decimal vs 0-100 integer)
//         let score = result.overallScore || 0;
//         if (score > 0 && score <= 1) {
//             score = Math.round(score * 100);
//         }

//         return {
//             atsScore: score,
//             atsFeedback: result.suggestions ? result.suggestions.join('\n') : "No feedback provided",
//         };

//     } catch (error) {
//         console.error("ATS Score Error:", error.message);
//         return {
//             atsScore: 0,
//             atsFeedback: "Could not calculate score due to AI service error."
//         };
//     }
// };

// module.exports = { calculateATSScore };

const grokClient = require('../config/grokClient');

const calculateATSScore = async (resumeJson, jobDescription) => {
  try {
    console.log(`Calculating ATS Score. JD Length: ${jobDescription ? jobDescription.length : 0}`);

    const safeJD = jobDescription ? jobDescription.replace(/`/g, "'") : '';

    const jdContext = safeJD
      ? `\n\nCRITICAL INSTRUCTION: COMPARE AGAINST THIS SPECIFIC JOB DESCRIPTION:\n"${safeJD}"\n\nTask: Calculate a match score (0-100) based strictly on keyword overlap, required skills, and experience alignment. Penalize heavily for missing technical skills found in the JD.`
      : `\nAnalyze this resume for general software engineering suitability.`;

    const chatCompletion = await grokClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are a Ruthless ATS Scoring Engine.

Your job is to screen candidates out. 
- If the resume matches the JD perfectly, score ~95.
- If it matches well but misses minor things, score ~80.
- If it misses key technical skills, score < 60.
- If it is irrelevant, score < 30.

STRICT OUTPUT RULES:
- Return ONLY JSON.
- No markdown.
- No commentary.
- Must match this schema exactly:

{
  "overallScore": number (0-100),
  "matchedKeywords": [string],
  "missingKeywords": [string],
  "suggestions": [string]
}
`
        },
        {
          role: "user",
          content: `Evaluate this resume data: ${JSON.stringify(resumeJson)}${jdContext}`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    let content = chatCompletion.choices[0]?.message?.content || "{}";

    // Robust JSON extraction
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    } else {
      content = content.trim().replace(/```json/g, '').replace(/```/g, '');
    }

    const result = JSON.parse(content);

    // Normalize Score (Handle 0-1 decimal vs 0-100 integer)
    let score = result.overallScore || 0;
    if (score > 0 && score <= 1) {
      score = Math.round(score * 100);
    }

    return {
      atsScore: score,
      atsFeedback: result.suggestions ? result.suggestions.join('\n') : "No feedback provided",
    };
  } catch (error) {
    console.error("ATS Score Error:", error.message);
    return {
      atsScore: 0,
      atsFeedback: "Could not calculate score due to AI service error."
    };
  }
};

module.exports = { calculateATSScore };