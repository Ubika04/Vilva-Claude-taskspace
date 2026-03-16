<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMember extends Model
{
    protected $fillable = ['project_id', 'user_id', 'role_id', 'joined_at'];

    protected $casts = ['joined_at' => 'datetime'];

    public function project() { return $this->belongsTo(Project::class); }
    public function user()    { return $this->belongsTo(User::class); }
    public function role()    { return $this->belongsTo(Role::class); }
}
