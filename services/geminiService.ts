
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeReportFiles(files: { name: string; data: string; mimeType: string; isText?: boolean }[], context: any, resourceLinks: any) {
    const textDataParts = files
      .filter(f => f.isText)
      .map(f => `FILE: ${f.name}\nCONTENT:\n${f.data}`)
      .join('\n\n---\n\n');

    const manualResourcesContext = `
      YouTube Links: ${JSON.stringify(resourceLinks.youtubeLinks)}
      Article Links: ${JSON.stringify(resourceLinks.articleLinks)}
    `;

    const hashtagsList = context.hashtag.filter((h: string) => h.trim() !== '').join(', ');
    const mentionsList = context.linkedinMention.filter((m: string) => m.trim() !== '').join(', ');

    const prompt = `
      You are an expert data analyst for IIoT World. 
      Analyze the provided campaign data for "${context.clientName}" and campaign "${context.campaignName}".
      
      CORE DATA SOURCE (TEXT/CSV):
      ${textDataParts || 'No CSV data provided.'}
      
      MANUAL RESOURCE LINKS:
      ${manualResourcesContext}
      
      CRITICAL INSTRUCTIONS:
      1. INDEPENDENCE OF DATA: The extraction of metrics and post inventory from the CSV data MUST be absolute and independent of whether visual assets (Images, Videos, PDFs) are uploaded. Even if NO images or videos are provided, the metrics from the CSV must be perfectly extracted.
      
      2. EXHAUSTIVE LINKEDIN CAPTURE: 
         - In the LinkedIn CSV files, you MUST process every single row.
         - Capture EVERY post where the 'Post title' contains any of the hashtags [${hashtagsList}] OR any mentions [${mentionsList}].
         - If a row seems relevant to the campaign context of "${context.campaignName}", include it. 
         - DO NOT skip posts. If you find 20 matching posts, return 20 matching posts.
         - Categorize by 'Content Type': "linkedinNewsletters" for 'Article' type, "linkedinStandardPosts" for others.
      
      3. TOP 4 POSTS SELECTION (BY IMPRESSIONS):
         - For X (Twitter): Select the TOP 4 posts strictly based on the highest total Impressions found in the data.
         - For LinkedIn: Select the TOP 4 posts strictly based on the highest total Impressions found in the data.
      
      4. IMPROVED RESOURCE ENRICHMENT:
         - For "Promoted Website Content" (Articles): Look at the Article URLs. Generate or extract high-quality, professional, and SEO-friendly Titles and detailed 2-sentence Descriptions that explain the technical IIoT topic discussed.
         - For "Video Interviews" (YouTube): Generate a formal title for each video, identifying the speaker (if possible) and the primary subject matter (e.g., "Deep Dive into Industrial Cybersecurity with [Name]").
      
      5. X METRICS: Extract Reach, Mentions, Engagement, and Engagement Rate from the CSV data.
      
      Return ONLY a JSON object:
      {
        "summaryOfActivities": "string",
        "activitiesList": [{ "id": "string", "text": "string", "icon": "string" }],
        "xMetrics": { "reach": "string", "mentions": "string", "engagement": "string", "rate": "string" },
        "linkedinMetrics": { 
          "impressions": "string", 
          "engagement": "string", 
          "views": "string", 
          "totalPosts": number, 
          "totalReactions": number, 
          "totalComments": number, 
          "totalClicks": number, 
          "totalReposts": number
        },
        "linkedinNewsletters": [{ "date": "string", "title": "string", "link": "string", "impressions": number, "clicks": number, "reactions": number, "comments": number, "reposts": number, "engagementRate": "string" }],
        "linkedinStandardPosts": [{ "date": "string", "title": "string", "link": "string", "impressions": number, "clicks": number, "reactions": number, "comments": number, "reposts": number, "engagementRate": "string" }],
        "topXPosts": [{ "title": "string", "author": "string", "reach": "string", "impressions": "string", "link": "string" }],
        "topLinkedinPosts": [{ "title": "string", "date": "string", "impressions": "string", "reactions": "string", "link": "string" }],
        "resourcesEnhancement": {
           "youtube": [{ "id": "string", "title": "string" }],
           "articles": [{ "id": "string", "title": "string", "caption": "string" }]
        }
      }
    `;

    const mediaParts = files
      .filter(f => !f.isText && (f.mimeType === 'application/pdf' || f.mimeType.startsWith('image/')))
      .map(f => ({
        inlineData: { data: f.data, mimeType: f.mimeType }
      }));

    const contents = {
      parts: [
        { text: prompt },
        ...mediaParts
      ]
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: { responseMimeType: "application/json" }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw error;
    }
  }
}
