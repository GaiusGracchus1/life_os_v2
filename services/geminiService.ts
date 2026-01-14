import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent, Email, LifeAnalysis } from "../types";

// Using the provided environment variable for API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLifeData = async (
  events: CalendarEvent[],
  emails: Email[]
): Promise<LifeAnalysis> => {
  const modelName = "gemini-3-flash-preview";

  // Data Optimization: Reduce payload size to prevent XHR/Network errors
  // Truncating email bodies is crucial for performance and stability in browser environments
  const simplifiedEmails = emails.map(e => ({
    sender: e.sender,
    subject: e.subject,
    date: e.timestamp,
    status: e.status,
    snippet: e.snippet,
    // Limit body context to first 1000 characters to save tokens and reduce request size significantly
    preview: e.fullBody ? e.fullBody.substring(0, 1000) : '' 
  }));

  const simplifiedEvents = events.map(e => ({
    summary: e.title,
    start: e.startTime,
    end: e.endTime,
    // Limit event descriptions as they can be very long (meeting notes, etc)
    description: e.description ? e.description.substring(0, 500) : ''
  }));

  // Prepare the data context for the AI
  const dataContext = JSON.stringify({
    calendar: simplifiedEvents,
    emails: simplifiedEmails,
    currentDate: new Date().toISOString()
  });

  const prompt = `
    You are an advanced executive assistant AI ("LifeOS"). 
    Analyze the provided JSON data representing my Google Calendar events and Gmail messages.
    
    Your goal is to categorize my life into distinct "Workflows" (e.g., "Project Omega", "Family & Social", "Health & Admin", "General Work") and provide a high-level overview.
    
    1. Provide an "overview": A list of major happenings, projects, or events. 
       - Each item must have a "title" (e.g., "Project Omega", "Ski Vacation", "Quarterly Review").
       - Each item must have a "description": A narrative paragraph explaining the current status, context, or details.
    
    2. For the "workflows" array (Categorized Action Plan):
       - Create categories based on the content.
       - "summary": A brief context string.
       - "outstandingItems": List of specific actionable to-dos or upcoming events.
       - "urgencyLevel": LOW, MEDIUM, or HIGH.
    
    3. Provide "keyInsights" (3 bullet points).
    
    4. Provide an "inboxAnalysis":
       - "summary": A concise paragraph summarizing the overall state of communications.
       - "topics": Identify 3-5 main topics/threads from the emails. For each topic provide:
          - "topic": Short name (e.g., "Project Omega", "Newsletters").
          - "description": A brief one-sentence summary of the topic (e.g., "Urgent timeline discussions with management").
          - "count": Number of related emails.
          - "status": A short status (e.g., "Action Needed", "Awaiting Reply", "Read").
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: "user", parts: [{ text: prompt }, { text: dataContext }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "description"]
              }
            },
            workflows: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoryName: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  outstandingItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  urgencyLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
                },
                required: ["categoryName", "summary", "outstandingItems", "urgencyLevel"]
              }
            },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            inboxAnalysis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      description: { type: Type.STRING },
                      count: { type: Type.NUMBER },
                      status: { type: Type.STRING }
                    },
                    required: ["topic", "description", "count", "status"]
                  }
                }
              },
              required: ["summary", "topics"]
            }
          },
          required: ["overview", "workflows", "keyInsights", "inboxAnalysis"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as LifeAnalysis;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Return a fallback state if AI fails
    return {
      overview: [{ title: "Analysis Failed", description: "Could not generate overview due to a network or API error." }],
      workflows: [],
      keyInsights: ["Failed to analyze data. Please try again or reduce the data volume."],
      inboxAnalysis: {
        summary: "Analysis unavailable.",
        topics: []
      }
    };
  }
};