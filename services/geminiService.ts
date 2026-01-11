import { GoogleGenAI, Type } from "@google/genai";
import { EnhancedAddonDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRepoWithGemini = async (
  repoName: string, 
  description: string, 
  topics: string[], 
  language: string | null
): Promise<EnhancedAddonDetails> => {
  
  const prompt = `
    Analyze the following Seeq software add-on/repository and provide a structured enhancement for the gallery listing.
    
    Repository: ${repoName}
    Description: ${description || "No description provided."}
    Language: ${language || "Unknown"}
    Topics: ${topics.join(', ')}

    Please act as a Technical Product Manager at Seeq. 
    1. Write a concise, 1-sentence "AI Summary" that sells the value.
    2. List 3 potential "Use Cases" for an industrial engineer.
    3. Estimate "Technical Complexity" (Low/Medium/High) based on the language and nature of the tool.
    4. Write a short "Business Value" statement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiSummary: { type: Type.STRING },
            useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalComplexity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            businessValue: { type: Type.STRING }
          },
          required: ['aiSummary', 'useCases', 'technicalComplexity', 'businessValue']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const json = JSON.parse(text);
    return {
      repoId: 0, // Assigned by caller
      ...json
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback if AI fails
    return {
      repoId: 0,
      aiSummary: description || "An essential tool for the Seeq ecosystem.",
      useCases: ["Data Analysis", "Process Improvement", "Automation"],
      technicalComplexity: "Medium",
      businessValue: "Improves operational efficiency through better data handling."
    };
  }
};
