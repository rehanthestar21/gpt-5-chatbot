// server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

// Pull in env-vars (dotenv/config already loaded .env)
const {
  OPENAI_API_KEY,
  OPENAI_MODEL = 'gpt-5',
  PORT = 3001
} = process.env;

if (!OPENAI_API_KEY) {
  console.warn('⚠️  Missing OPENAI_API_KEY in your environment!');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Instantiate the OpenAI client
const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// POST /api/chat
// Expects body: { system?: string, messages: [{ role: 'user'|'assistant', content: string }] }
app.post('/api/chat', async (req, res) => {
  try {
    const {
      system   = 'You are a helpful, concise AI assistant.',
      messages = []
    } = req.body;

    // Build the “instructions” (system) and the flattened input string
    const instructions = system.trim();
    const input = messages
      .map(m => `${(m.role || 'user').toUpperCase()}: ${m.content.trim()}`)
      .join('\n');

    // Call the new Responses API
    const response = await client.responses.create({
      model:        OPENAI_MODEL,
      instructions,
      input
    });

    // Return the assistant’s reply
    res.json({ text: response.output_text });
  } catch (err) {
    console.error('❌ OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
});

// Simple health check
app.get('/health', (_, res) => res.json({ ok: true }));

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🤖 Using OpenAI model: ${OPENAI_MODEL}`);
});
