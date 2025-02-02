"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Flame, Bell, Brain, Smile, Sparkles, Cloud, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [reminders, setReminders] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      // Simulate loading of dashboard data
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [router]);

  useEffect(() => {
    setTimeout(() => {
      setStreak(5);
      setReminders([
        "Complete your daily mood check-in",
        "Practice mindfulness for 10 minutes",
        "Review your weekly progress",
      ]);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
        {/* Header Skeleton */}
        <header className="bg-white/50 backdrop-blur-sm border-b border-purple-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column Skeleton */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-purple-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Cloud className="h-8 w-8 text-purple-600 transition-transform group-hover:scale-110" />
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                Claude9
              </span>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="text-gray-600 hover:text-purple-600 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: CTA */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-purple-700">
                Welcome back!
              </CardTitle>
              <p className="text-gray-600">
                Start your daily mental wellness activities and keep your streak going!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Smile className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Current Status</h3>
                  <p className="text-sm text-gray-600">You're doing great! Keep the momentum going.</p>
                </div>
              </div>

              <Button 
                size="lg"
                onClick={() => router.push('/flow')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md shadow-purple-200 transition-all hover:shadow-lg hover:shadow-purple-200 mt-4"
              >
                Begin Today's Check-in
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Right Column: Streak and Reminders */}
          <div className="space-y-6">
            {/* Streak Card */}
            <Card className="bg-white/80 backdrop-blur-sm">
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
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-purple-700 flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-blue-500" />
                  Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
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
