# Database Schema: InterviewPrep AI (MVP)

## 1. Tables, Columns, and Constraints

This section details the tables, their columns, data types, and constraints for the project database.

### Custom Types (ENUMs)

First, we define the custom ENUM types that will be used in the tables.

```sql
-- Used to track the origin of a question
CREATE TYPE question_source AS ENUM ('user', 'ai', 'ai-edited');

-- Used to track the status of an AI generation task
CREATE TYPE generation_status AS ENUM ('success', 'error');
```

### `users` Table

This table will be managed by Supabase's built-in authentication system. It stores user credentials and metadata.

### `questions` Table

This table stores the questions and answers created by users.

| Column              | Type              | Constraints                                                    | Description                                                                      |
| ------------------- | ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `id`                | `uuid`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                     | Unique identifier for the question.                                              |
| `user_id`           | `uuid`            | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE`      | Foreign key linking to the user who owns the question.                           |
| `generation_log_id` | `uuid`            | `NULL`, `REFERENCES ai_generation_logs(id) ON DELETE SET NULL` | Optional foreign key linking to the AI generation log that created the question. |
| `question`          | `varchar(10000)`  | `NOT NULL`                                                     | The text of the question.                                                        |
| `answer`            | `varchar(10000)`  | `NULL`                                                         | The user's answer to the question. Can be empty.                                 |
| `source`            | `question_source` | `NOT NULL`                                                     | The source of the question (`user`, `ai`, `ai-edited`).                          |
| `created_at`        | `timestamptz`     | `NOT NULL`, `DEFAULT now()`                                    | Timestamp of when the question was created.                                      |
| `updated_at`        | `timestamptz`     | `NOT NULL`                                                     | Timestamp of the last update. Managed by a trigger.                              |

### `ai_generation_logs` Table

This table logs all attempts to generate questions using the AI service.

| Column          | Type                | Constraints                                                | Description                                                            |
| --------------- | ------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `id`            | `uuid`              | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                 | Unique identifier for the log entry.                                   |
| `user_id`       | `uuid`              | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE SET NULL` | Foreign key linking to the user who initiated the generation.          |
| `created_at`    | `timestamptz`       | `NOT NULL`, `DEFAULT now()`                                | Timestamp of when the generation task was initiated.                   |
| `finished_at`   | `timestamptz`       | `NULL`                                                     | Timestamp of when the generation task completed (successfully or not). |
| `status`        | `generation_status` | `NULL`                                                     | The final status of the generation task (`success` or `error`).        |
| `prompt`        | `varchar(100000)`   | `NOT NULL`                                                 | The full prompt (job offer text) sent to the AI service.               |
| `response`      | `varchar(100000)`   | `NULL`                                                     | The raw response received from the AI service.                         |
| `error_details` | `text`              | `NULL`                                                     | Detailed information in case of an error during generation.            |

## 2. Table Relationships

- **`auth.users` to `questions`**: One-to-Many. A user can have many questions. Deleting a user will cascade and delete all their associated questions.
- **`auth.users` to `ai_generation_logs`**: One-to-Many. A user can have many AI generation logs. Deleting a user will cascade and set user_id in ai_generation_logs to `NULL`.
- **`ai_generation_logs` to `questions`**: One-to-Many (Optional). A single AI generation log can result in multiple questions. This relationship is optional (`generation_log_id` is nullable). If a log is deleted, the `generation_log_id` in the associated questions will be set to `NULL`, preserving the questions.

## 3. Indexes

To ensure query performance, the following indexes will be created:

- **On `questions` table:**
  - `CREATE INDEX ON questions (user_id);` (Automatically created for the foreign key)
  - `CREATE INDEX ON questions (created_at DESC);` (For efficient sorting of questions from newest to oldest)
  - `CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE INDEX ON questions USING GIN (question gin_trgm_ops);` (For fast, case-insensitive text search on the `question` column)
- **On `ai_generation_logs` table:**
  - `CREATE INDEX ON ai_generation_logs (user_id);` (Automatically created for the foreign key)

## 4. Row-Level Security (RLS) Policies

RLS will be enabled on all tables to ensure data privacy and isolation between users.

### `questions` Table Policies

```sql
-- 1. Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 2. Policy for SELECT: Users can only see their own questions.
CREATE POLICY "Allow individual read access" ON questions
FOR SELECT USING (auth.uid() = user_id);

-- 3. Policy for INSERT: Users can only create questions for themselves.
CREATE POLICY "Allow individual insert access" ON questions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Policy for UPDATE: Users can only update their own questions.
CREATE POLICY "Allow individual update access" ON questions
FOR UPDATE USING (auth.uid() = user_id);

-- 5. Policy for DELETE: Users can only delete their own questions.
CREATE POLICY "Allow individual delete access" ON questions
FOR DELETE USING (auth.uid() = user_id);
```

### `ai_generation_logs` Table Policies

```sql
-- 1. Enable RLS
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- 2. Policy for SELECT: Users can only see their own logs.
CREATE POLICY "Allow individual read access" ON ai_generation_logs
FOR SELECT USING (auth.uid() = user_id);

-- 3. Policy for INSERT: Users can only create logs for themselves.
CREATE POLICY "Allow individual insert access" ON ai_generation_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

_Note: `UPDATE` and `DELETE` policies are omitted for `ai_generation_logs` as these operations are not intended for end-users._

## 5. Additional Considerations & Triggers

### `updated_at` Trigger

A trigger will be implemented to automatically update the `updated_at` column in the `questions` table whenever a row is modified.

```sql
-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the trigger to the 'questions' table
CREATE TRIGGER on_question_update
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();
```
