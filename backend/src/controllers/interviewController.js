const grokClient = require('../config/grokClient');
const Interview = require('../models/Interview');

// @desc    Start/Continue Mock Interview
// @route   POST /api/interview/chat
// @access  Private
const chatInterview = async (req, res) => {
    const { message, jobDescription, interviewId } = req.body;
    const userId = req.user._id;

    try {
        let interview;
        let history = [];

        // Check if continuing an existing interview or starting new
        if (interviewId) {
            interview = await Interview.findOne({ _id: interviewId, user: userId });
            if (!interview) return res.status(404).json({ message: 'Interview not found' });
            history = interview.conversation;
        } else {
            // Create new interview session
            interview = await Interview.create({
                user: userId,
                jobDescription,
                conversation: [
                    {
                        role: 'system',
                        content: `You are an expert technical interviewer. 

Your task is to conduct a comprehensive interview that includes:
1. Technical questions based on the job description
2. Aptitude and logical reasoning questions
3. Situational and behavioral questions

Job Description:
"${jobDescription}"
IMPORTANT FORMATTING RULES:
1. Always number your questions: Q1:, Q2:, Q3:, etc.
2. Each question MUST start on a NEW LINE with its number
3. Do NOT mix the next question with the previous answer evaluation
4. After evaluating the user's answer, provide a blank line before the next question

QUESTION FLOW FORMAT:
User answers Q1
AI: <Evaluation of Q1 answer>
<blank line>
Q2: <Second question>

User answers Q2
AI: <Evaluation of Q2 answer>
<blank line>
Q3: <Third question>

Interview Structure:
- Start with technical questions from the JD
- Include aptitude questions (quantitative, logical, verbal)
- Include reasoning questions (analytical, problem-solving)
- Include situational/behavioral questions

Rules:
1. Ask ONE question at a time.
2. Alternate between technical and aptitude/reasoning questions.
3. Technical questions must be strictly derived from the job description.
4. Aptitude questions should test logical thinking, quantitative skills, and verbal ability.
5. After the user answers:
   - For technical questions: Evaluate if the answer is correct and provide explanation if wrong.
   - For aptitude questions: Provide the solution and explanation after user's attempt.
   - For reasoning questions: Explain the logical approach.
6. Keep your tone professional and encouraging.
7. Do not ask unrelated questions.

Your output should be:
Q1: <first question-preferably technical from JD>
`
                    }
                ]
            });
            history = interview.conversation;
        }

        // Add user message to history
        if (message) {
            history.push({ role: 'user', content: message });
        }

        // Prepare messages for AI (map to format expected by Groq/OpenAI)
        const aiMessages = history.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Get AI response
        const chatCompletion = await grokClient.chat.completions.create({
            messages: aiMessages,
            model: 'llama-3.1-8b-instant',
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content;

        // Save AI response
        history.push({ role: 'assistant', content: aiResponse });

        interview.conversation = history;
        await interview.save();

        res.json({
            interviewId: interview._id,
            message: aiResponse,
            history: history
        });

    } catch (error) {
        console.error("Interview Error:", error);
        res.status(500).json({ message: 'Interview processing failed' });
    }
};

// @desc    Get interview history
// @route   GET /api/interview/:id
// @access  Private
const getInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (interview && interview.user.equals(req.user._id)) {
            res.json(interview);
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { chatInterview, getInterview };
