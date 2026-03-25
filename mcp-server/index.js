#!/usr/bin/env node

/**
 * Vilva Taskspace — MCP Server
 * ────────────────────────────────────────────────────────────────
 * Connects Claude Desktop / Claude Code to the Vilva Taskspace API
 * via the Model Context Protocol (MCP).
 *
 * Environment variables:
 *   VILVA_API_URL   — e.g. http://localhost:8000/api/v1
 *   VILVA_API_TOKEN — Bearer token for authentication
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_URL = process.env.VILVA_API_URL || 'http://localhost:8000/api/v1';
const API_TOKEN = process.env.VILVA_API_TOKEN || '';

// ── HTTP helper ──────────────────────────────────────────────────────────────

async function apiRequest(method, endpoint, body = null) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`,
  };

  const opts = { method, headers };
  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }

  const finalUrl = body && method === 'GET'
    ? `${url}?${new URLSearchParams(body)}`
    : url;

  const res = await fetch(finalUrl, method === 'GET' ? { headers } : opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`API ${res.status}: ${err.message || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── MCP Server setup ─────────────────────────────────────────────────────────

const server = new Server(
  { name: 'vilva-taskspace', version: '1.0.0' },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// ── Tools (Actions) ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'list_projects',
    description: 'List all projects with status, progress, and member count',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'archived', 'completed', 'on_hold'] },
      },
    },
  },
  {
    name: 'get_project_kanban',
    description: 'Get the Kanban board state for a project (tasks grouped by status)',
    inputSchema: {
      type: 'object',
      properties: { project_id: { type: 'number' } },
      required: ['project_id'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List tasks with filters (project, status, priority, assignee)',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number' },
        status: { type: 'string' },
        priority: { type: 'string' },
        assignee: { type: 'number' },
        search: { type: 'string' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_task',
    description: 'Get full task details including comments, dependencies, and time logs',
    inputSchema: {
      type: 'object',
      properties: { task_id: { type: 'number' } },
      required: ['task_id'],
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task in a project. task_type is required.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        task_type: { type: 'string', enum: ['task', 'feature', 'bug', 'improvement', 'story', 'spike', 'chore'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        status: { type: 'string' },
        due_date: { type: 'string', description: 'YYYY-MM-DD' },
        estimated_minutes: { type: 'number' },
        score: { type: 'number', description: 'Fibonacci: 1,2,3,5,8,13,21' },
        assignee_ids: { type: 'array', items: { type: 'number' } },
      },
      required: ['project_id', 'title', 'task_type'],
    },
  },
  {
    name: 'update_task',
    description: 'Update task fields (status, priority, assignees, score, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number' },
        title: { type: 'string' },
        status: { type: 'string' },
        priority: { type: 'string' },
        score: { type: 'number' },
        due_date: { type: 'string' },
        is_reviewed: { type: 'boolean' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'move_task',
    description: 'Move task to a different status column (Kanban)',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number' },
        status: { type: 'string', enum: ['backlog', 'todo', 'in_progress', 'working_on', 'review', 'blocked', 'completed'] },
        position: { type: 'number' },
      },
      required: ['task_id', 'status'],
    },
  },
  {
    name: 'start_timer',
    description: 'Start time tracking timer on a task',
    inputSchema: {
      type: 'object',
      properties: { task_id: { type: 'number' } },
      required: ['task_id'],
    },
  },
  {
    name: 'stop_timer',
    description: 'Stop the active timer on a task',
    inputSchema: {
      type: 'object',
      properties: { task_id: { type: 'number' } },
      required: ['task_id'],
    },
  },
  {
    name: 'add_dependency',
    description: 'Add a dependency between two tasks (task depends on depends_on)',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number' },
        depends_on_id: { type: 'number' },
        type: { type: 'string', enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'] },
      },
      required: ['task_id', 'depends_on_id'],
    },
  },
  {
    name: 'search',
    description: 'Global search across tasks and projects',
    inputSchema: {
      type: 'object',
      properties: { q: { type: 'string' } },
      required: ['q'],
    },
  },
  {
    name: 'get_reports',
    description: 'Get productivity or time tracking reports',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['user-productivity', 'time-tracking', 'velocity'] },
        from: { type: 'string', description: 'YYYY-MM-DD' },
        to: { type: 'string', description: 'YYYY-MM-DD' },
        project_id: { type: 'number' },
      },
      required: ['type', 'from', 'to'],
    },
  },
  {
    name: 'get_timebox_schedule',
    description: 'Get timeboxed tasks and preset blocks for a given date',
    inputSchema: {
      type: 'object',
      properties: { date: { type: 'string', description: 'YYYY-MM-DD' } },
      required: ['date'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case 'list_projects':
        result = await apiRequest('GET', '/projects', args?.status ? { status: args.status } : null);
        break;
      case 'get_project_kanban':
        result = await apiRequest('GET', `/projects/${args.project_id}/kanban`);
        break;
      case 'list_tasks':
        result = await apiRequest('GET', `/projects/${args.project_id}/tasks`, args);
        break;
      case 'get_task':
        result = await apiRequest('GET', `/tasks/${args.task_id}`);
        break;
      case 'create_task': {
        const { project_id, ...taskData } = args;
        result = await apiRequest('POST', `/projects/${project_id}/tasks`, taskData);
        break;
      }
      case 'update_task': {
        const { task_id, ...updateData } = args;
        result = await apiRequest('PATCH', `/tasks/${task_id}`, updateData);
        break;
      }
      case 'move_task':
        result = await apiRequest('POST', `/tasks/${args.task_id}/move`, {
          status: args.status,
          position: args.position,
        });
        break;
      case 'start_timer':
        result = await apiRequest('POST', `/tasks/${args.task_id}/timer/start`);
        break;
      case 'stop_timer':
        result = await apiRequest('POST', `/tasks/${args.task_id}/timer/stop`);
        break;
      case 'add_dependency':
        result = await apiRequest('POST', `/tasks/${args.task_id}/dependencies`, {
          depends_on_id: args.depends_on_id,
          type: args.type || 'finish_to_start',
        });
        break;
      case 'search':
        result = await apiRequest('GET', '/search', { q: args.q });
        break;
      case 'get_reports': {
        const endpoint = args.type === 'velocity'
          ? '/reports/velocity'
          : `/reports/${args.type}`;
        result = await apiRequest('GET', endpoint, {
          from: args.from,
          to: args.to,
          ...(args.project_id ? { project_id: args.project_id } : {}),
        });
        break;
      }
      case 'get_timebox_schedule':
        result = await apiRequest('GET', '/timebox/schedule', { date: args.date });
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// ── Resources (Context) ──────────────────────────────────────────────────────

const RESOURCES = [
  { uri: 'vilva://dashboard', name: 'Dashboard', description: 'Dashboard stats and overview', mimeType: 'application/json' },
  { uri: 'vilva://me', name: 'Current User', description: 'Current user profile and active timer', mimeType: 'application/json' },
];

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCES,
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  let data;
  switch (uri) {
    case 'vilva://dashboard':
      data = await apiRequest('GET', '/dashboard');
      break;
    case 'vilva://me':
      data = await apiRequest('GET', '/me');
      break;
    default:
      // Dynamic resource: vilva://projects/{id}, vilva://tasks/{id}
      if (uri.startsWith('vilva://projects/')) {
        const id = uri.split('/').pop();
        data = await apiRequest('GET', `/projects/${id}`);
      } else if (uri.startsWith('vilva://tasks/')) {
        const id = uri.split('/').pop();
        data = await apiRequest('GET', `/tasks/${id}`);
      } else {
        throw new Error(`Unknown resource: ${uri}`);
      }
  }

  return {
    contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }],
  };
});

// ── Prompts (Pre-built Workflows) ────────────────────────────────────────────

const PROMPTS = [
  {
    name: 'plan-sprint',
    description: 'Analyze backlog and suggest sprint plan based on scores and capacity',
    arguments: [
      { name: 'project_id', description: 'Project ID to plan for', required: true },
      { name: 'capacity', description: 'Team capacity in story points (default: 40)', required: false },
    ],
  },
  {
    name: 'daily-standup',
    description: 'Generate standup summary: yesterday, today, blockers',
    arguments: [],
  },
  {
    name: 'task-breakdown',
    description: 'Break a large task into scored subtasks',
    arguments: [
      { name: 'task_id', description: 'Task ID to break down', required: true },
    ],
  },
  {
    name: 'project-status',
    description: 'Generate project status report with risks and blockers',
    arguments: [
      { name: 'project_id', description: 'Project ID', required: true },
    ],
  },
];

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPTS,
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'plan-sprint': {
      const capacity = args?.capacity || 40;
      const projectId = args?.project_id;
      const tasks = await apiRequest('GET', `/projects/${projectId}/tasks`, { status: 'backlog' });
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `You are a sprint planning assistant for Vilva Taskspace.

Analyze the following backlog tasks and suggest a sprint plan:
- Team capacity: ${capacity} story points
- Prioritize by score and priority
- Flag any tasks missing scores
- Suggest which tasks to include in the sprint

Backlog tasks:
${JSON.stringify(tasks, null, 2)}

Provide a structured sprint plan with total points, selected tasks, and reasoning.`,
          },
        }],
      };
    }

    case 'daily-standup': {
      const [dashboard, myTasks] = await Promise.all([
        apiRequest('GET', '/dashboard'),
        apiRequest('GET', '/my-tasks'),
      ]);
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Generate a daily standup summary based on my current work state:

Dashboard stats: ${JSON.stringify(dashboard, null, 2)}
My current tasks: ${JSON.stringify(myTasks, null, 2)}

Format as:
**Yesterday**: What was completed
**Today**: What's planned (in_progress and working_on tasks)
**Blockers**: Any blocked tasks or overdue items`,
          },
        }],
      };
    }

    case 'task-breakdown': {
      const task = await apiRequest('GET', `/tasks/${args.task_id}`);
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Break down this task into subtasks with Fibonacci story point scores (1,2,3,5,8,13,21):

Task: ${JSON.stringify(task, null, 2)}

For each subtask provide:
- title
- task_type (feature, bug, improvement, story, spike, chore, task)
- score (story points)
- estimated_minutes
- priority

Return as a JSON array ready for bulk creation.`,
          },
        }],
      };
    }

    case 'project-status': {
      const [project, stats, kanban] = await Promise.all([
        apiRequest('GET', `/projects/${args.project_id}`),
        apiRequest('GET', `/projects/${args.project_id}/stats`),
        apiRequest('GET', `/projects/${args.project_id}/kanban`),
      ]);
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Generate a project status report:

Project: ${JSON.stringify(project, null, 2)}
Stats: ${JSON.stringify(stats, null, 2)}
Kanban Board: ${JSON.stringify(kanban, null, 2)}

Include:
1. Overall progress assessment
2. Key metrics (completion %, velocity)
3. Risks and blockers
4. Recommendations for next steps`,
          },
        }],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// ── Start server ─────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Vilva Taskspace MCP Server running on stdio');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
