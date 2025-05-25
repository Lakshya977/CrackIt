import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Ensure your .env file has GEMINI_API_KEY=YOUR_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const generateQuestions = async (
  industry: string,
  topic: string,
  type: string,
  role: string,
  numOfQuestions: number,
  duration: number,
  difficulty: string
) => {
  // Gemini models handle tokens differently, so maxTokens isn't directly calculated this way.
  // Instead, you'll rely on the model's inherent token limits for the response.
  // We'll set a reasonable maxOutputTokens for the response to prevent excessively long outputs.
  const maxOutputTokens = 2000; // Adjust as needed, a good starting point for question generation

  const prompt = `
    Generate total "${numOfQuestions}" "${difficulty}" "${type}" interview questions for the topic "${topic}" in the "${industry}" industry.
    The interview is for a candidate applying for the role of "${role}" and total duration of interview is "${duration}" minutes.
    
    **Ensure the following:**
    - The questions are well-balanced, including both open-ended and specific questions.
    - Each question is designed to evaluate a specific skill or knowledge area relevant to the role.
    - The questions are clear, concise and engaging for the candidate.
    - The questions are suitable for a "${difficulty}" interview in the "${industry}" industry.
    - Ensure the questions are directly aligned with "${difficulty}" responsibilities and expertise in "${role}".
    
    **Instructions:**
    - Always follow same format for questions.
    - Provide all question without any prefix.
    - No question number or bullet points or hypen - is required.
    `;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Use a suitable Gemini model, e.g., 'gemini-1.5-flash'
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: maxOutputTokens,
    },
    // Optional: Add safety settings if you want to explicitly control content generation
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  if (!content) {
    throw new Error("Failed to generate questions");
  }

  const questions = content
    .trim()
    .split("\n")
    .filter((q) => q)
    .map((q) => ({
      question: q.trim(), // Trim individual questions too
    }));

  return questions;
};

function extractScoresAndSuggestion(content: string) {
  const overAllScoreMatch = content.match(/Overall score=(\d+)/);
  const relevanceScoreMatch = content.match(/Relevance score=(\d+)/);
  const clarityScoreMatch = content.match(/Clarity score=(\d+)/);
  const completenessScoreMatch = content.match(/Completeness score=(\d+)/);
  const suggestionsMatch = content.match(/Suggestions=(.*)/);

  const overAllScore = overAllScoreMatch ? overAllScoreMatch[1] : "0";
  const relevance = relevanceScoreMatch ? relevanceScoreMatch[1] : "0";
  const clarity = clarityScoreMatch ? clarityScoreMatch[1] : "0";
  const completeness = completenessScoreMatch ? completenessScoreMatch[1] : "0";
  const suggestion = suggestionsMatch ? suggestionsMatch[1] : "";

  return {
    overallScore: parseInt(overAllScore),
    relevance: parseInt(relevance),
    clarity: parseInt(clarity),
    completeness: parseInt(completeness),
    suggestion,
  };
}

export const evaluateAnswer = async (question: string, answer: string) => {
  const prompt = `
    Evaluate the following answer to the question based on the evaluation criteria and provide the scores for relevance, clarity, and completeness, followed by suggestions in text format.
    
    **Evaluation Criteria:**
        1. Overall Score: Provide an overall score out of 10 based on the quality of the answer.
        2. Relevance: Provide a score out of 10 based on how relevant the answer is to the question.
        3. Clarity: Provide a score out of 10 based on how clear and easy to understand the explanation is.
        4. Completeness: Provide a score out of 10 based on how well the answer covers all aspects of the question.
        5. Suggestions: Provide any suggestions or improvements to the answer in text.

    **Question:** ${question}
    **Answer:** ${answer}

    **Instructions:**
        - Always follow same format for providing scores and suggestions.
        - Provide the score only like "Overall score=5", "Relevance score=7", "Clarity score=9", "Completeness score=1", for following:
            - Overall score
            - Relevance score
            - Clarity score
            - Completeness score
        -Provide text only for following only like "Suggestions=your_answer_here":  
            - Suggestions or improved answer in text.
    `;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Use a suitable Gemini model
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 500, // Limit output tokens for evaluation to keep it concise
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();
  
  if (!content) {
    throw new Error("Failed to evaluate answer");
  }
  
  const parsedResult = extractScoresAndSuggestion(content);
  

  return {
    overallScore: parsedResult.overallScore,
    relevance: parsedResult.relevance,
    clarity: parsedResult.clarity,
    completeness: parsedResult.completeness,
    suggestion: parsedResult.suggestion,
  };
};