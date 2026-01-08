# Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 FIT-AI DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                      ┌──────────────┐
                                      │     USER     │
                                      │──────────────│
                                      │ id (PK)      │
                                      │ name         │
                                      │ email        │
                                      │ emailVerified│
                                      │ image        │
                                      │ createdAt    │
                                      │ updatedAt    │
                                      └──────┬───────┘
                                             │
        ┌────────────────┬───────────────────┼───────────────────┬────────────────┐
        │                │                   │                   │                │
        ▼                ▼                   ▼                   ▼                ▼
┌──────────────┐ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
│   SESSION    │ │   ACCOUNT    │   │   WORKOUT    │   │    BODY      │  │   EXERCISE   │
│──────────────│ │──────────────│   │──────────────│   │ MEASUREMENT  │  │  (custom)    │
│ id (PK)      │ │ id (PK)      │   │ id (PK)      │   │──────────────│  │──────────────│
│ userId (FK)  │ │ userId (FK)  │   │ userId (FK)  │   │ id (PK)      │  │ id (PK)      │
│ token        │ │ providerId   │   │ name         │   │ userId (FK)  │  │ createdBy-   │
│ expiresAt    │ │ accountId    │   │ notes        │   │ measuredAt   │  │  UserId (FK) │
│ ...          │ │ ...          │   │ startedAt    │   │ weight       │  │ name         │
└──────────────┘ └──────────────┘   │ completedAt  │   │ bodyFat%     │  │ category     │
                                    │ ...          │   │ chest, waist │  │ muscleGroups │
                                    └──────┬───────┘   │ hips, arms   │  │ equipment    │
                                           │           │ thighs, ...  │  │ exerciseType │
                                           │           └──────────────┘  │ isDefault    │
                                           │                             └──────┬───────┘
                                           │                                    │
                                           ▼                                    │
                                   ┌──────────────────┐                         │
                                   │ WORKOUT_EXERCISE │◄────────────────────────┘
                                   │──────────────────│
                                   │ id (PK)          │
                                   │ workoutId (FK)   │───────────┐
                                   │ exerciseId (FK)  │           │
                                   │ order            │           │
                                   │ notes            │           │
                                   └────────┬─────────┘           │
                                            │                     │
                                            ▼                     │
                                   ┌──────────────────┐           │
                                   │   EXERCISE_SET   │           │
                                   │──────────────────│           │
                                   │ id (PK)          │           │
                                   │ workoutExercise- │           │
                                   │   Id (FK)        │           │
                                   │ setNumber        │           │
                                   │ reps             │           │
                                   │ weight           │           │
                                   │ durationSeconds  │           │
                                   │ distance         │           │
                                   │ holdTimeSeconds  │           │
                                   └────────┬─────────┘           │
                                            │                     │
                                            ▼                     │
                                   ┌──────────────────┐           │
                                   │ PERSONAL_RECORD  │           │
                                   │──────────────────│           │
                                   │ id (PK)          │           │
                                   │ userId (FK)      │───────────┤
                                   │ exerciseId (FK)  │───────────┤
                                   │ workoutId (FK)   │◄──────────┘
                                   │ exerciseSetId    │
                                   │   (FK)           │
                                   │ recordType       │
                                   │ value            │
                                   │ achievedAt       │
                                   └──────────────────┘
