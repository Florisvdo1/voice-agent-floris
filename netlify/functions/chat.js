export async function handler(event){
  try {
    const { messages = [] } = JSON.parse(event.body || '{}');
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
    if (!OPENAI_API_KEY) return { statusCode: 500, body: 'Missing OPENAI_API_KEY' };

    const tools = [
      {
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search the web and return a brief answer with 3–5 citations.',
          parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
        }
      }
    ];

    const body = { model: MODEL, messages, tools, tool_choice: 'auto' };

    const r1 = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(body)
    });
    if (!r1.ok) return { statusCode: r1.status, body: await r1.text() };
    const j1 = await r1.json();
    const msg = j1.choices[0].message;

    // Helper to compute base URL (Netlify provides process.env.URL, else fall back to host header)
    const baseURL = process.env.URL || `https://${(event.headers['x-forwarded-host'] || event.headers.host)}`;

    if (msg.tool_calls && msg.tool_calls.length){
      const toolMessages = [];
      for (const call of msg.tool_calls){
        if (call.function?.name === 'web_search'){
          const args = JSON.parse(call.function.arguments || '{}');
          const s = await fetch(baseURL + '/api/search', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query: args.query }) });
          const data = await s.json();
          toolMessages.push({ role: 'tool', tool_call_id: call.id, name: 'web_search', content: JSON.stringify(data) });
        }
      }
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages: [...messages, msg, ...toolMessages] })
      });
      if (!r2.ok) return { statusCode: r2.status, body: await r2.text() };
      const j2 = await r2.json();
      return { statusCode: 200, body: JSON.stringify({ reply: j2.choices[0].message.content }) };
    }

    return { statusCode: 200, body: JSON.stringify({ reply: msg.content }) };
  } catch (e){
    return { statusCode: 500, body: String(e) };
  }
}