
export interface WikiData {
  summary: string;
  url: string;
  image?: string;
}

export const fetchWikiSummary = async (query: string): Promise<WikiData | null> => {
  try {
    // Wikipedia search to get the most relevant page
    const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
    const searchData = await searchRes.json();
    
    if (!searchData.query.search.length) return null;
    
    const title = searchData.query.search[0].title;
    
    // Get summary and image
    const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    const summaryData = await summaryRes.json();
    
    return {
      summary: summaryData.extract,
      url: summaryData.content_urls.desktop.page,
      image: summaryData.thumbnail?.original || summaryData.thumbnail?.source
    };
  } catch (error) {
    console.error("Wiki fetch failed:", error);
    return null;
  }
};
