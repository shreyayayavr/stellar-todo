/* Serverless API (Vercel / Netlify functions compatible)
   POST { prompt: string, tasks: array } -> proxies to OpenAI Chat Completions.
   Requires environment variable: OPENAI_API_KEY
*/
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send({error: 'Method not allowed'});
    return;
  }
  const { prompt } = req.body || {};
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY not configured in environment' });
    return;
  }
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that transforms user prompts into task checklists or short actionable subtasks.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });
    const json = await r.json();
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
