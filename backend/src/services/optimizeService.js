const grokClient = require('../config/grokClient');

const generateOptimizedResume = async (resumeJson, jobDescription, atsFeedback) => {
    try {

        const systemPrompt = `
You are an Expert Resume Writer and ATS Optimization Specialist.
Your job is to rewrite resumes to perfectly match the job description AND fix all ATS feedback issues.

========================
CRITICAL RULES
========================
1. SUMMARY:
   - Rewrite the summary to be strictly result-oriented.
   - MUST include important keywords from the JD.
   - MUST include missing skills mentioned in ATS feedback.

2. EXPERIENCE:
   - Rewrite all bullet points using strong action verbs.
   - Add missing responsibilities/skills required in the JD or ATS feedback.
   - MUST naturally integrate at least 3–8 technical keywords from JD + ATS feedback.

3. SKILLS:
   - List skills found in resume + JD + ATS feedback.
   - Remove irrelevant skills.
   - Prioritize technical requirements from the JD.

4. ***MANDATORY RULE:***
   You MUST incorporate ALL ATS feedback items into the rewritten resume.
   If ATS suggests missing skills, missing responsibilities, domain knowledge, or tools,
   you MUST add them naturally into:
   - Summary
   - Skills
   - Experience sections

5. OUTPUT RULES:
   - Return ONLY valid JSON.
   - No markdown.
   - No commentary.
   - Follow this schema precisely:

{
  "summary": "Rewritten summary...",
  "skills": ["Skill 1", "Skill 2"...],
  "experiences": [
    { 
      "jobTitle": "...",
      "company": "...",
      "startDate": "...",
      "endDate": "...",
      "description": "Rewritten bullet points..."
    }
  ]
}
`;

        const userContent = `
Here is the original extracted resume data:
${JSON.stringify(resumeJson)}

Here is the job description:
${jobDescription}

Here are ATS improvement suggestions:
${atsFeedback}

Rewrite the entire resume using ALL THREE inputs.
Ensure every missing keyword, skill, and requirement mentioned in ATS feedback or JD 
is added naturally and meaningfully.
`;

        console.log(">>> [OptimizeService] Sending request to AI...");
        console.log(">>> [OptimizeService] System Prompt Length:", systemPrompt.length);
        console.log(">>> [OptimizeService] User Content Length:", userContent.length);

        const chatCompletion = await grokClient.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.15,
        });

        console.log(">>> [OptimizeService] AI Response Received.");
        let content = chatCompletion.choices[0]?.message?.content || "{}";
        console.log(">>> [OptimizeService] Raw Content (truncated):", content.substring(0, 500) + "...");

        // JSON extraction
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            content = content.substring(jsonStart, jsonEnd + 1);
        } else {
            content = content.trim().replace(/```json/g, '').replace(/```/g, '');
        }

        let aiOutput;
        try {
            aiOutput = JSON.parse(content);
            console.log(">>> [OptimizeService] JSON Parsed successfully.");
        } catch (e) {
            console.error(">>> [OptimizeService] JSON Parse Error on:", content);
            throw e;
        }

        // Merge updated fields with original resume
        return {
            ...resumeJson,
            summary: aiOutput.summary || resumeJson.summary,
            skills: aiOutput.skills || resumeJson.skills,
            experiences: aiOutput.experiences || resumeJson.experiences,
            personalInfo: resumeJson.personalInfo,
            education: resumeJson.education,
            projects: resumeJson.projects,
            certifications: resumeJson.certifications
        };

    } catch (error) {
        console.error(">>> [OptimizeService] Generate Error:", error);
        throw new Error("Failed to optimize resume");
    }
};

module.exports = { generateOptimizedResume };

// const grokClient = require('../config/grokClient');

// const generateOptimizedResume = async (resumeJson, jobDescription, atsFeedback) => {
//   try {
//     const systemPrompt = `
// You are an Expert Resume Writer and ATS Optimization Specialist.
// Your job is to rewrite resumes to perfectly match the job description AND fix all ATS feedback issues.

// ========================
// CRITICAL RULES
// ========================
// 1. SUMMARY:
//    - Rewrite the summary to be strictly result-oriented.
//    - MUST include important keywords from the JD.
//    - MUST include missing skills mentioned in ATS feedback.

// 2. EXPERIENCE:
//    - Rewrite all bullet points using strong action verbs.
//    - Add missing responsibilities/skills required in the JD or ATS feedback.
//    - MUST naturally integrate at least 3–8 technical keywords from JD + ATS feedback.

// 3. SKILLS:
//    - List skills found in resume + JD + ATS feedback.
//    - Remove irrelevant skills.
//    - Prioritize technical requirements from the JD.

// 4. ***MANDATORY RULE:***
//    You MUST incorporate ALL ATS feedback items into the rewritten resume.
//    If ATS suggests missing skills, missing responsibilities, domain knowledge, or tools,
//    you MUST add them naturally into:
//    - Summary
//    - Skills
//    - Experience sections

// 5. OUTPUT RULES:
//    - Return ONLY valid JSON.
//    - No markdown.
//    - No commentary.
//    - Follow this schema precisely:

// {
//   "summary": "Rewritten summary...",
//   "skills": ["Skill 1", "Skill 2"...],
//   "experiences": [
//     { 
//       "jobTitle": "...",
//       "company": "...",
//       "startDate": "...",
//       "endDate": "...",
//       "description": "Rewritten bullet points..."
//     }
//   ]
// }
// `;

//     const userContent = `
// Here is the original extracted resume data:
// ${JSON.stringify(resumeJson, null, 2)}

// Here is the job description:
// ${jobDescription}

// Here are ATS improvement suggestions (must incorporate these):
// ${atsFeedback || "No specific feedback provided; still optimize for the JD."}

// Rewrite the entire resume using ALL THREE inputs.
// Ensure every missing keyword, skill, and requirement mentioned in ATS feedback or JD 
// is added naturally and meaningfully.
// `;

//     console.log(">>> [OptimizeService] Sending request to AI...");
//     const chatCompletion = await grokClient.chat.completions.create({
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userContent }
//       ],
//       model: 'llama-3.1-8b-instant',
//       temperature: 0.15,
//     });

//     let content = chatCompletion.choices[0]?.message?.content || "{}";
//     // Extract JSON
//     const jsonStart = content.indexOf('{');
//     const jsonEnd = content.lastIndexOf('}');
//     if (jsonStart !== -1 && jsonEnd !== -1) {
//       content = content.substring(jsonStart, jsonEnd + 1);
//     } else {
//       content = content.trim().replace(/```json/g, '').replace(/```/g, '');
//     }

//     let aiOutput;
//     try {
//       aiOutput = JSON.parse(content);
//     } catch (e) {
//       console.error(">>> [OptimizeService] JSON Parse Error on:", content);
//       throw e;
//     }

//     // Merge updated fields with original resume (preserve other sections)
//     return {
//       ...resumeJson,
//       summary: aiOutput.summary || resumeJson.summary,
//       skills: aiOutput.skills || resumeJson.skills,
//       experiences: aiOutput.experiences || resumeJson.experiences,
//       // Keep all other sections unchanged
//     };
//   } catch (error) {
//     console.error(">>> [OptimizeService] Generate Error:", error);
//     throw new Error("Failed to optimize resume");
//   }
// };

// module.exports = { generateOptimizedResume };