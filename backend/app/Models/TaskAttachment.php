<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class TaskAttachment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'task_id', 'user_id', 'original_name', 'file_path',
        'file_url', 'mime_type', 'file_size', 'disk',
    ];

    protected $appends = ['download_url'];

    public function task() { return $this->belongsTo(Task::class); }
    public function user() { return $this->belongsTo(User::class); }

    public function getDownloadUrlAttribute(): string
    {
        return Storage::disk($this->disk)->temporaryUrl($this->file_path, now()->addMinutes(30));
    }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes >= 1048576) return round($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024)    return round($bytes / 1024, 2) . ' KB';
        return $bytes . ' B';
    }
}
