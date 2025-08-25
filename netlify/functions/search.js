export async function handler(event){
  try {
    const key = process.env.TAVILY_API_KEY;
    const { query } = JSON.parse(event.body || '{}');
    if (!query) return { statusCode: 400, body: 'Missing query' };
    if (!key) return { statusCode: 200, body: JSON.stringify({ summary: '', citations: [], note: 'Browsing disabled (no TAVILY_API_KEY set).' }) };

    const payload = { query, max_results: 5, include_answer: true, include_raw_content: false, search_depth: 'advanced', include_images: false, auto_parameters: true };
    const resp = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tavily-API-Key': key },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) return { statusCode: resp.status, body: await resp.text() };
    const data = await resp.json();
    const summary = data.answer || '';
    const cites = (data.results || []).slice(0,5).map(r => ({ title: r.title, url: r.url }));
    return { statusCode: 200, body: JSON.stringify({ summary, citations: cites }) };
  } catch (e){
    return { statusCode: 500, body: String(e) };
  }
}