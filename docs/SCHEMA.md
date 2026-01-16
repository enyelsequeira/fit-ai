# Fit AI Database Schema

This document provides a comprehensive overview of the Fit AI database schema, including entity relationships and future improvement plans.

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    %% ============ CORE AUTH ============
    user {
        text id PK
        text name
        text email UK
        boolean emailVerified
        text image
        timestamp createdAt
        timestamp updatedAt
    }

    session {
        text id PK
        text userId FK
        timestamp expiresAt
        text token UK
        text ipAddress
        text userAgent
    }

    account {
        text id PK
        text userId FK
        text accountId
        text providerId
        text accessToken
        text refreshToken
    }

    verification {
        text id PK
        text identifier
        text value
        timestamp expiresAt
    }

    %% ============ EXERCISE LIBRARY ============
    exercise {
        integer id PK
        text name
        text description
        text category
        json muscleGroups
        text equipment
        text exerciseType
        boolean isDefault
        text createdByUserId FK
        text primaryImage
        json images
        text videoUrl
        json instructions
        text level
        text force
        text mechanic
    }

    %% ============ WORKOUT SYSTEM ============
    workout {
        integer id PK
        text userId FK
        text name
        text notes
        timestamp startedAt
        timestamp completedAt
        integer templateId FK
        integer rating
        text mood
    }

    workout_exercise {
        integer id PK
        integer workoutId FK
        integer exerciseId FK
        integer order
        text notes
        integer supersetGroupId
    }

    exercise_set {
        integer id PK
        integer workoutExerciseId FK
        integer setNumber
        integer reps
        integer weight
        text weightUnit
        integer durationSeconds
        integer distance
        text setType
        integer rpe
        integer rir
        boolean isCompleted
    }

    %% ============ TEMPLATES ============
    template_folder {
        integer id PK
        text userId FK
        text name
        integer order
    }

    workout_template {
        integer id PK
        text userId FK
        integer folderId FK
        text name
        text description
        integer estimatedDurationMinutes
        boolean isPublic
        integer timesUsed
    }

    workout_template_exercise {
        integer id PK
        integer templateId FK
        integer exerciseId FK
        integer order
        integer targetSets
        text targetReps
        real targetWeight
        integer restSeconds
    }

    %% ============ GOALS ============
    goal {
        integer id PK
        text userId FK
        text goalType
        text title
        text description
        text status
        text direction
        real startWeight
        real targetWeight
        real currentWeight
        integer exerciseId FK
        real targetMeasurement
        integer targetWorkoutsPerWeek
        timestamp targetDate
        real progressPercentage
    }

    goal_progress {
        integer id PK
        integer goalId FK
        text userId FK
        real value
        real progressPercentage
        text note
        timestamp recordedAt
    }

    %% ============ BODY TRACKING ============
    body_measurement {
        integer id PK
        text userId FK
        timestamp measuredAt
        real weight
        real bodyFatPercentage
        real chest
        real waist
        real hips
        real leftArm
        real rightArm
        text notes
    }

    progress_photo {
        integer id PK
        text userId FK
        text photoUrl
        text thumbnailUrl
        timestamp takenAt
        text poseType
        integer bodyMeasurementId FK
        boolean isPrivate
    }

    %% ============ RECOVERY ============
    daily_check_in {
        integer id PK
        text userId FK
        text date
        real sleepHours
        integer sleepQuality
        integer energyLevel
        integer stressLevel
        integer sorenessLevel
        json soreAreas
        text mood
    }

    muscle_recovery {
        integer id PK
        text userId FK
        text muscleGroup
        integer recoveryScore
        integer fatigueLevel
        timestamp lastWorkedAt
        integer setsLast7Days
        real volumeLast7Days
    }

    %% ============ RECORDS & ANALYTICS ============
    personal_record {
        integer id PK
        text userId FK
        integer exerciseId FK
        text recordType
        real value
        timestamp achievedAt
        integer workoutId FK
        integer exerciseSetId FK
    }

    training_summary {
        integer id PK
        text userId FK
        text periodType
        text periodStart
        text periodEnd
        integer totalWorkouts
        integer totalSets
        real totalVolumeKg
        json volumeByMuscle
        integer prsAchieved
    }

    %% ============ AI SYSTEM ============
    user_training_preferences {
        integer id PK
        text userId FK UK
        text primaryGoal
        text experienceLevel
        integer workoutDaysPerWeek
        json availableEquipment
        text trainingLocation
        json preferredExercises
        text preferredSplit
    }

    ai_generated_workout {
        integer id PK
        text userId FK
        timestamp generatedAt
        json targetMuscleGroups
        text workoutType
        json generatedContent
        boolean wasUsed
        integer userRating
        integer workoutId
    }

    %% ============ SETTINGS ============
    user_settings {
        integer id PK
        text userId FK UK
        text weightUnit
        text distanceUnit
        text lengthUnit
        text theme
        text dateFormat
        integer defaultRestTimerSeconds
        boolean autoStartRestTimer
        boolean workoutReminders
    }

    %% ============ RELATIONSHIPS ============
    user ||--o{ session : has
    user ||--o{ account : has
    user ||--o{ exercise : creates
    user ||--o{ workout : performs
    user ||--o{ workout_template : owns
    user ||--o{ template_folder : organizes
    user ||--o{ goal : sets
    user ||--o{ goal_progress : tracks
    user ||--o{ body_measurement : records
    user ||--o{ progress_photo : uploads
    user ||--o{ daily_check_in : logs
    user ||--o{ muscle_recovery : monitors
    user ||--o{ personal_record : achieves
    user ||--o{ training_summary : aggregates
    user ||--|| user_training_preferences : configures
    user ||--|| user_settings : has
    user ||--o{ ai_generated_workout : generates

    workout ||--o{ workout_exercise : contains
    workout_exercise ||--o{ exercise_set : has
    workout_exercise }o--|| exercise : uses
    workout }o--o| workout_template : from

    workout_template ||--o{ workout_template_exercise : includes
    workout_template }o--o| template_folder : in
    workout_template_exercise }o--|| exercise : references

    goal ||--o{ goal_progress : tracks
    goal }o--o| exercise : targets

    progress_photo }o--o| body_measurement : correlates

    personal_record }o--|| exercise : for
    personal_record }o--o| workout : achieved_in
    personal_record }o--o| exercise_set : from
```

## 🗂️ Schema Overview

The database consists of **20 tables** organized into 8 domains:

| Domain               | Tables                                                             | Description                                        |
| -------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| **Auth**             | `user`, `session`, `account`, `verification`                       | User authentication and sessions                   |
| **Exercise Library** | `exercise`                                                         | 800+ exercises with images, instructions, metadata |
| **Workout System**   | `workout`, `workout_exercise`, `exercise_set`                      | Track workout sessions with sets/reps              |
| **Templates**        | `template_folder`, `workout_template`, `workout_template_exercise` | Reusable workout blueprints                        |
| **Goals**            | `goal`, `goal_progress`                                            | Weight, strength, measurement, frequency goals     |
| **Body Tracking**    | `body_measurement`, `progress_photo`                               | Physical measurements and progress photos          |
| **Recovery**         | `daily_check_in`, `muscle_recovery`                                | Wellness tracking and muscle fatigue               |
| **Analytics**        | `personal_record`, `training_summary`                              | PRs and aggregated training stats                  |
| **AI**               | `user_training_preferences`, `ai_generated_workout`                | AI workout generation                              |
| **Settings**         | `user_settings`                                                    | User preferences                                   |

## 📁 Schema Files

All schema definitions are in `packages/db/src/schema/`:

```
packages/db/src/schema/
├── auth.ts              # user, session, account, verification
├── exercise.ts          # exercise
├── workout.ts           # workout, workout_exercise, exercise_set
├── workout-template.ts  # template_folder, workout_template, workout_template_exercise
├── goals.ts             # goal, goal_progress
├── body-measurement.ts  # body_measurement
├── progress-photo.ts    # progress_photo
├── recovery.ts          # daily_check_in, muscle_recovery
├── personal-record.ts   # personal_record
├── analytics.ts         # training_summary
├── ai.ts                # user_training_preferences, ai_generated_workout
├── user-settings.ts     # user_settings
└── index.ts             # exports all schemas
```

## 🚀 Future Improvements

### High Priority

#### 1. Social Features & Community

- [ ] **User Following System**: Add `user_follows` table for social connections
- [ ] **Workout Sharing**: Share completed workouts with followers
- [ ] **Public Leaderboards**: Exercise-specific leaderboards for PRs
- [ ] **Workout Comments/Likes**: Add `workout_comment` and `workout_like` tables

#### 2. Advanced Training Features

- [ ] **Periodization Support**: Add `training_block` and `mesocycle` tables for structured programming
- [ ] **Deload Week Detection**: Auto-suggest deload based on fatigue accumulation
- [ ] **Volume Landmarks**: Track MV, MEV, MAV, MRV per muscle group
- [ ] **Fatigue Management**: Implement SFR (Stimulus to Fatigue Ratio) tracking

#### 3. Enhanced AI Capabilities

- [ ] **Workout Recommendations**: Use historical data for personalized suggestions
- [ ] **Auto-Regulation**: Adjust sets/reps based on daily readiness score
- [ ] **Exercise Substitutions**: Smart alternatives based on equipment/injuries
- [ ] **Progressive Overload Tracking**: Auto-suggest weight increases

### Medium Priority

#### 4. Nutrition Integration

- [ ] **Meal Logging**: Add `meal`, `food_item`, and `meal_food` tables
- [ ] **Calorie Tracking**: Daily calorie/macro goals with progress
- [ ] **Meal Planning**: Templates for nutrition similar to workout templates
- [ ] **Recipe Database**: User-submitted and curated recipes

#### 5. Wearable Integration

- [ ] **Heart Rate Zones**: Track HR during workouts from wearables
- [ ] **Sleep Data Sync**: Import sleep data from Apple Health/Garmin
- [ ] **Step Counting**: Daily activity tracking integration
- [ ] **HRV Trends**: Long-term HRV analysis for recovery optimization

#### 6. Enhanced Analytics

- [ ] **Muscle Balance Analysis**: Identify lagging muscle groups
- [ ] **Strength Standards**: Compare PRs to population percentiles
- [ ] **Workout Heatmap**: Calendar view of training consistency
- [ ] **Export Reports**: PDF/CSV export of training history

### Lower Priority

#### 7. Gamification

- [ ] **Achievement System**: Add `achievement` and `user_achievement` tables
- [ ] **Badges**: Unlock badges for milestones (100 workouts, 1000kg total volume, etc.)
- [ ] **Streaks**: Visual streak tracking with rewards
- [ ] **Challenges**: Time-limited community challenges

#### 8. Coaching Features

- [ ] **Coach-Client Relationship**: Add `coach_client` table
- [ ] **Program Assignment**: Coaches can assign templates to clients
- [ ] **Client Dashboard**: Coaches view client progress
- [ ] **Feedback System**: Coaches can comment on client workouts

#### 9. Performance Optimizations

- [ ] **Real-time Sync**: WebSocket support for live workout updates
- [ ] **Offline Mode**: Local-first with background sync
- [ ] **Image Optimization**: Compress and resize progress photos
- [ ] **Query Caching**: Redis/KV caching for frequent queries

## 🔗 Key Relationships

### User-Centric Design

Every table (except `verification`) relates back to `user`, enabling:

- Complete data isolation per user
- Cascade deletes when user is removed
- Easy user data export (GDPR compliance)

### Workout Flow

```
user → workout → workout_exercise → exercise_set
                       ↓
                   exercise (library)
```

### Template Flow

```
user → template_folder → workout_template → workout_template_exercise
                                                      ↓
                                                  exercise
```

### Goal Tracking

```
user → goal → goal_progress (history)
         ↓
     exercise (for strength goals)
```

### Recovery System

```
user → daily_check_in (subjective wellness)
   → muscle_recovery (calculated fatigue per muscle)
```
