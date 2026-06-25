"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/common/section-heading";
import type { Video } from "@/types/video";

export function LatestFashionVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/videos")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (isMounted) {
          setVideos(Array.isArray(data) ? data.slice(0, 4) : []);
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

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || videos.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Video Stories"
        title="Latest Fashion Videos"
        description="Explore our newest collections and style inspirations."
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {videos.map((video) => (
          <article
            key={video.publicId || video.id}
            className="group overflow-hidden rounded-[30px] border border-[#eed8dc] bg-white/90 p-4 shadow-[0_22px_45px_rgba(44,24,33,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(44,24,33,0.12)]"
          >
            <div className="overflow-hidden rounded-[24px] bg-black">
              <video
                className="aspect-[9/14] w-full object-cover"
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
            <h3 className="mt-4 line-clamp-2 font-display text-xl text-ink">{video.title || "Berry fashion video"}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
