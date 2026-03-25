<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'timezone' => $request->timezone ?? 'UTC',
        ]);

        // Assign default "member" role
        $memberRole = Role::where('name', 'member')->first();
        if ($memberRole) {
            $user->roles()->attach($memberRole->id);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }

        $user->update(['last_active_at' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $user->load('roles'),
            'token'   => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.'], 204);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');
        $now  = now();

        $assignedTasks = $user->assignedTasks()->with('project:id,name,color')->get();

        $projects = $user->projects()->select('projects.id', 'projects.name', 'projects.color')->get()
            ->merge($user->ownedProjects()->select('id', 'name', 'color')->get())
            ->unique('id')->values();

        return response()->json([
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'mobile'         => $user->mobile,
            'department'     => $user->department,
            'designation'    => $user->designation,
            'avatar_url'     => $user->avatar_url,
            'timezone'       => $user->timezone,
            'locale'         => $user->locale,
            'status'         => $user->status,
            'last_active_at' => $user->last_active_at,
            'roles'          => $user->roles,
            'task_stats'     => [
                'total'       => $assignedTasks->count(),
                'in_progress' => $assignedTasks->whereIn('status', ['in_progress', 'working_on'])->count(),
                'completed'   => $assignedTasks->where('status', 'completed')->count(),
                'overdue'     => $assignedTasks->filter(
                    fn ($t) => $t->due_date && $now->isAfter($t->due_date) && $t->status !== 'completed'
                )->count(),
            ],
            'projects'       => $projects,
            'created_at'     => $user->created_at,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'                  => 'sometimes|string|max:255',
            'email'                 => 'sometimes|email|unique:users,email,' . $user->id,
            'mobile'                => 'nullable|string|max:20',
            'department'            => 'nullable|string|max:100',
            'designation'           => 'nullable|string|max:100',
            'timezone'              => 'sometimes|string|timezone',
            'locale'                => 'sometimes|string|max:10',
            'current_password'      => 'required_with:password|string',
            'password'              => 'sometimes|string|min:8|confirmed',
            'password_confirmation' => 'sometimes|string',
        ]);

        if ($request->filled('password')) {
            if (! Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
            $validated['password'] = Hash::make($validated['password']);
        }

        unset($validated['current_password'], $validated['password_confirmation']);

        $user->update($validated);

        return response()->json($user->fresh()->load('roles'));
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => 'required|image|max:2048']);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json(['avatar_url' => $user->fresh()->avatar_url]);
    }

    /**
     * POST /api/v1/forgot-password
     * Generate a password reset token for the given email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            // Don't reveal whether the email exists
            return response()->json([
                'message' => 'If that email is registered, a reset code has been generated.',
            ]);
        }

        // Remove old tokens for this email
        DB::table('password_resets')->where('email', $request->email)->delete();

        // Generate a 6-digit code
        $token = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_resets')->insert([
            'email'      => $request->email,
            'token'      => Hash::make($token),
            'expires_at' => now()->addMinutes(30),
            'created_at' => now(),
        ]);

        // In production, send email here. For dev, return the token directly.
        return response()->json([
            'message' => 'If that email is registered, a reset code has been generated.',
            'reset_code' => $token, // Remove in production — shown for dev convenience
        ]);
    }

    /**
     * POST /api/v1/reset-password
     * Reset password using token/code.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => 'required|email',
            'code'                  => 'required|string|size:6',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $record = DB::table('password_resets')
            ->where('email', $request->email)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid or expired reset code.'], 422);
        }

        if (now()->isAfter($record->expires_at)) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Reset code has expired. Please request a new one.'], 422);
        }

        if (! Hash::check($request->code, $record->token)) {
            return response()->json(['message' => 'Invalid reset code.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Cleanup
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully. You can now sign in.']);
    }
}
