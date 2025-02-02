/*
  Warnings:

  - The values [NEUTRAL] on the enum `Emotion` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `weather` on the `CheckIn` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Emotion_new" AS ENUM ('ENRAGED', 'PANICKED', 'STRESSED', 'FRUSTRATED', 'ANGRY', 'ANXIOUS', 'WORRIED', 'IRRITATED', 'ANNOYED', 'DISGUSTED', 'DISAPPOINTED', 'SAD', 'LONELY', 'HOPELESS', 'EXHAUSTED', 'DEPRESSED', 'BORED', 'DRAINED', 'SURPRISED', 'UPBEAT', 'FESTIVE', 'EXCITED', 'OPTIMISTIC', 'HAPPY', 'JOYFUL', 'HOPEFUL', 'BLISSFUL', 'AT_EASE', 'CONTENT', 'LOVING', 'GRATEFUL', 'CALM', 'RELAXED', 'RESTFUL', 'PEACEFUL', 'SERENE');
ALTER TABLE "CheckIn" ALTER COLUMN "init_mood" TYPE "Emotion_new" USING ("init_mood"::text::"Emotion_new");
ALTER TABLE "CheckIn" ALTER COLUMN "overall_sentiment" TYPE "Emotion_new" USING ("overall_sentiment"::text::"Emotion_new");
ALTER TYPE "Emotion" RENAME TO "Emotion_old";
ALTER TYPE "Emotion_new" RENAME TO "Emotion";
DROP TYPE "Emotion_old";
COMMIT;

-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "weather";
