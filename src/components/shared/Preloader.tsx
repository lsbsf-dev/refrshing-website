"use client";

/**
 * @file Preloader.tsx
 * @description Initial loading preloader overlay displayed while bootstrapping session data.
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const minTime = new Promise((resolve) => setTimeout(resolve, 1500));
      
      const imagePromises = Array.from(document.images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if an image fails
        });
      });

      await Promise.all([minTime, ...imagePromises]);
      
      setFade(true);
      
      setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms matches transition duration
    };

    requestAnimationFrame(() => {
      loadImages();
    });
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF6EE] transition-opacity duration-500 ease-in-out ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6">
        <Image
          src="/refreshing-logo.png"
          alt="Loading..."
          fill
          className="object-contain animate-pulse"
          priority
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#C25627] animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-[#C25627] animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-[#C25627] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
