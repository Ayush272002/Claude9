"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import axios from "axios";

import config from "@/config.json";

const API_BASE_URL = config.apiBaseUrl;

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const payload = { email, password };

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/auth/signin`,
        payload
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        router.push("/dashboard"); 
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error: any) {
      if (error.response) {
        setError(
          error.response.data.message || "Login failed. Please try again."
        );
      } else if (error.request) {
        setError("No response received from the server.");
      } else {
        setError("An error occurred during login.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-between p-32 min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="w-3/5 p-8">
          <div>
            <div className="flex gap-2 items-center mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-12 w-32" />
            </div>
            <Skeleton className="h-8 w-96" />
          </div>
        </div>
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between p-32 min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <Link href="/" className="w-3/5 text-2xl font-bold text-purple-600 flex gap-2 items-center p-8">
        <div>
          <div className="text-4xl flex gap-2 items-center">
            <Cloud className="h-16 w-16 text-purple-600" />
            Claude9
          </div>
          <div className="text-2xl">Welcome back, I'm excited to see you again!</div>
        </div>
      </Link>
      <div className="bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Cloud className="h-12 w-12 text-purple-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Sign in to Claude9
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md shadow-purple-200 transition-all hover:shadow-lg hover:shadow-purple-200"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <Link
                href="/forgot-password"
                className="text-purple-600 hover:text-purple-700 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link href="/signup" className="text-purple-600 hover:text-purple-700 transition-colors">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
