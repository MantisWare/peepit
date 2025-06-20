# Tool Schema Debugging: The Epic Quest for Compatibility

Ever tried to get a complex tool schema to play nice with a client UI and a model, only to be met with cryptic errors and stubborn parameters? Welcome to the saga of PeepIt's `image` tool schema—a tale of Zod, JSON, and the relentless pursuit of compatibility.

## 1. The Mysterious Case of the Disappearing Parameters

It all started when the `image` tool's parameters refused to show up in the client. "Incompatible schema," said the model. Meanwhile, `analyze` and `list` (the easy kids) worked just fine. Clearly, the `image` tool's Zod schema was a little too spicy.

## 2. The ZodToJsonSchema Makeover

First, we gave `zodToJsonSchema` a glow-up:
- **Unwrapping the Mystery:** Added a recursive helper to peel off `.optional()` and `.default()` wrappers and get to the real type (and its description).
- **Description Detective:** Made sure every `.describe()` call was captured, even deep inside optionals and defaults.
- **Type Tamer:** Explicitly handled every Zod type—strings, enums, unions, objects, arrays, you name it.

This overhaul made `analyze` and `list` happy, and set the stage for the main event: the `image` tool.

## 3. The `imageToolSchema` Gauntlet

Debugging the `imageToolSchema` was like defusing a bomb:
1. **Start Simple:** Reduce the schema to a single optional string. If that works, add fields back one at a time.
2. **Field by Field:** Each new field (app, question, return_data, format, etc.) was tested in isolation. All good so far.
3. **The Trouble with Unions:** The real trouble started with complex fields like `window_specifier` (a union of objects) and especially `provider_config` (a custom union type). Sometimes the UI would show the parameters, sometimes not. The model was clearly picky.

## 4. The UI Space-Time Continuum

Turns out, the client UI (Cursor) has limited real estate. If your main tool description is too long, it hogs the space and hides the parameters. Solution? Keep main descriptions short and let the schema do the talking.

## 5. The `provider_config` Plot Twist

The biggest villain was `provider_config`. Defined as a custom union, it tripped up the model's schema validation. The fix? Ditch the custom type and use a plain old `z.object()` with explicit fields. Suddenly, everything worked—no more "incompatible schema" errors, and the UI showed all the parameters.

## 6. Back to Business: Restoring the Handler

With the schema sorted, it was time to bring back the real handler logic. Tests passed, the world rejoiced.

## 7. The Art of Conciseness

A final lesson: keep main tool descriptions moderately detailed, but not epic novels. Let the schema provide the nitty-gritty. Cursor's UI will thank you.

## Key Takeaways from the Adventure
- **Favor Simplicity:** The Gemini model likes schemas that are explicit and direct. Avoid custom unions if you want smooth sailing.
- **Robust Schema Conversion:** Your `zodToJsonSchema` must handle every Zod quirk and extract all the juicy `.describe()` metadata.
- **UI ≠ Model:** Just because the UI shows your parameters doesn't mean the model will accept them (and vice versa).
- **Concise Descriptions Win:** Don't let a verbose description crowd out your schema details in the UI.
- **Iterate Like a Pro:** When in doubt, simplify, then add complexity back one piece at a time.

By following these lessons, PeepIt's tools are now schema-compatible, model-approved, and UI-friendly. Debugging never looked so good. 