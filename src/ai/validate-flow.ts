"use server";

export async function validateBlueprintFlow(userPrompt: string, blueprintData: any) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Validation requires OpenRouter API Key.");
  }

  const systemInstruction = `You are an expert Unreal Engine Blueprint reviewer and validator.
Your job is to analyze a Blueprint system and determine if it correctly implements the requested functionality.

User Goal:
\${userPrompt}

Blueprint Data:
\${JSON.stringify(blueprintData, null, 2)}

Instructions:
1. Carefully analyze the Blueprint nodes and connections.
2. Check if the logic matches the user goal.
3. Identify: missing nodes, incorrect connections, wrong logic flow, inefficient or incorrect design.

Output MUST include:
1. verdict: "Correct" or "Incorrect"
2. reason: Clear explanation
3. issues: List of specific problems
4. fix_suggestions: Exact nodes or changes needed
5. correct_blueprint: Provide corrected version in structured format if incorrect

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "verdict": "Correct / Incorrect",
  "reason": "",
  "issues": [""],
  "fix_suggestions": [""],
  "correct_blueprint": {
    "nodes": [],
    "connections": []
  }
}

Rules:
- Be strict and accurate
- Use real Unreal Blueprint logic
- Prefer AI Move To for movement systems instead of teleport (SetActorLocation)
- Output strict JSON only.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://gamesmith.com',
        'X-Title': 'GameSmith Blueprint Validator'
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: "Analyze the provided blueprint and return the strict JSON verdict." }
        ]
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter Validation Failure: ${response.status}`);
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("AI returned empty validation content.");
    
    text = text.trim();
    if (text.startsWith("```")) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) text = match[1];
    }
    
    return JSON.parse(text);
  } catch (e: any) {
    console.error("VALIDATION_FAILED:", e);
    throw new Error(`Validation failed: ${e.message}`);
  }
}
