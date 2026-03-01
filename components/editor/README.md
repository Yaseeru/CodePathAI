# Code Editor Components

This directory contains the Monaco-based code editor components for the CodePath AI platform.

## Components

### CodeEditor
The base Monaco Editor component with syntax highlighting, auto-completion, and keyboard shortcuts.

**Props:**
- `language`: 'javascript' | 'python' | 'html'
- `value`: string - Current code content
- `onChange`: (value: string) => void - Callback when code changes
- `readOnly?`: boolean - Whether editor is read-only
- `onSave?`: () => void - Callback for Ctrl+S
- `onRun?`: () => void - Callback for Ctrl+Enter

**Features:**
- Syntax highlighting for JavaScript, Python, HTML
- Auto-completion support
- Line numbers and minimap
- Error squiggles for syntax errors
- Keyboard shortcuts: Ctrl+S (save), Ctrl+Enter (run)

### CodeEditorWithAutoSave
Wrapper around CodeEditor that adds auto-save functionality.

**Props:**
- `language`: 'javascript' | 'python' | 'html'
- `initialValue`: string - Initial code content
- `lessonId?`: string - UUID of the lesson (for saving)
- `projectId?`: string - UUID of the project (for saving)
- `readOnly?`: boolean - Whether editor is read-only
- `onRun?`: () => void - Callback for running code

**Features:**
- Auto-saves every 30 seconds
- Visual save status indicator (saving, saved, error)
- Only saves when code has changed
- Persists to database via /api/code/save

### CodeOutput
Displays code execution results with proper formatting.

**Props:**
- `result`: ExecutionResult | null - Execution result to display
- `onClear`: () => void - Callback to clear output

**ExecutionResult Type:**
```typescript
interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  error?: string;
}
```

**Features:**
- Displays stdout with monospace font
- Displays stderr with error styling (red)
- Shows execution time
- Highlights error line numbers in error messages
- Clear output button

### CodeControls
Control panel for code execution with buttons and status display.

**Props:**
- `onRun`: () => void - Callback to run code
- `onStop`: () => void - Callback to stop execution
- `onClearOutput`: () => void - Callback to clear output
- `onResetCode`: () => void - Callback to reset code
- `isRunning`: boolean - Whether code is currently executing
- `executionTime?`: number - Execution time in milliseconds

**Features:**
- Run button with loading state
- Stop button (for long-running code)
- Clear Output button
- Reset Code button (restores starter code)
- Execution time counter (live during execution)

### CodeEditorLayout
Complete layout combining all editor components.

**Props:**
- `language`: 'javascript' | 'python' | 'html'
- `initialCode`: string - Initial code content
- `starterCode?`: string - Starter code template (for reset)
- `lessonId?`: string - UUID of the lesson
- `projectId?`: string - UUID of the project
- `readOnly?`: boolean - Whether editor is read-only

**Features:**
- Split-pane layout (editor left, output right)
- Integrated controls
- Auto-save functionality
- Code execution via /api/code/execute
- Abort controller for stopping execution

## Usage Examples

### Basic Editor
```tsx
import { CodeEditor } from '@/components/editor';

function MyComponent() {
  const [code, setCode] = useState('console.log("Hello, World!");');

  return (
    <CodeEditor
      language="javascript"
      value={code}
      onChange={setCode}
    />
  );
}
```

### Editor with Auto-Save
```tsx
import { CodeEditorWithAutoSave } from '@/components/editor';

function LessonPage({ lessonId }: { lessonId: string }) {
  return (
    <CodeEditorWithAutoSave
      language="javascript"
      initialValue="// Start coding here"
      lessonId={lessonId}
    />
  );
}
```

### Complete Editor Layout
```tsx
import { CodeEditorLayout } from '@/components/editor';

function CodePlayground() {
  return (
    <div className="h-screen">
      <CodeEditorLayout
        language="python"
        initialCode="print('Hello, World!')"
        starterCode="# Write your code here"
        lessonId="lesson-uuid"
      />
    </div>
  );
}
```

## API Endpoints

### POST /api/code/save
Saves code to the database.

**Request Body:**
```json
{
  "lessonId": "uuid",
  "projectId": "uuid",
  "code": "string",
  "language": "javascript" | "python" | "html"
}
```

**Response:**
```json
{
  "success": true,
  "savedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/code/execute
Executes code via Piston API (to be implemented in task 10).

**Request Body:**
```json
{
  "code": "string",
  "language": "javascript" | "python" | "html"
}
```

**Response:**
```json
{
  "stdout": "string",
  "stderr": "string",
  "exitCode": 0,
  "executionTime": 123
}
```

## Styling

All components use Tailwind CSS with a dark theme:
- Background: gray-900
- Text: white/gray-400
- Accents: green (success), red (error), blue (info)
- Monospace font for code and output

## Requirements Validated

- **Requirement 6.1**: Monaco Editor integration ✓
- **Requirement 6.2**: Syntax highlighting for JavaScript, Python, HTML ✓
- **Requirement 6.3**: Auto-completion support ✓
- **Requirement 6.5**: Auto-save every 30 seconds ✓
- **Requirement 7.1**: Run Code button ✓
- **Requirement 7.5**: Display execution output ✓
- **Requirement 7.6**: Display errors with line numbers ✓

## Notes

- Monaco Editor is loaded dynamically with `ssr: false` for Next.js compatibility
- Auto-save only triggers when code has changed
- Error line numbers are highlighted in yellow in error messages
- Execution can be aborted using the Stop button
- Reset Code requires user confirmation
