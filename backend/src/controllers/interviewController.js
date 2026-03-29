// const grokClient = require('../config/grokClient');
// const Interview = require('../models/Interview');

// const chatInterview = async (req, res) => {
//     const { message, jobDescription, interviewId } = req.body;
//     const userId = req.user._id;

//     try {
//         let interview;
//         let history = [];

//         // Check if continuing an existing interview or starting new
//         if (interviewId) {
//             interview = await Interview.findOne({ _id: interviewId, user: userId });
//             if (!interview) return res.status(404).json({ message: 'Interview not found' });
//             history = interview.conversation;
//         } else {
//             // Create new interview session with enhanced system prompt
//             interview = await Interview.create({
//                 user: userId,
//                 jobDescription,
//                 conversation: [
//                     {
//                         role: 'system',
//                         content: `You are an expert technical interviewer. 

// Your task is to conduct a comprehensive interview that includes:
// 1. Technical questions based on the job description
// 2. Aptitude and logical reasoning questions
// 3. Situational and behavioral questions

// Job Description:
// "${jobDescription}"

// IMPORTANT FORMATTING RULES:
// 1. Always number your questions: Q1:, Q2:, Q3:, etc.
// 2. Each question MUST start on a NEW LINE with its number.
// 3. Do NOT mix the next question with the previous answer evaluation.
// 4. After evaluating the user's answer, provide a blank line before the next question.

// QUESTION FLOW FORMAT:
// User answers Q1
// AI: <Evaluation of Q1 answer>
// <blank line>
// Q2: <Second question>

// User answers Q2
// AI: <Evaluation of Q2 answer>
// <blank line>
// Q3: <Third question>

// Interview Structure:
// - Start with technical questions from the JD.
// - Include aptitude questions (quantitative, logical, verbal).
// - Include reasoning questions (analytical, problem-solving).
// - Include situational/behavioral questions.

// Rules:
// 1. Ask ONE question at a time.
// 2. Alternate between technical and aptitude/reasoning questions.
// 3. Technical questions must be strictly derived from the job description.
// 4. Aptitude questions should test logical thinking, quantitative skills, and verbal ability.
// 5. After the user answers:
//    - First, evaluate correctness. 
//      - **If the answer is correct, start your response with "Your answer is correct."** 
//      - If the answer is incorrect, explain why it’s wrong and provide the correct answer or approach.
//    - Then, depending on the question type, follow these guidelines:
//         * For technical questions: explain why it’s correct/incorrect and give additional context if helpful.
//         * For aptitude questions: provide the solution and step‑by‑step explanation.
//         * For reasoning questions: explain the logical approach.
// 6. After providing the evaluation, insert a blank line, then ask the next question in the format **Q<next number>: <question>**.
// 7. Keep your tone professional and encouraging.
// 8. Do not ask unrelated questions.

// Your very first output should be:
// Q1: <first question – preferably technical from the JD>
// `
//                     }
//                 ]
//             });
//             history = interview.conversation;
//         }

//         // Add user message to history
//         if (message) {
//             history.push({ role: 'user', content: message });
//         }

//         // Prepare messages for AI (map to format expected by Groq/OpenAI)
//         const aiMessages = history.map(msg => ({
//             role: msg.role,
//             content: msg.content
//         }));

//         // Get AI response
//         const chatCompletion = await grokClient.chat.completions.create({
//             messages: aiMessages,
//             model: 'llama-3.1-8b-instant',
//         });

//         const aiResponse = chatCompletion.choices[0]?.message?.content;

//         // Save AI response
//         history.push({ role: 'assistant', content: aiResponse });

//         interview.conversation = history;
//         await interview.save();

//         res.json({
//             interviewId: interview._id,
//             message: aiResponse,
//             history: history
//         });

//     } catch (error) {
//         console.error("Interview Error:", error);
//         res.status(500).json({ message: 'Interview processing failed' });
//     }
// };

// const getInterview = async (req, res) => {
//     try {
//         const interview = await Interview.findById(req.params.id);
//         if (interview && interview.user.equals(req.user._id)) {
//             res.json(interview);
//         } else {
//             res.status(404).json({ message: 'Not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = { chatInterview, getInterview };


//===================================================================================================================



// import Interview from "../models/Interview.js";
// import Groq from "groq-sdk";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// // ============================
// // GENERATE QUESTION PROMPT
// // ============================
// const generateQuestionPrompt = ({
//   resumeSummary,
//   jobDescription,
//   difficultyLevel,
//   questionNumber
// }) => `
// You are a professional technical interviewer.

// Candidate Resume Summary:
// ${resumeSummary}

