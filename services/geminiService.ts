
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  async analyzeLinkedInData(files: { name: string; data: string; mimeType: string; isText?: boolean; section?: string }[], context: any) {
    const linkedinFiles = files.filter(f => f.section === 'linkedin' && f.isText);
    const linkedinMergedData = linkedinFiles
      .map(f => `SOURCE_FILE: ${f.name}\nCONTENT:\n${f.data}`)
      .join('\n\n---\n\n');

    const prompt = `
      You are a social media data analyst.

      Task: Analyze the attached LinkedIn CSV file(s). 
      
      CRITICAL NEW INSTRUCTION: The CSV file ALREADY contains specific pre-calculated metrics rows/columns. You do not need to sum them up manually for the summary.
      Look for these specific values in the file:
      - Total Posts
      - Total Impressions
      - Total Views (or Video Views)
      - Total Clicks
      - Total Likes (Reactions)
      - Avg. Engagement Rate

      Requirements:

      1. Executive Summary: Extract the EXACT values provided in the CSV for the metrics above.
         - Total Engagements: If not explicitly stated as a "Total" row, calculate it by summing (Reactions + Comments + Clicks + Reposts) from the rows, OR if there is a "Total Engagements" summary value, use that.
         - Comments & Reposts: Sum these from the individual post rows if a total is not provided in the summary section.

      2. Post Detail Table: Extract the list of posts.
         - Date
         - Content Snippet (Title): CRITICAL: Keep titles concise (max 10-12 words). Summarize if necessary.
         - Impressions
         - Engagements
         - Reactions
         - Comments
         - Clicks
         - Reposts
         - Views (Look for "Views", "Video Views", or similar columns. If N/A, use 0)
         - Post Link (URL)

      3. Newsletter & Articles Analysis: Identify posts that are categorized as "Article".

      4. Top 4 Posts: Identify and list the 4 top-performing posts based strictly on the highest number of Impressions.
         - CRITICAL: Keep titles concise (max 10-12 words).

      RETURN JSON ONLY:
      {
        "executiveSummary": {
          "totalImpressions": "string",
          "totalViews": "string",
          "totalEngagements": "string",
          "engagementRate": "string",
          "reactions": number,
          "comments": number,
          "clicks": number,
          "reposts": number,
          "totalPostCount": number
        },
        "postDetailTable": [{ 
          "date": "string", 
          "snippet": "string", 
          "impressions": number, 
          "engagements": number, 
          "reactions": number,
          "comments": number,
          "clicks": number,
          "reposts": number,
          "views": number,
          "link": "string" 
        }],
        "newsletterAnalysis": {
          "totalImpressions": number,
          "totalEngagements": number,
          "count": number,
          "articles": [{ "date": "string", "title": "string", "impressions": number, "engagements": number, "link": "string" }]
        },
        "top4Posts": [{ "title": "string", "date": "string", "impressions": "string", "reactions": "string", "link": "string" }]
      }
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: `DATASET:\n${linkedinMergedData}` },
          { text: prompt }
        ] 
      },
      config: { 
        responseMimeType: "application/json", 
        temperature: 0.1 
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async analyzeXData(files: { name: string; data: string; mimeType: string; isText?: boolean; section?: string }[], context: any) {
    const xCsvFiles = files.filter(f => f.section === 'x_csv' && f.isText);

    const xCsvData = xCsvFiles
      .map(f => `X_ANALYTICS_CSV: ${f.name}\nCONTENT:\n${f.data}`)
      .join('\n\n---\n\n');

    const prompt = `
      Analyze the provided X (Twitter) CSV file for "${context.clientName}".

      The CSV contains TWO parts:
      1. A summary section with pre-calculated metrics: Total Reach, Total Mentions, Total Impressions, Total Engagement, Engagement Rate.
      2. A list of posts.

      TASKS:
      1. X METRICS: Extract the following pre-calculated values from the summary section of the CSV:
         - Total Reach
         - Total Mentions
         - Total Impressions
         - Total Engagement
         - Engagement Rate

      2. TOP 4 POSTS: The CSV is already sorted or contains the relevant posts. Simply extract the FIRST 4 posts listed in the CSV as the "Top 4 Posts".
         For each, extract: Content/Title (Max 12 words), Reach, Impressions, Link.

      RETURN JSON ONLY:
      {
        "xMetrics": { 
          "reach": "string", 
          "mentions": "string", 
          "impressions": "string", 
          "engagement": "string", 
          "rate": "string" 
        },
        "topXPosts": [{ "title": "string", "author": "string", "reach": "string", "impressions": "string", "link": "string" }]
      }
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: `CSV DATA:\n${xCsvData}\n\nPROMPT:\n${prompt}` }] },
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    return JSON.parse(response.text || '{}');
  }

  async analyzeReportFiles(files: { name: string; data: string; mimeType: string; isText?: boolean; section?: string }[], context: any, resourceLinks: any) {
    const allTextData = files
      .filter(f => f.isText)
      .map(f => `FILE (${f.section}): ${f.name}\nCONTENT:\n${f.data}`)
      .join('\n\n---\n\n');

    const manualResourcesContext = `
      YouTube Links: ${JSON.stringify(resourceLinks.youtubeLinks)}
      Article Links: ${JSON.stringify(resourceLinks.articleLinks)}
    `;

    const prompt = `
      Generate a campaign summary and activity list for "${context.clientName}".
      
      DATA sources provided:
      ${allTextData}
      
      MANUAL LINKS: ${manualResourcesContext}

      TASK:
      1. Create a "summaryOfActivities" describing the campaign success based on the metrics found in the CSV data provided above.
      2. Create an "activitiesList" with IDs and icons (DOCS|SOCIAL|GROWTH|STAR).
      3. "resourcesEnhancement": Look at the provided MANAUL LINKS (YouTube/Articles). 
         For each ID provided, try to extract a better Title or Caption from the provided DATA files (if available).
         If the DATA files contain info about these links, map the ID to the extracted title.

      RETURN VALID JSON ONLY:
      {
        "summaryOfActivities": "string",
        "activitiesList": [{ "id": "string", "text": "string", "icon": "string" }],
        "resourcesEnhancement": {
          "youtube": [{ "id": "string", "title": "string" }],
          "articles": [{ "id": "string", "title": "string", "caption": "string" }]
        }
      }
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    return JSON.parse(response.text || '{}');
  }
}
