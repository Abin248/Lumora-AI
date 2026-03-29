// const grokClient = require('../config/grokClient');


// const startSpeechTest = async (req, res) => {
//     console.log(">>> [SpeechTest] Start requested. Body:", req.body);
//     try {
//         const { jobPosition } = req.body;
//         if (!jobPosition) return res.status(400).json({ message: "Job position is required" });

//         const prompt = `
//         You are an expert interviewer. The candidate is applying for the position of "${jobPosition}".
//         Generate the first introductory interview question.
//         Keep it professional and concise.
//         Return ONLY the question text.
//         `;

//         console.log(">>> [SpeechTest] Genering starting question with Groq...");
//         const chatCompletion = await grokClient.chat.completions.create({
//             messages: [{ role: 'user', content: prompt }],
//             model: 'llama-3.1-8b-instant',
//             temperature: 0.7,
//         });

//         const question = chatCompletion.choices[0]?.message?.content || "Tell me about yourself.";
//         console.log(">>> [SpeechTest] Question generated:", question);
//         res.json({ question });
//     } catch (error) {
//         console.error(">>> [SpeechTest] Start Error:", error);
//         res.status(500).json({ message: "Failed to start interview" });
//     }
// };

// const processSpeechAnswer = async (req, res) => {
//     console.log(">>> [SpeechTest] Process Answer requested. Body:", { ...req.body, historyLength: req.body.history?.length });
//     try {
//         const { jobPosition, history, currentAnswer } = req.body;
//         // history is array of { role: 'ai' | 'user', text: string }

//         const messages = [
//             {
//                 role: 'system',
//                 content: `You are an expert interviewer for a "${jobPosition}" role. 
//                 The user uses speech-to-text, so there might be slight transcription errors.
//                 Evaluate the user's answer to the previous question.
//                 Then ask the NEXT follow-up question.
                
//                 Format your response exactly like this:
//                 FEEDBACK: <brief feedback on the answer>
//                 QUESTION: <the next question>
//                 `
//             }
//         ];

//         // Add history context
//         history.forEach(h => {
//             messages.push({
//                 role: h.role === 'ai' ? 'assistant' : 'user',
//                 content: h.text
//             });
//         });

//         // Add current answer
//         messages.push({ role: 'user', content: currentAnswer });

//         console.log(">>> [SpeechTest] Sending context to Groq for feedback...");
//         const chatCompletion = await grokClient.chat.completions.create({
//             messages: messages,
//             model: 'llama-3.1-8b-instant',
//             temperature: 0.7,
//         });

//         const responseText = chatCompletion.choices[0]?.message?.content || "";
//         console.log(">>> [SpeechTest] Groq Response:", responseText);

//         // Parse Feedback and Question
//         const feedbackMatch = responseText.match(/FEEDBACK:([\s\S]*?)QUESTION:/);
//         const questionMatch = responseText.match(/QUESTION:([\s\S]*)/);

//         const feedback = feedbackMatch ? feedbackMatch[1].trim() : "Good effort.";
//         const nextQuestion = questionMatch ? questionMatch[1].trim() : responseText;

//         res.json({ feedback, nextQuestion });

//     } catch (error) {
//         console.error(">>> [SpeechTest] Process Answer Error:", error);
//         res.status(500).json({ message: "Failed to process answer" });
//     }
// };

// const generateSpeechReport = async (req, res) => {
//     console.log(">>> [SpeechTest] Generate Report requested. History Length:", req.body.history?.length);
//     try {
//         const { jobPosition, history } = req.body;

//         const messages = [
//             {
//                 role: 'system',
//                 content: `You are an expert Interview Coach analyzing a voice-based virtual interview for a "${jobPosition}" role.
                
//                 IMPORTANT: This interview used speech-to-text technology, so IGNORE minor grammar issues, filler words, or transcription errors.
                
//                 Evaluate the candidate on these critical virtual interview factors:
                
//                 1. **Grammar & Speech (20% weight)**: 
//                    - Clarity of verbal communication and coherence of thoughts
//                    - Ability to express ideas in spoken form
//                    - Be VERY LENIENT with small grammar/transcription mistakes
                
//                 2. **Technical Accuracy (30% weight)**: 
//                    - Knowledge depth and correct technical concepts
//                    - Use of relevant industry keywords and terminology
//                    - Problem-solving ability and relevant experience
                
//                 3. **Communication Style (25% weight)**: 
//                    - Professional demeanor and engagement level
//                    - Structured, organized thinking
//                    - Ability to articulate complex ideas clearly
                
//                 4. **Confidence Level (15% weight)**:
//                    - Assertiveness and self-assurance in responses
//                    - Decisiveness and conviction in answers
//                    - Lack of excessive hedging or uncertainty
                
//                 5. **Keyword Usage (10% weight)**:
//                    - Use of industry-specific terminology
//                    - Mention of relevant tools, technologies, methodologies
//                    - Domain knowledge indicators

