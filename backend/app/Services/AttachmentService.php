<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentService
{
    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
        'application/zip',
    ];

    private const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    public function upload(Task $task, UploadedFile $file, int $userId): TaskAttachment
    {
        $this->validate($file);

        $path = $this->buildPath($task, $file);

        Storage::disk('s3')->put($path, file_get_contents($file), 'private');

        return TaskAttachment::create([
            'task_id'       => $task->id,
            'user_id'       => $userId,
            'original_name' => $file->getClientOriginalName(),
            'file_path'     => $path,
            'file_url'      => Storage::disk('s3')->url($path),
            'mime_type'     => $file->getMimeType(),
            'file_size'     => $file->getSize(),
            'disk'          => 's3',
        ]);
    }

    public function delete(TaskAttachment $attachment): void
    {
        Storage::disk($attachment->disk)->delete($attachment->file_path);
        $attachment->delete();
    }

    public function getTemporaryUrl(TaskAttachment $attachment): string
    {
        return Storage::disk($attachment->disk)
            ->temporaryUrl($attachment->file_path, now()->addMinutes(30));
    }

    private function validate(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException('File exceeds maximum allowed size of 25 MB.');
        }

        if (! in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            throw new \InvalidArgumentException('File type not allowed.');
        }
    }

    private function buildPath(Task $task, UploadedFile $file): string
    {
        $ext = $file->getClientOriginalExtension();
        return "attachments/projects/{$task->project_id}/tasks/{$task->id}/" . Str::uuid() . ".{$ext}";
    }
}
