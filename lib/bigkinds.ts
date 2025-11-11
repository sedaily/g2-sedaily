interface BigKindsSearchParams {
  query?: string;
  from?: string; // YYYY-MM-DD
  until?: string; // YYYY-MM-DD
  category?: string[];
  provider?: string[];
  returnSize?: number;
}

interface BigKindsDocument {
  news_id: string;
  title: string;
  content: string;
  published_at: string;
  provider: string;
  category: string[];
  hilight?: string;
}

interface BigKindsResponse {
  result: number;
  return_object: {
    total_hits: number;
    documents: BigKindsDocument[];
  };
}

export async function searchNews(params: BigKindsSearchParams): Promise<BigKindsDocument[]> {
  const accessKey = process.env.BIGKINDS_API_KEY;
  
  if (!accessKey) {
    throw new Error('BIGKINDS_API_KEY is not configured');
  }

  const requestBody = {
    access_key: accessKey,
    argument: {
      query: params.query || "",
      published_at: {
        from: params.from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        until: params.until || new Date().toISOString().split('T')[0]
      },
      category: params.category || ["경제"],
      provider: params.provider || [],
      sort: { date: "desc" },
      hilight: 200,
      return_from: 0,
      return_size: params.returnSize || 5,
      fields: ["title", "content", "published_at", "provider", "category", "hilight"]
    }
  };

  try {
    const response = await fetch('https://tools.kinds.or.kr/search/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`BigKinds API error: ${response.status}`);
    }

    const data: BigKindsResponse = await response.json();
    
    if (data.result !== 0) {
      throw new Error('BigKinds API returned error result');
    }

    return data.return_object.documents;
  } catch (error) {
    console.error('BigKinds API error:', error);
    throw error;
  }
}