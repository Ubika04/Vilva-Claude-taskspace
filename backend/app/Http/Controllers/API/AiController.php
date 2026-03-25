<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiController extends Controller
{
    /**
     * POST /api/v1/ai/parse-task
     * Parse natural language into structured task fields.
     * Uses MCP/Claude CLI when available, falls back to built-in NLP parser.
     */
    public function parseTask(Request $request): JsonResponse
    {
        $request->validate(['prompt' => 'required|string|max:1000']);

        $prompt = $request->prompt;

        // Try MCP/Claude CLI first
        $mcpResult = $this->tryClaudeCli($this->buildParsePrompt($prompt));
        if ($mcpResult) {
            return response()->json($mcpResult);
        }

        // Try direct Anthropic API if key exists
        $apiKey = config('services.anthropic.key') ?: env('ANTHROPIC_API_KEY');
        if ($apiKey && ! Str::startsWith($apiKey, 'your-')) {
            $result = $this->callAnthropicApi($apiKey, $this->buildParsePrompt($prompt), 512);
            if ($result) return response()->json($result);
        }

        // Fallback: built-in smart parser (no API key needed)
        $parsed = $this->smartParse($prompt);

        return response()->json($parsed);
    }

    /**
     * POST /api/v1/projects/{project}/ai/generate-tasks
     * Generate tasks from description.
     */
    public function generateProjectTasks(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        if (! $project->ai_enabled) {
            return response()->json(['message' => 'AI is not enabled for this project.'], 403);
        }

        $request->validate(['description' => 'required|string|max:2000']);

        $description = $request->description;

        // Try MCP/Claude CLI first
        $prompt = $this->buildGeneratePrompt($description, $project);
        $mcpResult = $this->tryClaudeCli($prompt, true);
        if ($mcpResult) {
            return response()->json(['tasks' => $mcpResult]);
        }

        // Try direct API
        $apiKey = config('services.anthropic.key') ?: env('ANTHROPIC_API_KEY');
        if ($apiKey && ! Str::startsWith($apiKey, 'your-')) {
            $result = $this->callAnthropicApi($apiKey, $prompt, 2048, true);
            if ($result) return response()->json(['tasks' => $result]);
        }

        // Fallback: built-in task generator
        $tasks = $this->smartGenerate($description);

        return response()->json(['tasks' => $tasks]);
    }

    // ─── MCP / Claude CLI Bridge ─────────────────────────────────────────────

    /**
     * Try to call Claude via the `claude` CLI (Claude Code).
     * This works when Claude Code is installed — no API key needed.
     */
    private function tryClaudeCli(string $prompt, bool $isArray = false): mixed
    {
        // Check if claude CLI is available
        $which = trim(shell_exec(PHP_OS_FAMILY === 'Windows' ? 'where claude 2>nul' : 'which claude 2>/dev/null') ?? '');
        if (empty($which)) return null;

        try {
            $escaped = escapeshellarg($prompt);

            // Use claude --print for non-interactive single-shot
            $cmd = "claude --print {$escaped} 2>/dev/null";
            $output = shell_exec($cmd);

            if (empty($output)) return null;

            // Strip markdown code fences
            $output = preg_replace('/```(?:json)?\s*([\s\S]*?)\s*```/', '$1', trim($output));

            $parsed = json_decode(trim($output), true);

            if ($isArray && is_array($parsed) && ! empty($parsed)) {
                return $this->sanitizeTasks($parsed);
            }

            if (! $isArray && is_array($parsed) && isset($parsed['title'])) {
                return $this->sanitizeTask($parsed);
            }
        } catch (\Throwable $e) {
            // Silently fall through to next method
        }

        return null;
    }

    // ─── Direct Anthropic API (optional) ─────────────────────────────────────

    private function callAnthropicApi(string $apiKey, string $prompt, int $maxTokens, bool $isArray = false): mixed
    {
        try {
            $response = Http::withoutVerifying()->timeout(25)
                ->withHeaders([
                    'x-api-key'         => $apiKey,
                    'anthropic-version'  => '2023-06-01',
                    'content-type'       => 'application/json',
                ])
                ->post('https://api.anthropic.com/v1/messages', [
                    'model'      => 'claude-haiku-4-5-20251001',
                    'max_tokens' => $maxTokens,
                    'messages'   => [['role' => 'user', 'content' => $prompt]],
                ]);

            if (! $response->ok()) return null;

            $text = $response->json('content.0.text', '');
            $text = preg_replace('/```(?:json)?\s*([\s\S]*?)\s*```/', '$1', trim($text));
            $parsed = json_decode(trim($text), true);

            if ($isArray && is_array($parsed)) return $this->sanitizeTasks($parsed);
            if (! $isArray && isset($parsed['title'])) return $this->sanitizeTask($parsed);
        } catch (\Throwable $e) {
            // Fall through
        }

        return null;
    }

    // ─── Built-in Smart Parser (No API Key Needed) ───────────────────────────

    /**
     * Parse natural language task description using pattern matching.
     * Works entirely offline — no API key required.
     */
    private function smartParse(string $input): array
    {
        $text = trim($input);
        $lower = Str::lower($text);

        // ── Extract priority ─────────────────────────────────────────────
        $priority = 'medium';
        $urgentPatterns  = ['urgent', 'asap', 'critical', 'emergency', 'immediately', 'right now', 'p0', 'blocker'];
        $highPatterns    = ['high priority', 'important', 'high', 'p1', 'serious'];
        $lowPatterns     = ['low priority', 'low', 'nice to have', 'when possible', 'p3', 'minor'];

        foreach ($urgentPatterns as $p) { if (str_contains($lower, $p)) { $priority = 'urgent'; break; } }
        if ($priority === 'medium') {
            foreach ($highPatterns as $p) { if (str_contains($lower, $p)) { $priority = 'high'; break; } }
        }
        if ($priority === 'medium') {
            foreach ($lowPatterns as $p) { if (str_contains($lower, $p)) { $priority = 'low'; break; } }
        }

        // ── Extract due date ─────────────────────────────────────────────
        $dueDate = null;
        $today = Carbon::today();

        $datePatterns = [
            '/\bby\s+tomorrow\b/i'      => $today->copy()->addDay(),
            '/\btomorrow\b/i'           => $today->copy()->addDay(),
            '/\btoday\b/i'              => $today->copy(),
            '/\bby\s+tonight\b/i'       => $today->copy(),
            '/\bnext\s+week\b/i'        => $today->copy()->addWeek()->startOfWeek(),
            '/\bnext\s+month\b/i'       => $today->copy()->addMonth()->startOfMonth(),
            '/\bend\s+of\s+week\b/i'    => $today->copy()->endOfWeek(),
            '/\bend\s+of\s+month\b/i'   => $today->copy()->endOfMonth(),
            '/\bin\s+(\d+)\s+days?\b/i'  => null, // handled below
            '/\bin\s+(\d+)\s+hours?\b/i' => null,
            '/\bby\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i' => null,
        ];

        foreach ($datePatterns as $pattern => $date) {
            if (preg_match($pattern, $lower, $m)) {
                if ($date) {
                    $dueDate = $date->toDateString();
                } elseif (str_contains($pattern, 'days')) {
                    $dueDate = $today->copy()->addDays((int) $m[1])->toDateString();
                } elseif (str_contains($pattern, 'hours')) {
                    $dueDate = $today->toDateString();
                } elseif (str_contains($pattern, 'monday|')) {
                    $day = Str::ucfirst($m[1]);
                    $dueDate = Carbon::parse("next {$day}")->toDateString();
                }
                break;
            }
        }

        // Try YYYY-MM-DD or MM/DD patterns
        if (! $dueDate && preg_match('/\b(\d{4}-\d{2}-\d{2})\b/', $text, $m)) {
            $dueDate = $m[1];
        }
        if (! $dueDate && preg_match('/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/', $text, $m)) {
            $year = isset($m[3]) ? (strlen($m[3]) === 2 ? '20' . $m[3] : $m[3]) : $today->year;
            $dueDate = sprintf('%s-%02d-%02d', $year, $m[1], $m[2]);
        }

        // ── Extract time estimate ────────────────────────────────────────
        $estimatedMinutes = null;
        if (preg_match('/(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?\b/i', $lower, $m)) {
            $estimatedMinutes = (int) round(floatval($m[1]) * 60);
        } elseif (preg_match('/(\d+)\s*min(?:utes?)?\b/i', $lower, $m)) {
            $estimatedMinutes = (int) $m[1];
        }

        // ── Extract task type ────────────────────────────────────────────
        $taskType = 'task';
        $typeMap = [
            'bug'         => ['bug', 'fix', 'issue', 'defect', 'broken', 'error', 'crash'],
            'feature'     => ['feature', 'new feature', 'add', 'implement', 'build', 'create'],
            'improvement' => ['improve', 'enhance', 'refactor', 'optimize', 'update', 'upgrade'],
            'story'       => ['user story', 'story', 'as a user'],
            'spike'       => ['spike', 'research', 'investigate', 'explore', 'poc', 'prototype'],
            'chore'       => ['chore', 'cleanup', 'maintenance', 'housekeeping', 'setup'],
        ];

        foreach ($typeMap as $type => $keywords) {
            foreach ($keywords as $kw) {
                if (str_contains($lower, $kw)) {
                    $taskType = $type;
                    break 2;
                }
            }
        }

        // ── Extract title ────────────────────────────────────────────────
        // Remove matched patterns from text to get clean title
        $title = $text;
        // Remove time references
        $title = preg_replace('/\b(by\s+)?(tomorrow|today|tonight|next\s+\w+|end\s+of\s+\w+|in\s+\d+\s+\w+|by\s+\w+day)\b/i', '', $title);
        // Remove time estimates
        $title = preg_replace('/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|min)\b/i', '', $title);
        // Remove priority markers
        $title = preg_replace('/\b(urgent|asap|critical|high\s+priority|low\s+priority|p[0-3])\b/i', '', $title);
        // Remove common filler
        $title = preg_replace('/\b(please|i need to|we need to|should|must|estimated?|about)\b/i', '', $title);
        // Clean up
        $title = preg_replace('/[,\s]+/', ' ', trim($title));
        $title = preg_replace('/^[\s,\-–—]+|[\s,\-–—]+$/', '', $title);

        if (empty($title)) {
            $title = Str::limit($text, 80);
        }

        // Capitalize first letter
        $title = Str::ucfirst(trim($title));

        return [
            'title'             => $title,
            'description'       => null,
            'priority'          => $priority,
            'due_date'          => $dueDate,
            'status'            => 'todo',
            'task_type'         => $taskType,
            'estimated_minutes' => $estimatedMinutes,
            'source'            => 'smart_parser',
        ];
    }

    /**
     * Generate tasks from a description using built-in logic.
     * Splits sentences/bullet points into individual tasks.
     */
    private function smartGenerate(string $description): array
    {
        $tasks = [];

        // Split by newlines, bullet points, numbered lists, or semicolons
        $lines = preg_split('/[\n\r]+|(?:\d+[\.\)]\s+)|(?:[-•*]\s+)|;\s*/', $description);
        $lines = array_values(array_filter(array_map('trim', $lines)));

        if (count($lines) <= 1) {
            // Single line — break by commas or "and"
            $lines = preg_split('/,\s*|\s+and\s+/', $description);
            $lines = array_values(array_filter(array_map('trim', $lines)));
        }

        foreach ($lines as $i => $line) {
            if (strlen($line) < 3) continue;

            $parsed = $this->smartParse($line);
            $parsed['status'] = 'todo';
            unset($parsed['source']);

            $tasks[] = $parsed;

            if (count($tasks) >= 15) break;
        }

        // If still empty, make one task from the whole description
        if (empty($tasks)) {
            $parsed = $this->smartParse($description);
            $parsed['status'] = 'todo';
            unset($parsed['source']);
            $tasks[] = $parsed;
        }

        return $tasks;
    }

    // ─── Prompt Builders ─────────────────────────────────────────────────────

    private function buildParsePrompt(string $input): string
    {
        $today = now()->toDateString();
        return <<<PROMPT
Parse this task description into JSON. Today is {$today}.
Return ONLY a JSON object with: title (string), description (string|null), priority (low/medium/high/urgent), due_date (YYYY-MM-DD|null), status (backlog/todo/in_progress), task_type (task/feature/bug/improvement/story/spike/chore), estimated_minutes (int|null).

Input: "{$input}"
PROMPT;
    }

    private function buildGeneratePrompt(string $description, Project $project): string
    {
        $today = now()->toDateString();
        $ctx = $project->ai_context ? " Context: {$project->ai_context}" : '';
        return <<<PROMPT
Break this work into 3-10 specific tasks for project "{$project->name}".{$ctx}
Today is {$today}. Return ONLY a JSON array.
Each object: title, description, priority (low/medium/high/urgent), status (backlog/todo), task_type (task/feature/bug/improvement/story/spike/chore), estimated_minutes, due_date.

Input: "{$description}"
PROMPT;
    }

    // ─── Sanitisers ──────────────────────────────────────────────────────────

    private function sanitizeTask(array $t): array
    {
        $t['priority']  = in_array($t['priority'] ?? '', ['low','medium','high','urgent']) ? $t['priority'] : 'medium';
        $t['status']    = in_array($t['status'] ?? '', ['backlog','todo','in_progress']) ? $t['status'] : 'todo';
        $t['task_type'] = in_array($t['task_type'] ?? '', ['task','feature','bug','improvement','story','spike','chore']) ? $t['task_type'] : 'task';
        $t['title']     = substr($t['title'] ?? 'Untitled', 0, 100);
        return $t;
    }

    private function sanitizeTasks(array $tasks): array
    {
        return array_map(fn($t) => $this->sanitizeTask($t), array_slice($tasks, 0, 15));
    }
}
