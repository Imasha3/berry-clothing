"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/common/section-heading";
import type { Video } from "@/types/video";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/videos")
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 py-10">
      <SectionHeading
        eyebrow="Media"
        title="Video Gallery"
        description="Explore all brand and product videos in an HTML5 player with responsive playback support."
      />
      {isLoading ? (
        <div className="rounded-[28px] bg-white p-8 text-center text-sm text-black/60 shadow-soft ring-1 ring-black/5">Loading videos…</div>
      ) : videos.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center text-sm text-black/60 shadow-soft ring-1 ring-black/5">
          No videos found. Check back later.
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {videos.map((video) => (
            <div key={video.id} className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">{video.title}</p>
                <p className="mt-2 text-sm text-black/60">Uploaded {new Date(video.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="overflow-hidden rounded-[24px] bg-black">
                <video controls className="w-full rounded-[24px] bg-black">
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