//                 Scoring Guidelines:
//                 - 80-100%: Exceptional performance, strong hire recommendation
//                 - 70-79%: Good performance, demonstrates competence
//                 - 50-69%: Acceptable but with notable gaps
//                 - Below 50%: Significant deficiencies

//                 BE CONSTRUCTIVE and encouraging. Focus on content, confidence, clarity, and keyword usage—not speech artifacts.

//                 Return a JSON object with this structure:
//                 {
//                     "score": <overall number 0-100>,
//                     "grammarScore": <number 0-100>,
//                     "technicalScore": <number 0-100>,
//                     "communicationScore": <number 0-100>,
//                     "confidenceLevel": "<Low/Medium/High>",
//                     "grammarFeedback": "<focus on clarity and coherence>",
//                     "technicalFeedback": "<evaluate knowledge, keywords, accuracy>",
//                     "communicationFeedback": "<assess clarity, confidence, professionalism>",
//                     "improvementTips": ["<actionable tip>", "<actionable tip>", "<actionable tip>"]
//                 }
//                 Return ONLY the JSON. API users depend on valid JSON.
//                 `
//             }
//         ];

//         const historyText = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
//         messages.push({ role: 'user', content: historyText });

//         console.log(">>> [SpeechTest] Analyzing transcript...");
//         const chatCompletion = await grokClient.chat.completions.create({
//             messages: messages,
//             model: 'llama-3.1-8b-instant',
//             temperature: 0,
//         });

//         const content = chatCompletion.choices[0]?.message?.content || "{}";
//         const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
//         console.log(">>> [SpeechTest] Report Raw JSON:", jsonStr);
//         const report = JSON.parse(jsonStr);

//         res.json(report);

//     } catch (error) {
//         console.error(">>> [SpeechTest] Generate Report Error:", error);
//         res.status(500).json({ message: "Failed to generate report" });
//     }
// };

// module.exports = { startSpeechTest, processSpeechAnswer, generateSpeechReport };

//===================================================================================================


const grokClient = require('../config/grokClient');
const Resume = require('../models/Resume');

const startSpeechTest = async (req, res) => {
    console.log(">>> [SpeechTest] Start requested. Body:", req.body);
    try {
        const { jobPosition, resumeId } = req.body;
        if (!jobPosition) return res.status(400).json({ message: "Job position is required" });
        if (!resumeId) return res.status(400).json({ message: "Resume ID is required" });

        // Fetch the resume and verify ownership
        const resume = await Resume.findById(resumeId);
        if (!resume) return res.status(404).json({ message: "Resume not found" });
        if (!resume.user.equals(req.user._id)) {
            return res.status(403).json({ message: "Not authorized to access this resume" });
        }

        const userName = resume.personalInfo?.fullName || "there";
        const userSkills = resume.skills?.join(", ") || "various skills";
        const userProjects = resume.projects?.map(p => p.title).join(", ") || "several projects";
        const userExperience = resume.experiences?.map(e => `${e.jobTitle} at ${e.company}`).join(", ") || "relevant experience";

        const prompt = `
        You are an expert interviewer. The candidate is applying for the position of "${jobPosition}".
        Their resume shows:
        - Name: ${userName}
        - Skills: ${userSkills}
        - Projects: ${userProjects}
        - Experience: ${userExperience}

        Greet the candidate by name and ask them to introduce themselves, referencing their background.
        Keep it professional and concise. 
        Return ONLY the question text.
        Example: "Hello ${userName}, I see you have experience in ${userSkills}. Could you please introduce yourself and tell me more about your background?"
        `;

        console.log(">>> [SpeechTest] Generating personalized starting question...");
        const chatCompletion = await grokClient.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
        });

        const question = chatCompletion.choices[0]?.message?.content || 
            `Hello ${userName}, could you please introduce yourself and tell me about your background?`;
        console.log(">>> [SpeechTest] Question generated:", question);
        res.json({ question });
    } catch (error) {
        console.error(">>> [SpeechTest] Start Error:", error);
        res.status(500).json({ message: "Failed to start interview" });
    }
};

