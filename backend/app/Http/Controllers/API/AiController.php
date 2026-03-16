<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    /**
     * POST /api/v1/ai/parse-task
     * Parse natural language into structured task fields using Claude.
     */
    public function parseTask(Request $request): JsonResponse
    {
        $request->validate(['prompt' => 'required|string|max:1000']);

        $apiKey = env('ANTHROPIC_API_KEY');
        if (! $apiKey) {
            return response()->json(['message' => 'AI service not configured. Set ANTHROPIC_API_KEY in .env'], 503);
        }

        $today = now()->toDateString();

        $systemPrompt = <<<PROMPT
You are a task parser. Convert natural language task descriptions into structured JSON.
Return ONLY valid JSON with no markdown, no code blocks, no extra text.
Today's date is {$today}.
PROMPT;

        $userPrompt = <<<PROMPT
Parse this task description into structured fields:
"{$request->prompt}"

Return a JSON object with exactly these fields:
- title: string (concise action-oriented title, required)
- description: string or null (extra context if mentioned)
- priority: one of "low", "medium", "high", "urgent" (infer from urgency words)
- due_date: "YYYY-MM-DD" format or null (parse relative dates like "by Friday", "next week", "tomorrow")
- status: one of "backlog", "todo", "in_progress" (default "todo")
- estimated_minutes: integer or null (if time estimate mentioned, e.g. "2 hours" = 120)

Return only the JSON object.
PROMPT;

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type'      => 'application/json',
                ])
                ->post('https://api.anthropic.com/v1/messages', [
                    'model'      => 'claude-haiku-4-5-20251001',
                    'max_tokens' => 512,
                    'system'     => $systemPrompt,
                    'messages'   => [[
                        'role'    => 'user',
                        'content' => $userPrompt,
                    ]],
                ]);

            if (! $response->ok()) {
                return response()->json(['message' => 'AI service error. Try again.'], 502);
            }

            $text = $response->json('content.0.text', '');

            // Strip markdown code fences if any
            $text = preg_replace('/```(?:json)?\s*([\s\S]*?)\s*```/', '$1', trim($text));

            $parsed = json_decode(trim($text), true);

            if (! $parsed || ! isset($parsed['title'])) {
                return response()->json(['message' => 'Could not understand the task description. Please be more specific.'], 422);
            }

            // Sanitise / normalise
            $parsed['priority'] = in_array($parsed['priority'] ?? '', ['low','medium','high','urgent'])
                ? $parsed['priority'] : 'medium';
            $parsed['status'] = in_array($parsed['status'] ?? '', ['backlog','todo','in_progress'])
                ? $parsed['status'] : 'todo';

            return response()->json($parsed);
        } catch (\Exception $e) {
            return response()->json(['message' => 'AI request failed: ' . $e->getMessage()], 502);
        }
    }
}
