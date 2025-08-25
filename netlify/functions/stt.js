export async function handler(event){
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1';
    if (!OPENAI_API_KEY) return { statusCode: 500, body: 'Missing OPENAI_API_KEY' };

    const { audio, mime } = JSON.parse(event.body || '{}');
    if (!audio) return { statusCode: 400, body: 'Missing audio base64' };

    // Convert base64 to Blob
    const bin = Buffer.from(audio, 'base64');
    const file = new Blob([bin], { type: mime || 'audio/webm' });

    const form = new FormData();
    form.append('file', file, 'speech.webm');
    form.append('model', TRANSCRIBE_MODEL);

    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form
    });

    if (!resp.ok) return { statusCode: resp.status, body: await resp.text() };
    const data = await resp.json();
    return { statusCode: 200, body: JSON.stringify({ text: data.text }) };
  } catch (e){
    return { statusCode: 500, body: String(e) };
  }
}