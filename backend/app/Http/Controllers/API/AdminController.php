<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * GET /api/v1/users/search?q=&per_page=
     * Search users by name or email (for assignee pickers).
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $q = $request->get('q', '');

        $users = User::where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
            })
            ->where('status', 'active')
            ->select('id', 'name', 'email', 'avatar')
            ->limit((int) $request->get('per_page', 10))
            ->get()
            ->map(fn ($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'avatar_url' => $u->avatar_url,
            ]);

        return response()->json($users);
    }

    /**
     * GET /api/v1/admin/users
     * Returns all users with their assigned tasks and task stats.
     * Admin-only endpoint.
     */
    public function users(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden. Admin access required.'], 403);
        }

        $users = User::with([
            'roles',
            'assignedTasks' => fn ($q) => $q->with('project:id,name,color')
                ->select('tasks.id', 'tasks.title', 'tasks.status', 'tasks.priority', 'tasks.due_date', 'tasks.project_id'),
        ])->get();

        $now  = now();
        $data = $users->map(function ($user) use ($now) {
            $tasks = $user->assignedTasks;

            return [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'mobile'         => $user->mobile,
                'department'     => $user->department,
                'designation'    => $user->designation,
                'avatar_url'     => $user->avatar_url,
                'status'         => $user->status,
                'last_active_at' => $user->last_active_at,
                'roles'          => $user->roles->pluck('name'),
                'task_stats'     => [
                    'total'       => $tasks->count(),
                    'in_progress' => $tasks->where('status', 'in_progress')->count(),
                    'completed'   => $tasks->where('status', 'completed')->count(),
                    'overdue'     => $tasks->filter(
                        fn ($t) => $t->due_date && $now->isAfter($t->due_date) && $t->status !== 'completed'
                    )->count(),
                ],
                'tasks' => $tasks->map(fn ($t) => [
                    'id'       => $t->id,
                    'title'    => $t->title,
                    'status'   => $t->status,
                    'priority' => $t->priority,
                    'due_date' => $t->due_date,
                    'project'  => $t->project ? [
                        'id'    => $t->project->id,
                        'name'  => $t->project->name,
                        'color' => $t->project->color,
                    ] : null,
                ]),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/v1/admin/roles
     * Returns available roles for the role picker.
     */
    public function roles(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $roles = Role::select('id', 'name', 'display_name')->get();
        return response()->json(['data' => $roles]);
    }

    /**
     * POST /api/v1/admin/users
     * Create a new user (admin only).
     */
    public function createUser(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'mobile'      => 'nullable|string|max:20',
            'role'        => 'required|string|exists:roles,name',
            'department'  => 'nullable|string|max:100',
            'designation' => 'nullable|string|max:100',
            'password'    => 'nullable|string|min:6',
        ]);

        $user = User::create([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'mobile'      => $validated['mobile'] ?? null,
            'department'  => $validated['department'] ?? null,
            'designation' => $validated['designation'] ?? null,
            'password'    => Hash::make($validated['password'] ?? 'password'),
            'status'      => 'active',
        ]);

        $role = Role::where('name', $validated['role'])->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        return response()->json([
            'message' => 'User created successfully.',
            'data'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'mobile'      => $user->mobile,
                'department'  => $user->department,
                'designation' => $user->designation,
                'roles'       => $user->roles->pluck('name'),
            ],
        ], 201);
    }

    /**
     * PATCH /api/v1/admin/users/{user}
     * Update a user (admin only).
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'mobile'      => 'nullable|string|max:20',
            'role'        => 'sometimes|string|exists:roles,name',
            'department'  => 'nullable|string|max:100',
            'designation' => 'nullable|string|max:100',
            'status'      => 'sometimes|in:active,inactive,suspended',
        ]);

        $role = null;
        if (isset($validated['role'])) {
            $role = $validated['role'];
            unset($validated['role']);
        }

        $user->update($validated);

        if ($role) {
            $roleModel = Role::where('name', $role)->first();
            if ($roleModel) {
                $user->roles()->sync([$roleModel->id]);
            }
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'data'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'mobile'      => $user->mobile,
                'department'  => $user->department,
                'designation' => $user->designation,
                'status'      => $user->status,
                'roles'       => $user->fresh()->roles->pluck('name'),
            ],
        ]);
    }

    /**
     * DELETE /api/v1/admin/users/{user}
     * Soft-delete a user (admin only). Cannot delete yourself.
     */
    public function deleteUser(Request $request, User $user): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    /**
     * POST /api/v1/admin/users/{user}/reset-password
     * Admin resets a user's password.
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->update(['password' => Hash::make($validated['password'])]);

        return response()->json(['message' => 'Password has been reset for ' . $user->name . '.']);
    }

    /**
     * POST /api/v1/admin/roles
     */
    public function createRole(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name'         => 'required|string|max:50|unique:roles,name',
            'display_name' => 'required|string|max:100',
            'description'  => 'nullable|string|max:255',
            'permissions'  => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create([
            'name'         => $validated['name'],
            'display_name' => $validated['display_name'],
            'description'  => $validated['description'] ?? null,
            'is_system'    => false,
        ]);

        if (!empty($validated['permissions'])) {
            $permIds = \App\Models\Permission::whereIn('name', $validated['permissions'])->pluck('id');
            $role->permissions()->sync($permIds);
        }

        return response()->json([
            'message' => 'Role created.',
            'data'    => $role->load('permissions'),
        ], 201);
    }

    /**
     * PATCH /api/v1/admin/roles/{role}
     */
    public function updateRole(Request $request, Role $role): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'display_name' => 'sometimes|string|max:100',
            'description'  => 'nullable|string|max:255',
            'permissions'  => 'sometimes|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if (isset($validated['display_name'])) $role->update(['display_name' => $validated['display_name']]);
        if (isset($validated['description'])) $role->update(['description' => $validated['description']]);

        if (isset($validated['permissions'])) {
            $permIds = \App\Models\Permission::whereIn('name', $validated['permissions'])->pluck('id');
            $role->permissions()->sync($permIds);
        }

        return response()->json([
            'message' => 'Role updated.',
            'data'    => $role->fresh()->load('permissions'),
        ]);
    }

    /**
     * DELETE /api/v1/admin/roles/{role}
     */
    public function deleteRole(Request $request, Role $role): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($role->is_system) {
            return response()->json(['message' => 'Cannot delete system roles.'], 422);
        }

        $role->permissions()->detach();
        $role->users()->detach();
        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }

    /**
     * GET /api/v1/admin/permissions
     */
    public function permissions(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $permissions = \App\Models\Permission::all()->groupBy('group');
        return response()->json(['data' => $permissions]);
    }
}
