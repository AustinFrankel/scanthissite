import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WebsiteData {
  url: string
  domain: string
  pageTitle: string | null
  metaDescription: string | null
  pageTextSample: string
  fetchedAt: string
}

export interface AIAnalysisResult {
  overallVerdict: 'safe' | 'caution' | 'risky' | 'unknown'
  notEnoughData: boolean
  scamRiskScore: number
  malwareRiskScore: number
  reviewTrustScore: number
  keyReasons: string[]
  contentNotes: string[]
  reviewAndReputationNotes: string[]
}

const SYSTEM_PROMPT = `You are a website safety analysis assistant for a consumer-facing web app called ScanThisSite.

The user is a non-technical person who wants to know if a website seems safe to use.

You will receive structured information about a single website (URL, domain, page title, meta description, and a sample of visible text).

Your job is to:
- Evaluate the website for scam risk.
- Evaluate the website for potential virus or malware risk based on visible behavior and content patterns (you CANNOT see actual files or code, so this is heuristic and content-based only).
- Evaluate how trustworthy the content appears.
- Give basic hints about whether reviews or claims on the site seem believable or suspicious.

Very important rules:
- If there is not enough information to decide, you MUST say so clearly using a notEnoughData flag.
- Do NOT invent data, do not assume the site is safe or unsafe without clear reasons.
- Be conservative: if something looks strongly like a scam (fake giveaways, unrealistic offers, requests for sensitive info without reason), mark scam risk as high.
- Focus on what an everyday person cares about: "Can I trust this site?", "Does it look like a scam?", "Does it seem risky for viruses/malware?", "Do the reviews or claims look real?".
- Base your answers only on the data you receive and general common-sense patterns. You CANNOT actually test downloads or run code.

Output MUST be valid JSON and must match the schema exactly.`

export async function analyzeWebsite(
  websiteData: WebsiteData
): Promise<AIAnalysisResult> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Here is the website data to analyze:\n\n${JSON.stringify(
          websiteData,
          null,
          2
        )}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'website_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            overallVerdict: {
              type: 'string',
              enum: ['safe', 'caution', 'risky', 'unknown'],
            },
            notEnoughData: {
              type: 'boolean',
            },
            scamRiskScore: {
              type: 'number',
              description: 'Integer 0-100',
            },
            malwareRiskScore: {
              type: 'number',
              description: 'Integer 0-100',
            },
            reviewTrustScore: {
              type: 'number',
              description: 'Integer 0-100',
            },
            keyReasons: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: '2-5 short bullet reasons',
            },
            contentNotes: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: '2-5 short notes about content quality',
            },
            reviewAndReputationNotes: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: '2-5 short notes about reviews/claims',
            },
          },
          required: [
            'overallVerdict',
            'notEnoughData',
            'scamRiskScore',
            'malwareRiskScore',
            'reviewTrustScore',
            'keyReasons',
            'contentNotes',
            'reviewAndReputationNotes',
          ],
          additionalProperties: false,
        },
      },
    },
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  return JSON.parse(content) as AIAnalysisResult
}

