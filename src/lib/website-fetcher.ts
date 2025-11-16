import * as cheerio from 'cheerio'

export interface FetchedWebsite {
  url: string
  normalizedUrl: string
  domain: string
  pageTitle: string | null
  metaDescription: string | null
  pageTextSample: string
  html: string
}

export function normalizeUrl(url: string): string {
  let normalized = url.trim()

  // Add protocol if missing
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized
  }

  try {
    const urlObj = new URL(normalized)
    return urlObj.href
  } catch {
    throw new Error('Invalid URL format')
  }
}

export async function fetchWebsite(url: string): Promise<FetchedWebsite> {
  const normalizedUrl = normalizeUrl(url)
  const urlObj = new URL(normalizedUrl)
  const domain = urlObj.hostname

  try {
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove script and style tags
    $('script, style, noscript').remove()

    // Extract title
    const pageTitle = $('title').text().trim() || null

    // Extract meta description
    const metaDescription =
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      null

    // Extract visible text
    const bodyText = $('body').text()
    // Clean up whitespace and limit length
    const cleanText = bodyText
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000)

    return {
      url: normalizedUrl,
      normalizedUrl,
      domain,
      pageTitle,
      metaDescription,
      pageTextSample: cleanText,
      html,
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw new Error(`Failed to fetch website: ${error.message}`)
  }
}

