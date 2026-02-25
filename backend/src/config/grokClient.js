const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const grokClient = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

module.exports = grokClient;
