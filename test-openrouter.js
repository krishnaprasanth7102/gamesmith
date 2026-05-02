import { config } from 'dotenv';
config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("OPENROUTER_KEY:", apiKey ? "YES" : "NO");

  const systemInstruction = `You are a Senior Unreal Engine Blueprint Architect.`; // simplified

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://gamesmith.com',
        'X-Title': 'GameSmith Blueprint Forge'
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: "generate a basic health system" }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("OpenRouter Error Body:", JSON.stringify(errBody, null, 2));
      console.log(`OpenRouter Failure: ${response.status}`);
      return;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    console.log("AI Raw Response:", text);
  } catch (e) {
    console.error("Exception:", e);
  }
}

test();