```

## Tables Overview

### Authentication (managed by better-auth)

| Table          | Description                             |
| -------------- | --------------------------------------- |
| `user`         | Core user data - id, name, email, image |
| `session`      | Active user sessions with tokens        |
| `account`      | OAuth provider connections              |
| `verification` | Email verification tokens               |

### Fitness Domain

| Table              | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `exercise`         | Exercise library (default + user-created)                  |
| `workout`          | Workout sessions                                           |
| `workout_exercise` | Junction table linking workouts to exercises with ordering |
| `exercise_set`     | Individual sets within a workout exercise                  |
| `body_measurement` | Body composition tracking                                  |
| `personal_record`  | Personal bests for each exercise                           |

---

## Detailed Schema

### `exercise`

Stores both system-provided default exercises and user-created custom exercises.

| Column               | Type        | Nullable | Description                                                                              |
| -------------------- | ----------- | -------- | ---------------------------------------------------------------------------------------- |
| `id`                 | INTEGER     | NO       | Primary key, auto-increment                                                              |
| `name`               | TEXT        | NO       | Exercise name                                                                            |
| `description`        | TEXT        | YES      | Detailed description                                                                     |
| `category`           | TEXT        | NO       | Category: chest, back, shoulders, arms, legs, core, cardio, flexibility, compound, other |
| `muscle_groups`      | TEXT (JSON) | NO       | Array of targeted muscles                                                                |
| `equipment`          | TEXT        | YES      | Required equipment                                                                       |
| `exercise_type`      | TEXT        | NO       | Type: strength, cardio, flexibility                                                      |
| `is_default`         | INTEGER     | NO       | 1 for system exercises, 0 for user-created                                               |
| `created_by_user_id` | TEXT        | YES      | FK to user (null for defaults)                                                           |
| `created_at`         | INTEGER     | NO       | Timestamp                                                                                |
| `updated_at`         | INTEGER     | NO       | Timestamp                                                                                |

**Indexes**: category, exercise_type, created_by_user_id, name

---

### `workout`

Represents a workout session.

| Column         | Type    | Nullable | Description                                 |
| -------------- | ------- | -------- | ------------------------------------------- |
| `id`           | INTEGER | NO       | Primary key, auto-increment                 |
| `user_id`      | TEXT    | NO       | FK to user (CASCADE delete)                 |
| `name`         | TEXT    | YES      | Optional workout name                       |
| `notes`        | TEXT    | YES      | Workout notes                               |
| `started_at`   | INTEGER | NO       | When workout started                        |
| `completed_at` | INTEGER | YES      | When workout finished (null if in progress) |
| `created_at`   | INTEGER | NO       | Timestamp                                   |
| `updated_at`   | INTEGER | NO       | Timestamp                                   |

**Indexes**: user_id, started_at, completed_at

---

### `workout_exercise`

Links exercises to workouts with ordering.

| Column        | Type    | Nullable | Description                      |
| ------------- | ------- | -------- | -------------------------------- |
| `id`          | INTEGER | NO       | Primary key, auto-increment      |
| `workout_id`  | INTEGER | NO       | FK to workout (CASCADE delete)   |
| `exercise_id` | INTEGER | NO       | FK to exercise (RESTRICT delete) |
| `order`       | INTEGER | NO       | Order in workout (1-based)       |
| `notes`       | TEXT    | YES      | Exercise-specific notes          |
| `created_at`  | INTEGER | NO       | Timestamp                        |
| `updated_at`  | INTEGER | NO       | Timestamp                        |

**Indexes**: workout_id, exercise_id

---

### `exercise_set`

Individual sets within a workout exercise. Supports different exercise types.

| Column                | Type    | Nullable | Description                             |
| --------------------- | ------- | -------- | --------------------------------------- |
| `id`                  | INTEGER | NO       | Primary key, auto-increment             |
| `workout_exercise_id` | INTEGER | NO       | FK to workout_exercise (CASCADE delete) |
| `set_number`          | INTEGER | NO       | Set number (1-based)                    |
| `reps`                | INTEGER | YES      | Number of reps (strength)               |
| `weight`              | INTEGER | YES      | Weight in kg (strength)                 |
| `weight_unit`         | TEXT    | YES      | kg or lb                                |
| `duration_seconds`    | INTEGER | YES      | Duration (cardio/flexibility)           |
| `distance`            | INTEGER | YES      | Distance in meters (cardio)             |
| `distance_unit`       | TEXT    | YES      | km, mi, or m                            |
| `hold_time_seconds`   | INTEGER | YES      | Hold time (flexibility)                 |
| `notes`               | TEXT    | YES      | Set-specific notes                      |
| `created_at`          | INTEGER | NO       | Timestamp                               |
| `updated_at`          | INTEGER | NO       | Timestamp                               |

**Indexes**: workout_exercise_id

---

### `body_measurement`

Tracks body composition over time.

| Column                | Type    | Nullable | Description                 |
| --------------------- | ------- | -------- | --------------------------- |
| `id`                  | INTEGER | NO       | Primary key, auto-increment |
| `user_id`             | TEXT    | NO       | FK to user (CASCADE delete) |
| `measured_at`         | INTEGER | NO       | When measured               |
| `weight`              | REAL    | YES      | Body weight                 |
| `weight_unit`         | TEXT    | YES      | kg or lb                    |
| `body_fat_percentage` | REAL    | YES      | Body fat %                  |
| `chest`               | REAL    | YES      | Chest measurement           |
| `waist`               | REAL    | YES      | Waist measurement           |
| `hips`                | REAL    | YES      | Hips measurement            |
| `left_arm`            | REAL    | YES      | Left arm                    |
| `right_arm`           | REAL    | YES      | Right arm                   |
| `left_thigh`          | REAL    | YES      | Left thigh                  |
| `right_thigh`         | REAL    | YES      | Right thigh                 |
| `left_calf`           | REAL    | YES      | Left calf                   |
| `right_calf`          | REAL    | YES      | Right calf                  |
| `neck`                | REAL    | YES      | Neck                        |
| `shoulders`           | REAL    | YES      | Shoulders                   |
| `length_unit`         | TEXT    | YES      | cm or in                    |
| `notes`               | TEXT    | YES      | Notes                       |
| `created_at`          | INTEGER | NO       | Timestamp                   |
| `updated_at`          | INTEGER | NO       | Timestamp                   |

**Indexes**: user_id, measured_at

---

### `personal_record`

Tracks personal bests for exercises.

| Column            | Type    | Nullable | Description                                                                                  |
| ----------------- | ------- | -------- | -------------------------------------------------------------------------------------------- |
| `id`              | INTEGER | NO       | Primary key, auto-increment                                                                  |
| `user_id`         | TEXT    | NO       | FK to user (CASCADE delete)                                                                  |
| `exercise_id`     | INTEGER | NO       | FK to exercise (CASCADE delete)                                                              |
| `record_type`     | TEXT    | NO       | one_rep_max, max_weight, max_reps, max_volume, best_time, longest_duration, longest_distance |
| `value`           | REAL    | NO       | Record value                                                                                 |
| `display_unit`    | TEXT    | YES      | Display unit                                                                                 |
| `achieved_at`     | INTEGER | NO       | When achieved                                                                                |
| `workout_id`      | INTEGER | YES      | FK to workout (SET NULL on delete)                                                           |
| `exercise_set_id` | INTEGER | YES      | FK to exercise_set (SET NULL on delete)                                                      |
| `notes`           | TEXT    | YES      | Notes                                                                                        |
| `created_at`      | INTEGER | NO       | Timestamp                                                                                    |
| `updated_at`      | INTEGER | NO       | Timestamp                                                                                    |

**Indexes**: user_id, exercise_id, record_type, (user_id + exercise_id)

---

## Relationships

### One-to-Many

| Parent           | Child             | ON DELETE |
| ---------------- | ----------------- | --------- |
| user             | session           | CASCADE   |
| user             | account           | CASCADE   |
| user             | workout           | CASCADE   |
| user             | body_measurement  | CASCADE   |
| user             | personal_record   | CASCADE   |
| user             | exercise (custom) | CASCADE   |
| workout          | workout_exercise  | CASCADE   |
| workout_exercise | exercise_set      | CASCADE   |
| exercise         | workout_exercise  | RESTRICT  |
| exercise         | personal_record   | CASCADE   |

### Many-to-Many (via junction table)

- `workout` ↔ `exercise` (via `workout_exercise`)

---

## Drizzle Relations

Relations are split across schema files to avoid circular dependencies. Drizzle ORM automatically merges relations for the same table.

```typescript
// Example: Get workout with all exercises and sets
const workout = await db.query.workout.findFirst({
  where: eq(workout.id, workoutId),
  with: {
    user: true,
    workoutExercises: {
      with: {
        exercise: true,
        sets: true,
      },
    },
  },
});
```

---

## Data Flow Examples

### Creating a Workout

1. User starts workout → Insert into `workout`
2. User adds exercise → Insert into `workout_exercise`
3. User logs set → Insert into `exercise_set`
4. User completes workout → Update `workout.completedAt`
5. System calculates PRs → Insert/Update `personal_record`

### Tracking Progress

1. User logs body measurement → Insert into `body_measurement`
2. Query measurements over time for charts
3. Calculate changes between measurements

### Personal Records

PRs are calculated when a workout is completed:

- **one_rep_max**: Epley formula: weight × (1 + reps/30)
- **max_weight**: Highest weight lifted
- **max_reps**: Most reps at any weight
- **max_volume**: Highest weight × reps in single set
- **best_time**: Fastest time for distance (cardio)
- **longest_duration**: Longest time (cardio/flexibility)
- **longest_distance**: Longest distance (cardio)
