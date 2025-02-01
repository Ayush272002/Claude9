"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Brain, Smile, Sparkles, Music, Zap, Cloud } from "lucide-react";
import type React from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-purple-600 cursor-pointer flex gap-2 items-center">
            <Cloud className="h-8 w-8 text-purple-600" />
            <div>Claude9</div>
          </div>
          <div className="space-x-4">
            <Link
              href="#features"
              className="text-gray-600 hover:text-purple-600"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-purple-600"
            >
              How It Works
            </Link>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Log In
            </Button>
            <Button onClick={() => router.push("/signup")}>Sign Up</Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-800">
            Your AI-Powered Mental Health Companion
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            Understand your emotions, track your mental health, and get
            personalized support - all with the power of AI.
          </p>
          <Button size="lg" className="text-lg">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        <section id="features" className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-12 w-12 text-purple-500" />}
              title="AI-Driven Journaling"
              description="Get personalized prompts and affirmations to help you explore your thoughts and feelings."
            />
            <FeatureCard
              icon={<Smile className="h-12 w-12 text-purple-500" />}
              title="Mood Tracking & Analysis"
              description="Understand your emotional patterns with advanced sentiment analysis and trend visualization."
            />
            <FeatureCard
              icon={<Sparkles className="h-12 w-12 text-purple-500" />}
              title="Meme Therapy"
              description="Enjoy personalized, mood-boosting memes generated just for you by our AI."
            />
            <FeatureCard
              icon={<Music className="h-12 w-12 text-purple-500" />}
              title="Music Mood Matching"
              description="Discover playlists that match your current mood or help shift your emotions."
            />
            <FeatureCard
              icon={<Zap className="h-12 w-12 text-purple-500" />}
              title="Custom Self-Care Activities"
              description="Get tailored recommendations for activities to improve your mental well-being."
            />
            <FeatureCard
              icon={<ArrowRight className="h-12 w-12 text-purple-500" />}
              title="Professional Support Integration"
              description="Seamlessly connect with therapists when you need extra support."
            />
          </div>
        </section>

        <section id="how-it-works" className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">
            How It Works
          </h2>
          <div className="max-w-2xl mx-auto">
            <ol className="list-decimal text-left space-y-4 text-gray-600">
              <li>Sign up and create your personal profile</li>
              <li>Complete daily check-ins and journal entries</li>
              <li>
                Receive AI-generated insights and personalized recommendations
              </li>
              <li>Track your mood trends and progress over time</li>
              <li>
                Engage with mood-boosting features like Meme Therapy and Music
                Matching
              </li>
              <li>Connect with professional support when needed</li>
            </ol>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">
            Start Your Mental Health Journey Today
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of users who are taking control of their mental
            well-being with Claude9 AI.
          </p>
          <Button size="lg" className="text-lg">
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Claude9. All rights reserved.</p>
          <div className="mt-4">
            <Link href="#" className="text-gray-600 hover:text-purple-600 mx-2">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-600 hover:text-purple-600 mx-2">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-600 hover:text-purple-600 mx-2">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
