import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Ensure your .env file has GEMINI_API_KEY=YOUR_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

/**
 * Generates a specified number of interview questions based on provided parameters.
 * @param industry The industry for the questions.
 * @param topic The topic of the questions.
 * @param type The type of interview (e.g., technical, behavioral).
 * @param role The role the candidate is applying for.
 * @param numOfQuestions The total number of questions to generate.
 * @param duration The total duration of the interview in minutes.
 * @param difficulty The difficulty level of the questions (e.g., easy, medium, hard).
 * @returns A promise that resolves to an array of question objects.
 */
export const generateQuestions = async (
  industry: string,
  topic: string,
  type: string,
  role: string,
  numOfQuestions: number,
  duration: number,
  difficulty: string
) => {
  const maxOutputTokens = 2000;

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
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: maxOutputTokens,
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

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      throw new Error("API returned an empty response. Failed to generate questions.");
    }

    const questions = content
      .trim()
      .split("\n")
      .filter((q) => q.trim().length > 0)
      .map((q) => ({
        question: q.trim(),
      }));

    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("An error occurred while generating questions.");
  }
};

/**
 * Helper function to parse scores and suggestions from a string.
 * @param content The string content from the API response.
 * @returns An object containing parsed scores and suggestion.
 */
function extractScoresAndSuggestion(content: string) {
  // Make the regex more flexible with optional spaces (\s*) and case-insensitivity (i).
  const overAllScoreMatch = content.match(/Overall\s*score\s*=\s*(\d+)/i);
  const relevanceScoreMatch = content.match(/Relevance\s*score\s*=\s*(\d+)/i);
  const clarityScoreMatch = content.match(/Clarity\s*score\s*=\s*(\d+)/i);
  const completenessScoreMatch = content.match(/Completeness\s*score\s*=\s*(\d+)/i);
  const suggestionsMatch = content.match(/Suggestions\s*=\s*(.*)/i);

  const overAllScore = overAllScoreMatch ? overAllScoreMatch[1] : "0";
  const relevance = relevanceScoreMatch ? relevanceScoreMatch[1] : "0";
  const clarity = clarityScoreMatch ? clarityScoreMatch[1] : "0";
  const completeness = completenessScoreMatch ? completenessScoreMatch[1] : "0";
  const suggestion = suggestionsMatch ? suggestionsMatch[1].trim() : "";

  return {
    overallScore: parseInt(overAllScore),
    relevance: parseInt(relevance),
    clarity: parseInt(clarity),
    completeness: parseInt(completeness),
    suggestion,
  };
}

/**
 * Evaluates a given answer to a question based on a set of criteria.
 * @param question The question asked.
 * @param answer The candidate's answer.
 * @returns A promise that resolves to an object with evaluation scores and suggestions.
 */
export const evaluateAnswer = async (question: string, answer: string) => {
  const prompt = `
    Evaluate the following answer to the question based on the evaluation criteria and provide the scores for relevance, clarity, and completeness, followed by suggestions in text format ensure the suggestion is in one line.
    
    **Evaluation Criteria:**
        1. Overall Score: Provide an overall score out of 10 based on the quality of the answer.
        2. Relevance: Provide a score out of 10 based on the answer is connected to the questions asked.
        3. Clarity: Provide a score out of 10 based on how clear and easy to understand the explanation is.
        4. Completeness: Provide a score out of 10 based on how well the answer covers all aspects of the question.
        5. Suggestions: Provide any suggestions or improvements to the answer in text.


    **Question:** ${question}
    **Answer:** ${answer}

    **Instructions:**
        - Always follow this exact format for the output: "Overall score=X, Relevance score=Y, Clarity score=Z, Completeness score=W, Suggestions=Your_suggestion_here".
        - Do not include any other text or prefixes.
    `;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 500,
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

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();
 console.log("Gemini API raw response:", content);
    if (!content) {
      throw new Error("API returned an empty response. Failed to evaluate answer.");
    }


    const parsedResult = extractScoresAndSuggestion(content);
    
    return parsedResult;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw new Error("An error occurred while evaluating the answer.");
  }
};