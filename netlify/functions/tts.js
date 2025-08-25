export async function handler(event){
  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text) return { statusCode: 400, body: 'Missing text' };

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
    if (!ELEVENLABS_API_KEY || !VOICE_ID) return { statusCode: 500, body: 'Missing ElevenLabs credentials' };

    const payload = {
      text,
      model_id: 'eleven_turbo_v2',
      voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true }
    };

    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?optimize_streaming_latency=0`, {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) return { statusCode: resp.status, body: await resp.text() };
    const arrayBuf = await resp.arrayBuffer();
    return { statusCode: 200, headers: { 'Content-Type': 'audio/mpeg' }, body: Buffer.from(arrayBuf).toString('base64'), isBase64Encoded: true };
  } catch (e){
    return { statusCode: 500, body: String(e) };
  }
}