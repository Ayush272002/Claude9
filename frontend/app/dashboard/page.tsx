"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Flame, Bell } from "lucide-react";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [streak, setStreak] = useState(0);
  const [reminders, setReminders] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setUserName("Sarah");
      setStreak(5);
      setReminders([
        "Complete your daily mood check-in",
        "Practice mindfulness for 10 minutes",
        "Review your weekly progress",
      ]);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-purple-800">
          Welcome back!
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: CTA */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-purple-700">
                Ready for Today's Journey?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Start your daily mental wellness activities and keep your streak
                going!
              </p>
              <Button asChild>
                <Link
                  href="/daily-activities"
                  className="inline-flex items-center"
                >
                  Begin Today's Activities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Right Column: Streak and Reminders */}
          <div className="space-y-6">
            {/* Streak Card */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-purple-700 flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-orange-500" />
                  Your Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-orange-500">
                  {streak} days
                </p>
                <p className="text-gray-600">Keep up the great work!</p>
              </CardContent>
            </Card>

            {/* Reminders Card */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-purple-700 flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-blue-500" />
                  Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reminders.map((reminder, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-2"></span>
                      <span className="text-gray-600">{reminder}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