// Job Description:
// ${jobDescription}

// Current Difficulty Level: ${difficultyLevel}
// (1=Basic concept, 2=Practical implementation, 3=Scenario/Optimization)

// Ask ONE multiple-choice question.

// Rules:
// - Must relate to resume or job description.
// - Provide exactly 4 options.
// - Label strictly:

// Q${questionNumber}: <question>

// A) ...
// B) ...
// C) ...
// D) ...

// After options write:
// Correct Answer: <letter only>

// No explanation yet.
// `;


// // ============================
// // EVALUATE ANSWER PROMPT
// // ============================
// const evaluateAnswerPrompt = ({
//   question,
//   userAnswer,
//   correctAnswer,
//   difficultyLevel
// }) => `
// You are evaluating a technical interview answer.

// Question:
// ${question}

// User selected: ${userAnswer}
// Correct Answer: ${correctAnswer}

// If correct:
// - Say: ✅ Correct!
// - Give 2-3 line explanation.
// - If difficulty >=2 add deeper insight.

// If incorrect:
// - Say: ❌ Incorrect.
// - Clearly say: The correct answer is ${correctAnswer}.
// - Give short explanation.
// - Briefly explain why selected option is wrong.

// Be professional and encouraging.
// `;


// // ============================
// // FINAL SUMMARY PROMPT
// // ============================
// const finalSummaryPrompt = (score) => `
// Provide a professional interview summary.

// Candidate Final Score: ${score}/5

// Include:
// - Technical Strengths
// - Areas of Improvement
// - Overall Readiness (Beginner/Intermediate/Job-Ready)
// - Final Rating out of 10

// Keep structured.
// `;


// // ============================
// // MAIN CONTROLLER
// // ============================
// export const chatInterview = async (req, res) => {

//   try {

//     const { interviewId, jobDescription, resumeSummary, message } = req.body;

//     // =========================
//     // START NEW INTERVIEW
//     // =========================
//     if (!interviewId) {

//       const interview = await Interview.create({
//         jobDescription,
//         resumeSummary,
//         history: []
//       });

//       const prompt = generateQuestionPrompt({
//         resumeSummary,
//         jobDescription,
//         difficultyLevel: 1,
//         questionNumber: 1
//       });

//       const completion = await groq.chat.completions.create({
//         model: "llama3-70b-8192",
//         messages: [{ role: "user", content: prompt }]
//       });

//       const aiMessage = completion.choices[0].message.content;

//       const correctMatch = aiMessage.match(/Correct Answer:\s*([A-D])/);
//       const correctAnswer = correctMatch ? correctMatch[1] : "A";

//       interview.currentCorrectAnswer = correctAnswer;
//       interview.totalQuestions = 1;

//       interview.history.push({ role: "assistant", content: aiMessage });

//       await interview.save();

//       return res.json({
//         interviewId: interview._id,
//         history: interview.history
//       });
//     }


//     // =========================
//     // CONTINUE INTERVIEW
//     // =========================
//     const interview = await Interview.findById(interviewId);

//     if (!interview) {
//       return res.status(404).json({ message: "Interview not found" });
//     }

//     const userAnswer = message;
//     const correctAnswer = interview.currentCorrectAnswer;

//     // Save user message
//     interview.history.push({
//       role: "user",
//       content: userAnswer
//     });

//     // =========================
//     // EVALUATE ANSWER
//     // =========================
//     const lastQuestion = interview.history
//       .filter(m => m.role === "assistant")
//       .slice(-1)[0].content;

//     const evaluationPrompt = evaluateAnswerPrompt({
//       question: lastQuestion,
//       userAnswer,
//       correctAnswer,
//       difficultyLevel: interview.difficultyLevel
//     });

//     const evaluation = await groq.chat.completions.create({
//       model: "llama3-70b-8192",
//       messages: [{ role: "user", content: evaluationPrompt }]
//     });

//     const evaluationText = evaluation.choices[0].message.content;

//     interview.history.push({
//       role: "assistant",
//       content: evaluationText
//     });

//     // =========================
//     // UPDATE SCORE + DIFFICULTY
//     // =========================
//     if (userAnswer === correctAnswer) {
//       interview.score += 1;
//       interview.correctStreak += 1;

//       if (interview.correctStreak >= 2 && interview.difficultyLevel < 3) {
//         interview.difficultyLevel += 1;
//         interview.correctStreak = 0;
//       }

//     } else {
//       interview.correctStreak = 0;

//       if (interview.difficultyLevel > 1) {
//         interview.difficultyLevel -= 1;
//       }
//     }

