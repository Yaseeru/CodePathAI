# Lesson Content Versioning

## Overview

The lesson content versioning system automatically tracks changes to lesson content over time. Every time a lesson is updated, the previous version is saved to the `lesson_versions` table, allowing administrators to view version history and restore previous versions if needed.

## Features

- **Automatic Versioning**: Previous versions are automatically saved when lesson content is updated
- **Version History**: View all previous versions of a lesson with timestamps and change notes
- **Version Comparison**: Compare two versions to see what changed
- **Version Restoration**: Restore a lesson to any previous version
- **Change Tracking**: Track who made changes and when

## Database Schema

### lessons table
- Added `version` column (INTEGER, default 1) to track the current version number

### lesson_versions table
Stores historical versions of lesson content:
- `id`: UUID primary key
- `lesson_id`: Reference to the lesson
- `version`: Version number
- `title`, `description`, `content`, etc.: Snapshot of lesson data at that version
- `created_at`: When this version was created
- `created_by`: User who created this version (optional)
- `change_notes`: Optional notes describing what changed

### Trigger
A database trigger (`lesson_version_trigger`) automatically:
1. Detects when lesson content changes
2. Saves the old version to `lesson_versions`
3. Increments the version number

## API Endpoints

### GET /api/lessons/[id]/versions
Retrieves version history for a lesson.

**Response:**
```json
{
  "success": true,
  "versions": [
    {
      "id": "uuid",
      "lessonId": "uuid",
      "version": 2,
      "title": "Lesson Title",
      "description": "Description",
      "content": {...},
      "createdAt": "2024-01-01T00:00:00Z",
      "changeNotes": "Updated examples"
    }
  ],
  "count": 2
}
```

### GET /api/lessons/[id]/versions/[version]
Retrieves a specific version of a lesson.

**Response:**
```json
{
  "success": true,
  "version": {
    "id": "uuid",
    "lessonId": "uuid",
    "version": 1,
    "title": "Lesson Title",
    ...
  }
}
```

### POST /api/lessons/[id]/versions/[version]
Restores a lesson to a specific version.

**Request Body:**
```json
{
  "changeNotes": "Restored to version 1"
}
```

**Response:**
```json
{
  "success": true,
  "lesson": {...},
  "message": "Successfully restored lesson to version 1"
}
```

### GET /api/lessons/[id]/versions/compare?version1=1&version2=2
Compares two versions of a lesson.

**Response:**
```json
{
  "success": true,
  "comparison": {
    "version1": {...},
    "version2": {...},
    "differences": [
      {
        "field": "title",
        "version1Value": "Old Title",
        "version2Value": "New Title"
      }
    ]
  }
}
```

## UI Components

### LessonVersionHistory Component
A React component that displays version history with the ability to view and restore versions.

**Usage:**
```tsx
import { LessonVersionHistory } from '@/components/lesson';

<LessonVersionHistory 
  lessonId="lesson-uuid"
  onVersionRestore={(version) => {
    console.log(`Restored to version ${version}`);
  }}
/>
```

**Features:**
- Lists all versions with timestamps and change notes
- View button to see version details in a modal
- Restore button to restore to that version
- Confirmation dialog before restoring

### Version History Page
A dedicated page at `/lesson/[id]/versions` that displays the full version history for a lesson.

## Service Layer

### getLessonVersionHistory(lessonId)
Fetches all versions for a lesson, ordered by version number (newest first).

### getLessonVersion(lessonId, version)
Fetches a specific version of a lesson.

### getCurrentLessonVersion(lessonId)
Gets the current version number of a lesson.

### restoreLessonVersion(lessonId, targetVersion, changeNotes?)
Restores a lesson to a previous version. This creates a new version with the content from the target version.

### compareLessonVersions(lessonId, version1, version2)
Compares two versions and returns the differences.

## How It Works

1. **Content Update**: When a lesson's content is updated in the database
2. **Trigger Fires**: The `lesson_version_trigger` detects the change
3. **Save Old Version**: The old version is inserted into `lesson_versions`
4. **Increment Version**: The lesson's version number is incremented
5. **New Version Active**: The updated content becomes the current version

## Best Practices

1. **Add Change Notes**: When updating lessons, consider adding change notes to help track what changed
2. **Review Before Restore**: Always review a version before restoring it
3. **Test After Restore**: After restoring a version, test the lesson to ensure it works correctly
4. **Keep History**: Version history is preserved indefinitely for audit purposes

## Example Workflow

1. Administrator updates a lesson's content
2. System automatically saves the old version
3. Later, administrator realizes the old version was better
4. Administrator navigates to `/lesson/[id]/versions`
5. Reviews the version history
6. Clicks "View" to see the old version's content
7. Clicks "Restore" to restore to that version
8. System creates a new version with the old content
9. Lesson is now at the restored version

## Security

- All endpoints require authentication
- Users can only access versions for lessons they have permission to view
- Version restoration is logged for audit purposes

## Testing

Unit tests are available in `tests/unit/services/lesson-versioning.test.ts` covering:
- Fetching version history
- Fetching specific versions
- Getting current version
- Comparing versions
- Error handling

Run tests with:
```bash
npm test -- tests/unit/services/lesson-versioning.test.ts
```
