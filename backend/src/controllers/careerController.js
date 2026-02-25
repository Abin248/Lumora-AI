const grokClient = require('../config/grokClient');
const Resume = require('../models/Resume');

// @desc    Get career analysis & course recommendations based on resume
// @route   POST /api/career/recommendations
// @access  Private
const getCourseRecommendations = async (req, res) => {
  const { resumeId } = req.body;

  try {
    let profileContext = "";

    // 1. Fetch Resume Data if ID provided
    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      profileContext = `
        RESUME CONTEXT:
        - Skills: ${resume.skills ? resume.skills.join(', ') : "None listed"}
        - Education: ${JSON.stringify(resume.education)}
        - Experience: ${JSON.stringify(resume.experiences)}
        - Projects: ${JSON.stringify(resume.projects)}
        `;
    } else {
      return res.status(400).json({ message: 'Please select a resume for analysis.' });
    }

    // 2. AI Prompt for Gap Analysis + Career Path + Courses + Real Job Search
    const systemPrompt = `
    You are a senior Career Counselor and an advanced Job Search Engine.
    
    STRICT RULES:
    - Output ONLY valid JSON.
    - NO markdown, NO text outside JSON.
    - usage of JSON.parse() on your output MUST NOT fail.
    
    TASK:
    1. Analyze the resume for gaps and skills.
    2. Suggest 3 career paths.
    3. SEARCH (Simulate) 3 REALISTIC, SPECIFIC job openings that fit this profile. 
       - Use REAL company names (e.g. Google, Microsoft, Amazon, Spotify, regional tech giants).
       - Use REALISTIC locations (Tech hubs like Bangalore, San Francisco, London, Remote).
       - Use REALISTIC salary ranges (e.g. "$120k - $150k" or "₹15L - ₹25L").
    
    JSON format:
    {
      "gapAnalysis": "String. Detailed observation.",
      "skillsFeedback": "String. Brief evaluation.",
      "careerPath": [
        { "role": "String", "advice": "String" }
      ],
      "jobRecommendations": [
        { 
          "jobTitle": "String (e.g. Senior Backend Engineer)", 
          "company": "String (Real Company Name)", 
          "location": "String (City, Country or Remote)",
          "salaryRange": "String",
          "matchPercentage": 90,
          "reason": "String. Why this fits." 
        }
      ],
      "recommendations": [
        { "courseTitle": "String", "platform": "String", "reason": "String" }
      ]
    }
    `;

    const chatCompletion = await grokClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: profileContext }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3, // Slightly higher for variety in company names
    });

    let output = chatCompletion.choices[0]?.message?.content || "{}";

    console.log("AI RAW RESPONSE:", output); // Debugging

    // Clean the AI Response Before JSON.parse()
    output = output.trim();
    // Remove accidental wrappers
    output = output.replace(/```json/g, "").replace(/```/g, "");

    // prevent model adding unwanted prefixes
    const firstBrace = output.indexOf("{");
    const lastBrace = output.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      output = output.substring(firstBrace, lastBrace + 1);
    }

    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (error) {
      console.error("Invalid AI JSON:", output);
      res.status(500).json({ message: 'AI Parsing Error', details: error.message });
    }

  } catch (error) {
    console.error("Career Rec Error:", error);
    res.status(500).json({ message: 'Failed to generate career analysis' });
  }
};

module.exports = { getCourseRecommendations };