const processSpeechAnswer = async (req, res) => {
    console.log(">>> [SpeechTest] Process Answer requested. Body:", { ...req.body, historyLength: req.body.history?.length });
    try {
        const { jobPosition, resumeId, history, currentAnswer } = req.body;

        // Fetch resume for context
        const resume = await Resume.findById(resumeId);
        if (!resume) return res.status(404).json({ message: "Resume not found" });
        if (!resume.user.equals(req.user._id)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const userName = resume.personalInfo?.fullName || "the candidate";
        const userSkills = resume.skills?.join(", ") || "various skills";
        const userProjects = resume.projects?.map(p => p.title).join(", ") || "several projects";
        const userExperience = resume.experiences?.map(e => `${e.jobTitle} at ${e.company}`).join(", ") || "relevant experience";

        const messages = [
            {
                role: 'system',
                content: `You are an expert interviewer for a "${jobPosition}" role. 
                The candidate's resume shows: Name: ${userName}, Skills: ${userSkills}, Projects: ${userProjects}, Experience: ${userExperience}.
                The user uses speech-to-text, so there might be slight transcription errors.
                Evaluate the user's answer to the previous question. Then ask a follow-up question that probes deeper into their resume (e.g., about a specific project, skill, or experience).
                
                Format your response exactly like this:
                FEEDBACK: <brief, encouraging feedback on the answer>
                QUESTION: <the next question that refers to their resume>
                `
            }
        ];

        // Add history context
        history.forEach(h => {
            messages.push({
                role: h.role === 'ai' ? 'assistant' : 'user',
                content: h.text
            });
        });

        // Add current answer
        messages.push({ role: 'user', content: currentAnswer });

        console.log(">>> [SpeechTest] Sending context to Groq for feedback...");
        const chatCompletion = await grokClient.chat.completions.create({
            messages: messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "";
        console.log(">>> [SpeechTest] Groq Response:", responseText);

        // Parse Feedback and Question
        const feedbackMatch = responseText.match(/FEEDBACK:([\s\S]*?)QUESTION:/);
        const questionMatch = responseText.match(/QUESTION:([\s\S]*)/);

        const feedback = feedbackMatch ? feedbackMatch[1].trim() : "Good effort.";
        const nextQuestion = questionMatch ? questionMatch[1].trim() : responseText;

        res.json({ feedback, nextQuestion });

    } catch (error) {
        console.error(">>> [SpeechTest] Process Answer Error:", error);
        res.status(500).json({ message: "Failed to process answer" });
    }
};

const generateSpeechReport = async (req, res) => {
    console.log(">>> [SpeechTest] Generate Report requested. History Length:", req.body.history?.length);
    try {
        const { jobPosition, resumeId, history } = req.body;

        // Fetch resume for context
        const resume = await Resume.findById(resumeId);
        if (!resume) return res.status(404).json({ message: "Resume not found" });
        if (!resume.user.equals(req.user._id)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const messages = [
            {
                role: 'system',
                content: `You are an expert Interview Coach analyzing a voice-based virtual interview for a "${jobPosition}" role.
                The candidate's resume is: ${JSON.stringify(resume.toObject())}.
                
                IMPORTANT: This interview used speech-to-text technology, so IGNORE minor grammar issues, filler words, or transcription errors.
                
                Evaluate the candidate on these critical virtual interview factors:
                
                1. **Grammar & Speech (20% weight)**: 
                   - Clarity of verbal communication and coherence of thoughts
                   - Ability to express ideas in spoken form
                   - Be VERY LENIENT with small grammar/transcription mistakes
                
                2. **Technical Accuracy (30% weight)**: 
                   - Knowledge depth and correct technical concepts, compared to resume claims
                   - Use of relevant industry keywords and terminology
                   - Problem-solving ability and relevant experience
                
                3. **Communication Style (25% weight)**: 
                   - Professional demeanor and engagement level
                   - Structured, organized thinking
                   - Ability to articulate complex ideas clearly
                
                4. **Confidence Level (15% weight)**:
                   - Assertiveness and self-assurance in responses
                   - Decisiveness and conviction in answers
                   - Lack of excessive hedging or uncertainty
                
                5. **Keyword Usage (10% weight)**:
                   - Use of industry-specific terminology
                   - Mention of relevant tools, technologies, methodologies
                   - Domain knowledge indicators

                Scoring Guidelines:
                - 80-100%: Exceptional performance, strong hire recommendation
                - 70-79%: Good performance, demonstrates competence
                - 50-69%: Acceptable but with notable gaps
                - Below 50%: Significant deficiencies

                BE CONSTRUCTIVE and encouraging. Focus on content, confidence, clarity, and keyword usage—not speech artifacts.

                Return a JSON object with this structure:
                {
                    "score": <overall number 0-100>,
                    "grammarScore": <number 0-100>,
                    "technicalScore": <number 0-100>,
                    "communicationScore": <number 0-100>,
                    "confidenceLevel": "<Low/Medium/High>",
                    "grammarFeedback": "<focus on clarity and coherence>",
                    "technicalFeedback": "<evaluate knowledge, keywords, accuracy>",
                    "communicationFeedback": "<assess clarity, confidence, professionalism>",
                    "improvementTips": ["<actionable tip>", "<actionable tip>", "<actionable tip>"]
                }
                Return ONLY the JSON. API users depend on valid JSON.
                `
            }
        ];

        const historyText = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
        messages.push({ role: 'user', content: historyText });

        console.log(">>> [SpeechTest] Analyzing transcript...");
        const chatCompletion = await grokClient.chat.completions.create({
            messages: messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0,
        });

        const content = chatCompletion.choices[0]?.message?.content || "{}";
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log(">>> [SpeechTest] Report Raw JSON:", jsonStr);
        const report = JSON.parse(jsonStr);

        res.json(report);

    } catch (error) {
        console.error(">>> [SpeechTest] Generate Report Error:", error);
        res.status(500).json({ message: "Failed to generate report" });
    }
};

module.exports = { startSpeechTest, processSpeechAnswer, generateSpeechReport };