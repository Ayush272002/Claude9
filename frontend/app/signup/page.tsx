"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

import config from "@/config.json";

const API_BASE_URL = config.apiBaseUrl;

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match. Please try again.",
      });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/signup`, {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        const { token } = response.data; 
        localStorage.setItem("token", token);

        toast({
          title: "Account created!",
          description:
            "Welcome to Claude9. Redirecting you to the onboarding process...",
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err: any) {
      setError("An error occurred during sign-up. Please try again.");
      toast({
        variant: "destructive",
        title: "Sign-up failed",
        description: "An error occurred during sign-up. Please try again.",
      });
    }
  };

  return (
    <div className="flex justify-between p-32 min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <Link href="/" className="w-3/5 text-2xl font-bold text-purple-600 flex gap-2 items-center p-8">
        <div>
          <div className="text-4xl flex gap-2 items-center">
              <Cloud className="h-16 w-16 text-purple-600" />
              Claude9
            </div>
          <div className="text-2xl">Understand your emotions, track your mental health, and get personalized support - all with the power of AI.</div>
        </div>
      </Link>
      <div className="bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Cloud className="h-12 w-12 text-purple-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Create your Claude9 account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your details to start your mental health journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
