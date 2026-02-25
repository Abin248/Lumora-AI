const grokClient = require('../config/grokClient');

const parseResumeWithAI = async (pdfText) => {
  const prompt = `
You are an advanced Resume Parsing AI.

Your job is to extract structured information from the following resume text.
The output must ONLY be valid JSON. Do not include explanations.

---------------  
PDF CONTENT BELOW  
---------------
${pdfText}
---------------

Return strictly this JSON structure:

{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "",
  "skills": [],
  "experiences": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "techStack": []
    }
  ],
  "certifications": [
    {
      "name": "",
      "year": "",
      "issuer": ""
    }
  ]
}

RULES:
- Do NOT guess missing information.
- Do NOT hallucinate details.
- If not available, return empty strings or empty arrays.
- Return ONLY the JSON.
`;

  try {
    const chatCompletion = await grokClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant', // or another available Groq model
      temperature: 0,
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    // Sanitize in case of markdown code blocks
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Parse Error:", error);
    throw new Error('Failed to parse resume with AI');
  }
};

module.exports = { parseResumeWithAI };



// const grokClient = require('../config/grokClient');

// /**
//  * Parse resume text using AI to extract all fields defined in the Resume model.
//  */
// const parseResumeWithAI = async (pdfText) => {
//   const prompt = `
// You are an advanced Resume Parsing AI.

// Your job is to extract structured information from the following resume text.
// The output must ONLY be valid JSON. Do not include explanations.

// ---------------
// PDF CONTENT BELOW
// ---------------
// ${pdfText}
// ---------------

// Return strictly this JSON structure. All fields are optional; if a section is missing, return an empty array or empty string.

// {
//   "personalInfo": {
//     "fullName": "",
//     "title": "",
//     "email": "",
//     "phone": "",
//     "linkedin": "",
//     "github": ""
//   },
//   "summary": "",
//   "skills": [],
//   "experiences": [
//     {
//       "jobTitle": "",
//       "company": "",
//       "startDate": "",
//       "endDate": "",
//       "description": ""
//     }
//   ],
//   "education": [
//     {
//       "degree": "",
//       "institution": "",
//       "year": "",
//       "score": ""
//     }
//   ],
//   "projects": [
//     {
//       "title": "",
//       "description": "",
//       "techStack": []
//     }
//   ],
//   "certifications": [
//     {
//       "name": "",
//       "issuer": "",
//       "issueDate": "",
//       "expDate": "",
//       "credId": "",
//       "url": "",
//       "description": ""
//     }
//   ],
//   "achievements": [
//     {
//       "title": "",
//       "organization": "",
//       "date": "",
//       "description": ""
//     }
//   ],
//   "activities": [
//     {
//       "activity": "",
//       "role": "",
//       "organization": "",
//       "startDate": "",
//       "endDate": "",
//       "description": ""
//     }
//   ],
//   "volunteering": [
//     {
//       "role": "",
//       "organization": "",
//       "startDate": "",
//       "endDate": "",
//       "description": ""
//     }
//   ],
//   "workshops": [
//     {
//       "title": "",
//       "organization": "",
//       "startDate": "",
//       "endDate": "",
//       "role": "",
//       "description": ""
//     }
//   ],
//   "references": [
//     {
//       "name": "",
//       "jobTitle": "",
//       "company": "",
//       "email": "",
//       "phone": "",
//       "relationship": ""
//     }
//   ]
// }

// RULES:
// - Do NOT guess missing information.
// - Do NOT hallucinate details.
// - If a field is not available, return an empty string or empty array.
// - Return ONLY the JSON. No markdown, no commentary.
// `;

//   try {
//     const chatCompletion = await grokClient.chat.completions.create({
//       messages: [{ role: 'user', content: prompt }],
//       model: 'llama-3.1-8b-instant',
//       temperature: 0,
//     });

//     let content = chatCompletion.choices[0]?.message?.content || "{}";
//     // Remove markdown code blocks if present
//     content = content.replace(/```json/g, '').replace(/```/g, '').trim();

//     // Extract JSON if there is surrounding text
//     const jsonStart = content.indexOf('{');
//     const jsonEnd = content.lastIndexOf('}');
//     if (jsonStart !== -1 && jsonEnd !== -1) {
//       content = content.substring(jsonStart, jsonEnd + 1);
//     }

//     const parsed = JSON.parse(content);

//     // Ensure all expected fields exist (fill missing with defaults)
//     const defaultStructure = {
//       personalInfo: { fullName: '', title: '', email: '', phone: '', linkedin: '', github: '' },
//       summary: '',
//       skills: [],
//       experiences: [],
//       education: [],
//       projects: [],
//       certifications: [],
//       achievements: [],
//       activities: [],
//       volunteering: [],
//       workshops: [],
//       references: []
//     };

//     // Deep merge to guarantee structure
//     const final = { ...defaultStructure, ...parsed };
//     final.personalInfo = { ...defaultStructure.personalInfo, ...(parsed.personalInfo || {}) };
//     // Ensure arrays are arrays
//     ['skills', 'experiences', 'education', 'projects', 'certifications', 'achievements', 'activities', 'volunteering', 'workshops', 'references'].forEach(key => {
//       if (!Array.isArray(final[key])) final[key] = [];
//     });

//     return final;
//   } catch (error) {
//     console.error("AI Parse Error:", error);
//     throw new Error('Failed to parse resume with AI');
//   }
// };

// module.exports = { parseResumeWithAI };