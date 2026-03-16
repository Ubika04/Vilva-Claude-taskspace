<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Projects
            ['name' => 'projects.view',   'display_name' => 'View Projects',   'group' => 'projects'],
            ['name' => 'projects.create', 'display_name' => 'Create Projects', 'group' => 'projects'],
            ['name' => 'projects.update', 'display_name' => 'Update Projects', 'group' => 'projects'],
            ['name' => 'projects.delete', 'display_name' => 'Delete Projects', 'group' => 'projects'],
            // Tasks
            ['name' => 'tasks.view',      'display_name' => 'View Tasks',      'group' => 'tasks'],
            ['name' => 'tasks.create',    'display_name' => 'Create Tasks',    'group' => 'tasks'],
            ['name' => 'tasks.update',    'display_name' => 'Update Tasks',    'group' => 'tasks'],
            ['name' => 'tasks.delete',    'display_name' => 'Delete Tasks',    'group' => 'tasks'],
            ['name' => 'tasks.assign',    'display_name' => 'Assign Tasks',    'group' => 'tasks'],
            // Members
            ['name' => 'members.manage',  'display_name' => 'Manage Members',  'group' => 'members'],
            // Reports
            ['name' => 'reports.view',    'display_name' => 'View Reports',    'group' => 'reports'],
            ['name' => 'reports.export',  'display_name' => 'Export Reports',  'group' => 'reports'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        $roles = [
            ['name' => 'owner',   'display_name' => 'Owner',   'is_system' => true,  'perms' => Permission::pluck('name')->toArray()],
            ['name' => 'admin',   'display_name' => 'Admin',   'is_system' => true,  'perms' => Permission::pluck('name')->toArray()],
            ['name' => 'manager', 'display_name' => 'Manager', 'is_system' => false, 'perms' => ['projects.view','projects.update','tasks.view','tasks.create','tasks.update','tasks.assign','members.manage','reports.view']],
            ['name' => 'member',  'display_name' => 'Member',  'is_system' => false, 'perms' => ['projects.view','tasks.view','tasks.create','tasks.update']],
            ['name' => 'guest',   'display_name' => 'Guest',   'is_system' => false, 'perms' => ['projects.view','tasks.view']],
        ];

        foreach ($roles as $r) {
            $role = Role::firstOrCreate(['name' => $r['name']], [
                'display_name' => $r['display_name'],
                'is_system'    => $r['is_system'],
            ]);
            $permIds = Permission::whereIn('name', $r['perms'])->pluck('id');
            $role->permissions()->sync($permIds);
        }
    }
}
