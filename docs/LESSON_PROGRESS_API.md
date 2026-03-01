# Lesson Progress Tracking API

This document describes the lesson progress tracking endpoints implemented for Task 13.

## Endpoints

### 1. Start Lesson Tracking

**Endpoint:** `POST /api/lessons/:id/start`

**Description:** Starts tracking a lesson by creating or updating a lesson_progress record.

**Authentication:** Required (JWT token)

**Request:**
- No body required

**Response:**
```json
{
  "success": true,
  "message": "Lesson started successfully"
}
```

**What it does:**
- Creates or updates `lesson_progress` record with `started_at` timestamp
- Sets status to `in_progress`
- Updates `user_progress.current_lesson_id`
- If lesson is already completed, it won't change the status

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Lesson doesn't exist
- `500 Internal Server Error` - Database error

---

### 2. Complete Lesson

**Endpoint:** `POST /api/lessons/:id/complete`

**Description:** Marks a lesson as completed and updates all related progress tracking.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "completionTime": 15  // Optional: completion time in minutes
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lesson completed successfully",
  "completionTime": 15,
  "nextLesson": {
    "id": "uuid",
    "title": "Next Lesson Title",
    "description": "Next lesson description",
    "order_index": 2
  }
}
```

**What it does:**
- Updates `lesson_progress` status to `completed`
- Records `completed_at` timestamp and `completion_time`
- Increments `user_progress.total_lessons_completed`
- Updates `user_progress.total_learning_time`
- Updates `daily_activity` for current date (lessons_completed, time_spent)
- Returns the next lesson in the roadmap (if available)
- If completion time is not provided, calculates it from `started_at`

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Lesson or lesson progress not found
- `500 Internal Server Error` - Database error

**Special Cases:**
- If lesson is already completed, returns success with `alreadyCompleted: true`
- If no next lesson exists, returns `nextLesson: null`

---

### 3. Save Lesson State (Pause)

**Endpoint:** `POST /api/lessons/:id/state`

**Description:** Saves the current lesson state for pause/resume functionality.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "code": "console.log('Hello');",
  "language": "javascript",
  "scrollPosition": 150,
  "timerElapsed": 300  // seconds
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lesson state saved successfully",
  "savedAt": "2025-01-15T10:30:00.000Z"
}
```

**What it does:**
- Saves code to `code_saves` table
- Stores UI state (scroll position, timer) in `lesson_progress.state` JSONB field
- Updates `lesson_progress.updated_at` timestamp

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Lesson doesn't exist
- `500 Internal Server Error` - Database error

---

### 4. Retrieve Lesson State (Resume)

**Endpoint:** `GET /api/lessons/:id/state`

**Description:** Retrieves saved lesson state for resume functionality.

**Authentication:** Required (JWT token)

**Response:**
```json
{
  "success": true,
  "state": {
    "code": "console.log('Hello');",
    "language": "javascript",
    "savedAt": "2025-01-15T10:30:00.000Z",
    "timerElapsed": 300,
    "scrollPosition": 150,
    "status": "in_progress"
  }
}
```

**What it does:**
- Retrieves latest saved code from `code_saves` table
- Retrieves UI state from `lesson_progress.state` field
- Calculates elapsed time if lesson is in progress
- Returns lesson status

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Database error

**Special Cases:**
- If no saved code exists, returns `code: null`
- If no saved state exists, returns default values (scrollPosition: 0, etc.)

---

## Database Schema Changes

### New Migration: `005_add_lesson_state_field.sql`

Adds a `state` JSONB field to the `lesson_progress` table to store UI state:

```sql
ALTER TABLE lesson_progress
ADD COLUMN state JSONB DEFAULT '{}'::jsonb;
```

The `state` field stores:
- `scrollPosition`: Number - scroll position in pixels
- `timerElapsed`: Number - elapsed time in seconds
- Any other UI state needed for pause/resume

---

## Usage Example

### Starting a Lesson

```typescript
const response = await fetch(`/api/lessons/${lessonId}/start`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
if (data.success) {
  console.log('Lesson started!');
}
```

### Completing a Lesson

```typescript
const response = await fetch(`/api/lessons/${lessonId}/complete`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    completionTime: 15, // minutes
  }),
});

const data = await response.json();
if (data.success && data.nextLesson) {
  console.log('Next lesson:', data.nextLesson.title);
}
```

### Saving State (Pause)

```typescript
const response = await fetch(`/api/lessons/${lessonId}/state`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: editorContent,
    language: 'javascript',
    scrollPosition: window.scrollY,
    timerElapsed: timerSeconds,
  }),
});
```

### Restoring State (Resume)

```typescript
const response = await fetch(`/api/lessons/${lessonId}/state`);
const data = await response.json();

if (data.success && data.state.code) {
  // Restore editor content
  editor.setValue(data.state.code);
  
  // Restore scroll position
  window.scrollTo(0, data.state.scrollPosition);
  
  // Restore timer
  setTimerElapsed(data.state.timerElapsed);
}
```

---

## Requirements Validation

This implementation satisfies the following requirements:

### Requirement 5.4 (Lesson Start Tracking)
✅ Records start timestamp when user starts a lesson
✅ Updates lesson status to 'in_progress'
✅ Updates user's current lesson

### Requirement 5.6 (Lesson Completion)
✅ Marks lesson as complete
✅ Records completion timestamp and time
✅ Updates total lessons completed
✅ Updates total learning time

### Requirement 5.8 (Pause/Resume)
✅ Saves current code on pause
✅ Saves scroll position and timer state
✅ Restores exact state on resume
✅ Updates lesson_progress.updated_at on state changes

### Requirement 10.1 (Progress Dashboard)
✅ Provides data for lessons completed count
✅ Provides data for total learning time
✅ Updates daily activity tracking

---

## Testing

To test these endpoints manually:

1. **Start a lesson:**
   ```bash
   curl -X POST http://localhost:3000/api/lessons/{lesson-id}/start \
     -H "Authorization: Bearer {token}"
   ```

2. **Complete a lesson:**
   ```bash
   curl -X POST http://localhost:3000/api/lessons/{lesson-id}/complete \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {token}" \
     -d '{"completionTime": 15}'
   ```

3. **Save state:**
   ```bash
   curl -X POST http://localhost:3000/api/lessons/{lesson-id}/state \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {token}" \
     -d '{"code": "console.log(\"test\");", "language": "javascript", "scrollPosition": 100, "timerElapsed": 300}'
   ```

4. **Get state:**
   ```bash
   curl http://localhost:3000/api/lessons/{lesson-id}/state \
     -H "Authorization: Bearer {token}"
   ```

---

## Future Enhancements

Potential improvements for future iterations:

1. **Streak Calculation:** Automatically calculate and update user streaks based on daily activity
2. **Lesson Unlocking:** Implement prerequisite checking to unlock next lessons
3. **Progress Notifications:** Send notifications when milestones are reached
4. **Analytics Events:** Track lesson start/complete events for analytics
5. **Retry Logic:** Add automatic retry for failed database operations
6. **Rate Limiting:** Add rate limiting to prevent abuse
7. **Validation:** Add more robust input validation using Zod schemas
