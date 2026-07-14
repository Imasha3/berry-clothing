"use client";

import { useEffect, useState } from "react";
import type { Video } from "@/types/video";
import type { StoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";

export function LatestFashionVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/videos")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (isMounted) {
          setVideos(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVideos([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    fetchStoreSettings()
      .then((nextSettings) => {
        if (isMounted) {
          setSettings(nextSettings);
        }
      })
      .catch(() => {
        // Fallback handled by state default
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || videos.length === 0) {
    return null;
  }

  // Duplicate videos list to make sure marquee flows continuously without gaps
  const duplicatedVideos = [...videos, ...videos, ...videos, ...videos];

  return (
    <section className="py-20 bg-[#fffcfb] border-y border-black/[0.04] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-light text-center text-ink md:text-4xl lg:text-5xl leading-tight tracking-wide mb-12">
          Latest Reels & Video Stories
        </h2>
      </div>

      <div className="relative w-full overflow-hidden mt-8 py-4">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-scroll {
            display: flex;
            width: max-content;
            animation: marquee-scroll 55s linear infinite;
          }
          .animate-marquee-scroll:hover {
            animation-play-state: paused;
          }
        `}} />

        <div className="animate-marquee-scroll gap-6 px-4">
          {duplicatedVideos.map((video, idx) => (
            <article
              key={`${video.publicId || video.id}-${idx}`}
              className="group w-[220px] sm:w-[260px] md:w-[300px] shrink-0 overflow-hidden bg-white border border-[#eed8dc] p-3 shadow-soft transition duration-300 hover:translate-y-[-4px] hover:shadow-elevated"
            >
              <div className="overflow-hidden bg-black aspect-[9/16]">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  controls
                  playsInline
                  preload="none"
                >
                  <source src={video.videoUrl} type={`video/${video.format || "mp4"}`} />
                  Your browser does not support the video tag.
                </video>
              </div>
              <h3 className="mt-3 line-clamp-1 font-body text-xs font-semibold tracking-wide text-ink/80 text-center">
                {video.title || "Berry fashion video"}
              </h3>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href={settings.socialLinks?.instagram || "https://www.instagram.com/"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center border border-ink bg-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-transparent hover:text-ink"
        >
          View More on Instagram
        </a>
      </div>
    </section>
  );
}
