<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@vilva.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password123'),
                'timezone' => 'UTC',
                'status'   => 'active',
            ]
        );

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole && ! $user->roles()->where('role_id', $adminRole->id)->exists()) {
            $user->roles()->attach($adminRole->id);
        }
    }
}
