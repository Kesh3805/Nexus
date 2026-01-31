-- CRITICAL SECURITY PATCH: Prevent Quiz XP Farming Exploit
-- Execute this migration BEFORE deploying to any environment
-- Priority: P0 (Release Blocker)

-- Add attemptedDate column to track daily attempts
ALTER TABLE `QuizAttempt` 
ADD COLUMN `attemptedDate` DATE AS (DATE(`attemptedAt`)) STORED;

-- Create unique constraint: one attempt per quiz per day
-- This prevents infinite XP farming by replaying same quiz
ALTER TABLE `QuizAttempt`
ADD CONSTRAINT `unique_daily_quiz_attempt`
UNIQUE (`userId`, `quizId`, `attemptedDate`);

-- Add index for performance on queries filtering by date
CREATE INDEX `idx_quiz_attempt_user_date` 
ON `QuizAttempt`(`userId`, `attemptedDate`);

-- Optional: Add check constraints for data integrity
-- (MySQL 8.0.16+ only)
ALTER TABLE `User`
ADD CONSTRAINT `chk_positive_gems` CHECK (`gems` >= 0),
ADD CONSTRAINT `chk_positive_coins` CHECK (`coins` >= 0),
ADD CONSTRAINT `chk_positive_xp` CHECK (`xp` >= 0);

-- Verify migration
SELECT 
  COUNT(*) as total_attempts,
  COUNT(DISTINCT userId, quizId, attemptedDate) as unique_daily_attempts,
  COUNT(*) - COUNT(DISTINCT userId, quizId, attemptedDate) as duplicate_attempts
FROM QuizAttempt;

-- If duplicate_attempts > 0, there are existing duplicates
-- Handle manually or run cleanup:
-- DELETE qa1 FROM QuizAttempt qa1
-- INNER JOIN QuizAttempt qa2
-- WHERE qa1.id > qa2.id 
--   AND qa1.userId = qa2.userId
--   AND qa1.quizId = qa2.quizId
--   AND DATE(qa1.attemptedAt) = DATE(qa2.attemptedAt);
