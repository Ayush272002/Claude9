-- CreateEnum
CREATE TYPE "Emotion" AS ENUM ('HAPPY', 'SAD', 'ANGRY', 'NEUTRAL', 'EXCITED', 'CALM', 'ANXIOUS');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "opt_out_of_memes" BOOLEAN NOT NULL DEFAULT false,
    "utc_offset" INTEGER NOT NULL,
    "daily_reminder_freq" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "checkin_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "weather" TEXT,
    "played_sport" BOOLEAN NOT NULL DEFAULT false,
    "met_friends" BOOLEAN NOT NULL DEFAULT false,
    "slept_well" BOOLEAN NOT NULL DEFAULT false,
    "init_mood" "Emotion" NOT NULL,
    "overall_sentiment" "Emotion" NOT NULL,
    "thoughts" TEXT NOT NULL,
    "insights_actions" TEXT NOT NULL,
    "playlist" TEXT,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("checkin_id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "reminder_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_time_key" ON "CheckIn"("time");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