//     // =========================
//     // END AFTER 5 QUESTIONS
//     // =========================
//     if (interview.totalQuestions >= 5) {

//       const summary = await groq.chat.completions.create({
//         model: "llama3-70b-8192",
//         messages: [{
//           role: "user",
//           content: finalSummaryPrompt(interview.score)
//         }]
//       });

//       interview.history.push({
//         role: "assistant",
//         content: summary.choices[0].message.content
//       });

//       await interview.save();

//       return res.json({ history: interview.history });
//     }

//     // =========================
//     // GENERATE NEXT QUESTION
//     // =========================
//     interview.totalQuestions += 1;

//     const nextPrompt = generateQuestionPrompt({
//       resumeSummary: interview.resumeSummary,
//       jobDescription: interview.jobDescription,
//       difficultyLevel: interview.difficultyLevel,
//       questionNumber: interview.totalQuestions
//     });

//     const nextQuestion = await groq.chat.completions.create({
//       model: "llama3-70b-8192",
//       messages: [{ role: "user", content: nextPrompt }]
//     });

//     const nextText = nextQuestion.choices[0].message.content;

//     const nextCorrectMatch = nextText.match(/Correct Answer:\s*([A-D])/);
//     interview.currentCorrectAnswer = nextCorrectMatch
//       ? nextCorrectMatch[1]
//       : "A";

//     interview.history.push({
//       role: "assistant",
//       content: nextText
//     });

//     await interview.save();

//     return res.json({ history: interview.history });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

//=======================================================================================================

const grokClient = require('../config/grokClient');
const Interview = require('../models/Interview');

const chatInterview = async (req, res) => {
    const { message, jobDescription, interviewId } = req.body;
    const userId = req.user._id;

    try {
        let interview;
        let history = [];

        // =============================
        // START NEW INTERVIEW
        // =============================
        if (!interviewId) {

            interview = await Interview.create({
                user: userId,
                jobDescription,
                conversation: [
                    {
                        role: 'system',
                        content: `
You are an expert technical interviewer.

You MUST ask ONLY Multiple Choice Questions (MCQs).

STRICT FORMAT:

Q1: <Question>

A) Option A
B) Option B
C) Option C
D) Option D

Correct Answer: <A/B/C/D>
Explanation: <One short explanation sentence>

RULES:
1. Ask ONE question at a time.
2. Alternate between technical and aptitude questions.
3. Wait for user's answer before next question.
4. Keep explanation short (1–2 lines).

Job Description:
"${jobDescription}"
`
                    }
                ]
            });

            history = interview.conversation;

        } else {

            interview = await Interview.findOne({ _id: interviewId, user: userId });
            if (!interview) {
                return res.status(404).json({ message: 'Interview not found' });
            }

            history = interview.conversation;
        }

        // =============================
        // EVALUATE USER ANSWER
        // =============================
        if (message) {

            history.push({ role: 'user', content: message });

            const lastQuestion = [...history]
                .reverse()
                .find(m => m.role === 'assistant' && m.content.includes("Correct Answer"));

            if (lastQuestion) {

                const correctMatch = lastQuestion.content.match(/Correct Answer:\s*(A|B|C|D)/i);
                const explanationMatch = lastQuestion.content.match(/Explanation:\s*(.*)/i);
                const questionNumberMatch = lastQuestion.content.match(/Q(\d+):/);

                if (correctMatch) {

                    const correctAnswer = correctMatch[1].toUpperCase();
                    const explanation = explanationMatch ? explanationMatch[1].trim() : '';
                    const questionNumber = questionNumberMatch ? questionNumberMatch[1] : '';

                    let feedback;

                    if (message.toUpperCase() === correctAnswer) {

                        feedback = `✅ Your answer for Q${questionNumber} is correct.`;

                    } else {

                        feedback = `❌ Your answer for Q${questionNumber} is wrong.
Correct Answer: ${correctAnswer}
Explanation: ${explanation}`;
                    }

                    history.push({ role: 'assistant', content: feedback });
                }
            }
        }

        // =============================
        // GENERATE NEXT QUESTION
        // =============================
        const aiMessages = history.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const chatCompletion = await grokClient.chat.completions.create({
            messages: aiMessages,
            model: 'llama-3.1-8b-instant',
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content;

        history.push({ role: 'assistant', content: aiResponse });

        interview.conversation = history;
        await interview.save();

        res.json({
            interviewId: interview._id,
            history
        });

    } catch (error) {
        console.error("Interview Error:", error);
        res.status(500).json({ message: 'Interview processing failed' });
    }
};

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
};

module.exports = { chatInterview, getInterview };