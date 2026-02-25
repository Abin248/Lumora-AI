const grokClient = require('../config/grokClient');

// In-memory store for active speech sessions (simple version)
// For production, use DB. We'll use a simple Map for now or specific DB Model if needed.
// Given strict instructions, let's create a SpeechSession Model or just handle it in-memory/simulated for now.
// However, the user asked for a controller. Let's assume stateless or simple state for MVP.
// We will send history back and forth from frontend to keep it stateless.

const startSpeechTest = async (req, res) => {
    console.log(">>> [SpeechTest] Start requested. Body:", req.body);
    try {
        const { jobPosition } = req.body;
        if (!jobPosition) return res.status(400).json({ message: "Job position is required" });

        const prompt = `
        You are an expert interviewer. The candidate is applying for the position of "${jobPosition}".
        Generate the first introductory interview question.
        Keep it professional and concise.
        Return ONLY the question text.
        `;

        console.log(">>> [SpeechTest] Genering starting question with Groq...");
        const chatCompletion = await grokClient.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
        });

        const question = chatCompletion.choices[0]?.message?.content || "Tell me about yourself.";
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
        const { jobPosition, history, currentAnswer } = req.body;
        // history is array of { role: 'ai' | 'user', text: string }

        const messages = [
            {
                role: 'system',
                content: `You are an expert interviewer for a "${jobPosition}" role. 
                The user uses speech-to-text, so there might be slight transcription errors.
                Evaluate the user's answer to the previous question.
                Then ask the NEXT follow-up question.
                
                Format your response exactly like this:
                FEEDBACK: <brief feedback on the answer>
                QUESTION: <the next question>
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
        const { jobPosition, history } = req.body;

        const messages = [
            {
                role: 'system',
                content: `You are an expert Interview Coach analyzing a voice-based virtual interview for a "${jobPosition}" role.
                
                IMPORTANT: This interview used speech-to-text technology, so IGNORE minor grammar issues, filler words, or transcription errors.
                
                Evaluate the candidate on these critical virtual interview factors:
                
                1. **Grammar & Speech (20% weight)**: 
                   - Clarity of verbal communication and coherence of thoughts
                   - Ability to express ideas in spoken form
                   - Be VERY LENIENT with small grammar/transcription mistakes
                
                2. **Technical Accuracy (30% weight)**: 
                   - Knowledge depth and correct technical concepts
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
