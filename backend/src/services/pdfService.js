// const fs = require('fs');
// const pdf = require('pdf-parse');

// const extractTextFromPDF = async (filePath) => {
//     const dataBuffer = fs.readFileSync(filePath);
//     const data = await pdf(dataBuffer);
//     return data.text;
// };

// module.exports = { extractTextFromPDF };

const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extract text from a PDF file.
 * Note: This works only for text-based PDFs. Scanned/image PDFs will return empty or garbled text.
 * For production, consider integrating an OCR engine (e.g., Tesseract) or a commercial service.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text || '';
    if (text.trim().length === 0) {
      console.warn('Warning: Extracted text is empty. The PDF may be scanned or image-based.');
    }
    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. Ensure the file is not corrupted or password-protected.');
  }
};

module.exports = { extractTextFromPDF };