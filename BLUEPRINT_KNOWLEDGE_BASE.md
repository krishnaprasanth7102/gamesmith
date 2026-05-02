# GameSmith Blueprint Architect Knowledge Base

This document serves as the ground truth for the GameSmith Blueprint Generator's AI logic, node structures, and architectural principles.

## 1. System Overview
The Blueprint Generator uses Google's Gemini 1.5 Pro/Flash to synthesize visual logic graphs for game mechanics. It translates natural language prompts into a structured JSON format that the `BlueprintPlayground` component can render and simulate.

## 2. Node Catalog (The "Lexicon")
The AI is restricted to these specific node types. Each has fixed input/output ports.

### Events (Entry Points)
- **START**: Fires once at Begin Play. Use for initialization.
- **EVENT_TICK**: Fires every frame. Use for constant polling (e.g., checking health).

### Flow Control (Routing)
- **BRANCH**: The "If Statement". 
  - Inputs: `exec_in`, `condition` (bool).
  - Outputs: `true` (exec), `false` (exec).
- **SEQUENCE**: Fires multiple pins in order.
  - Inputs: `exec_in`.
  - Outputs: `then_0`, `then_1`.
- **DELAY**: Pauses execution.
  - Inputs: `exec_in`, `duration` (float).
  - Outputs: `completed` (exec).

### Boss Actions (Side Effects)
- **INCREASE_DIFF**: Makes the boss faster/stronger.
- **DECREASE_DIFF**: Makes the boss easier.
- **PRINT_STRING**: Debug log output.

### Variables & Math
- **GET_HEALTH**: Returns current player health (0-100).
- **SET_VARIABLE**: Logic placeholder for state management.
- **COMPARE_FLOAT**: Math gate.
  - Inputs: `a`, `b`.
  - Outputs: `>`, `==`, `<`.

## 3. Connection Logic
- **Exec-to-Exec**: Connections must flow from an output `exec` port to an input `exec_in` port.
- **Data-to-Data**: Outputs like `health` (float) must connect to inputs like `a` or `b` (float).
- **No Loops**: Direct recursive connections are discouraged to prevent simulation crashes.

## 4. Prompting Strategy
To ensure the AI generates high-quality blueprints, the system prompt enforces:
1. **Spatial Flow**: Nodes should be placed with increasing X coordinates (left-to-right flow).
2. **Contextual Explanations**: Every node must have an explanation of *why* it exists in that specific logic chain.
3. **Tutorialization**: The AI must provide a step-by-step guide for a human to recreate the logic in Unreal Engine.

## 5. UE-to-Web Mapping
The internal simulation in `BlueprintPlayground` maps these nodes to mock Unreal behavior:
- `INCREASE_DIFF` increments a `difficulty` state.
- `BRANCH` evaluates health thresholds.
- `delay` is simulated with `setTimeout`.

---
*End of Knowledge Base*
