"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import config from "@/config.json";

const API_BASE_URL = config.apiBaseUrl;

interface Meme {
  id: number;
  imageUrl: string;
  caption: string;
}

export default function MemeGenerator() {
  const [currentMeme, setCurrentMeme] = useState<Meme>({
    id: 1,
    imageUrl: "/placeholder.svg?height=400&width=400",
    caption: "Click next to generate your first meme!",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to generate meme
  const generateMeme = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized: Please log in first.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/memes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate meme");
      }

      const newMeme = await response.json();
      setCurrentMeme(newMeme);
    } catch (err) {
      setError("Failed to generate meme. Please try again.");
      console.error("Error generating meme:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Use effect hook to generate meme on page load
  useEffect(() => {
    generateMeme();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-700">
            Claude9 Meme Therapy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-full aspect-square mb-4">
            <Image
              src={currentMeme.imageUrl}
              alt="Meme"
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
            />
          </div>
          {error ? (
            <p className="text-red-500 text-center mb-4">{error}</p>
          ) : (
            <p className="text-lg font-semibold text-center text-gray-800">
              {currentMeme.caption}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={generateMeme}
            className="flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Next Meme
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
