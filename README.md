# Floris Voice Agent — Netlify Full‑Stack (Speech↔Speech, Web Search)

Production‑ready voice assistant: speech → OpenAI STT → LLM (function‑calling) → ElevenLabs TTS, with optional Tavily web search.
All sensitive keys are kept in **server‑side environment variables**.

## One‑click Deploy (Netlify)
1. Create a new GitHub repo and push this folder.
2. Netlify → Add new site → Import from Git → choose the repo.
3. Netlify → Site settings → Environment variables (add and save):
   - `OPENAI_API_KEY=...`
   - `OPENAI_MODEL=gpt-4o` (optional; default used if absent)
   - `OPENAI_TRANSCRIBE_MODEL=whisper-1` (optional; defaults to whisper-1)
   - `ELEVENLABS_API_KEY=...`
   - `ELEVENLABS_VOICE_ID=...` (your voice clone ID)
   - `TAVILY_API_KEY=...` (optional; enables browsing)
4. Deploy. Visit the URL and hold “🎙️ Hold to Talk”.

> GitHub Pages is **static only** and cannot host serverless functions required for secure API usage. For full functionality (STT/LLM/TTS/Search), use Netlify (or Vercel).

## Endpoints
- `/api/stt`  → Accepts `{ audio: base64, mime }` JSON. Returns `{ text }`.
- `/api/chat` → Accepts `{ messages }` (OpenAI chat format). Tool‑calls `/api/search` when needed.
- `/api/tts`  → Accepts `{ text }`. Returns MPEG audio.
- `/api/search` → Accepts `{ query }`. Returns `{ summary, citations }`.

## Security
- Never expose API keys in client code.
- All requests to providers are made server‑side via Netlify Functions.