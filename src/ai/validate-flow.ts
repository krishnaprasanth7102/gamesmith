"use client";

// Blueprint Validator — uses Puter.js anonymous mode, no login or API key needed
export async function validateBlueprintFlow(userPrompt: string, blueprintData: any) {
  const prompt = `Act as an expert Unreal Engine 5 Blueprint reviewer and validator.

User Goal: "${userPrompt}"

Blueprint Data:
${JSON.stringify(blueprintData, null, 2)}

Instructions:
1. Carefully analyze the Blueprint nodes and connections.
2. Check if the logic correctly matches the user goal.
3. Identify: missing nodes, incorrect connections, wrong logic flow, inefficient design.
4. Prefer AI Move To for movement. Prefer Add Movement Input for player characters.

Return ONLY raw JSON (no markdown fences, no explanation outside JSON):
{
  "verdict": "Correct or Incorrect",
  "reason": "Clear explanation of the verdict",
  "issues": ["Specific problem 1", "Specific problem 2"],
  "fix_suggestions": ["Exact change needed 1", "Exact change needed 2"],
  "correct_blueprint": {
    "nodes": [{ "id": "n1", "type": "NODE_TYPE", "x": 100, "y": 150 }],
    "connections": [{ "fromNode": "n1", "fromPort": "PORT_ID", "toNode": "n2", "toPort": "PORT_ID" }]
  }
}`;

  try {
    // Anonymous mode — no account or login popup required
    const response = await (window as any).puter.ai.chat(prompt, {
      model: 'qwen/qwen3-235b-a22b',
      temperature: 0.1,
    });

    const rawText: string = typeof response === "string"
      ? response
      : response?.message?.content ?? String(response ?? "");

    // Safe JSON extraction — handles accidental markdown
    const cleanJSON = rawText
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    return JSON.parse(cleanJSON);
  } catch (e: any) {
    console.error("VALIDATION_FAILED:", e);
    throw new Error(`Validation failed: ${e.message}`);
  }
}
