"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
}

export function TestimonialSlider({ reviews }: { reviews: Review[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
        setIsFading(false);
      }, 500); // 500ms match transition speed
    }, 6000); // Change review every 6 seconds

    return () => clearInterval(interval);
  }, [reviews.length]);

  if (!reviews || reviews.length === 0) return null;

  const currentReview = reviews[currentIndex];

  const handleDotClick = (idx: number) => {
    if (idx === currentIndex) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsFading(false);
    }, 500);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 py-8">
      {/* Testimonial Card */}
      <div className="relative overflow-hidden border border-[#ead4d8] bg-[#fffcfd] p-8 sm:p-12 md:p-16 text-center shadow-soft min-h-[320px] sm:min-h-[280px] flex flex-col justify-center items-center">
        <div
          className={cn(
            "transition-all duration-500 ease-in-out flex flex-col items-center",
            isFading ? "opacity-0 translate-y-2 scale-[0.98]" : "opacity-100 translate-y-0 scale-100"
          )}
        >
          {/* Star Rating */}
          <div className="flex justify-center gap-1.5 mb-6 text-[#d4af37]">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={i < currentReview.rating ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7 transition-all duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499c.196-.612 1.056-.612 1.252 0l1.833 5.714a1 1 0 00.95.69h5.97c.642 0 .908.82.389 1.187l-4.83 3.507a1 1 0 00-.364 1.118l1.832 5.714c.197.613-.507 1.127-1.026.74l-4.83-3.507a1 1 0 00-1.175 0l-4.83 3.507c-.52.388-1.224-.127-1.026-.74l1.832-5.714a1 1 0 00-.364-1.118L2.26 11.09c-.52-.367-.253-1.187.39-1.187h5.97a1 1 0 00.95-.69l1.833-5.715z"
                />
              </svg>
            ))}
          </div>

          {/* Comment */}
          <blockquote className="font-display text-xl leading-relaxed text-ink font-light italic md:text-2xl max-w-2xl">
            &ldquo;{currentReview.comment}&rdquo;
          </blockquote>

          {/* Author */}
          <cite className="mt-6 block font-body text-xs font-semibold uppercase tracking-[0.25em] text-berry-700 not-italic">
            {currentReview.customerName}
          </cite>
        </div>
      </div>

      {/* Nav Dots */}
      {reviews.length > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-[2px] transition-all duration-300",
                idx === currentIndex ? "w-8 bg-berry-600" : "w-3 bg-black/20 hover:bg-black/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
