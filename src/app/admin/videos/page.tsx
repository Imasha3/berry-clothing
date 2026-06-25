"use client";

import { useEffect, useState } from "react";
import { AdminPage } from "@/components/admin/admin-page";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { Button, buttonStyles } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Video } from "@/types/video";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/videos");
      const data = await response.json().catch(() => []);
      if (response.ok) {
        setVideos(Array.isArray(data) ? data : []);
      } else {
        setFeedback(data?.error || "Could not load videos.");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not load videos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !videoFile) {
      setFeedback("Enter a title and choose a video file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("video", videoFile);

    setIsLoading(true);
    setUploadProgress(0);
    setFeedback("");

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/videos");
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        const result = JSON.parse(xhr.responseText || "{}") as Video & { error?: string };
        if (xhr.status >= 200 && xhr.status < 300) {
          setVideos((current) => [result, ...current]);
          setTitle("");
          setVideoFile(null);
          setUploadProgress(100);
          setFeedback("Video uploaded successfully.");
        } else {
          setFeedback(result.error || "Upload failed.");
        }
        setIsLoading(false);
        resolve();
      };
      xhr.onerror = () => {
        setFeedback("A network error occurred while uploading the video.");
        setIsLoading(false);
        resolve();
      };
      xhr.send(formData);
    });
  };

  const handleDelete = async (video: Video) => {
    if (!window.confirm("Delete this video? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/videos/${encodeURIComponent(video.publicId || video.id)}`, { method: "DELETE" });
      if (response.ok) {
        setVideos((current) => current.filter((entry) => entry.publicId !== video.publicId));
        setFeedback("Video deleted.");
      } else {
        const result = await response.json().catch(() => ({}));
        setFeedback(result.error || "Could not delete video.");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not delete video.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Media"
      title="Videos"
      description="Upload, manage, and remove videos used for product and brand storytelling."
    >
      <PermissionGuard permission="videos.manage" fallback={<p className="rounded-[24px] bg-white p-6 text-black/60 shadow-soft ring-1 ring-black/5">You do not have permission to manage videos.</p>}>
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
            <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">Upload video</p>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-semibold text-ink">
                  Video title
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter video title"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold text-ink">
                  Video file
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fcf6f2] px-4 py-3 text-sm"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleUpload} disabled={isLoading}>
                    {isLoading && uploadProgress > 0 ? `Uploading ${uploadProgress}%` : "Upload video"}
                  </Button>
                  <p className="text-sm text-black/60">Maximum file size: 250 MB.</p>
                </div>
                {isLoading && uploadProgress > 0 ? (
                  <div className="h-2 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-berry-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                ) : null}
                {feedback ? <p className="text-sm text-ink">{feedback}</p> : null}
              </div>
            </div>
            <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-berry-600">Video library</p>
                  <p className="mt-2 text-sm text-black/60">Review all uploaded videos and delete outdated assets.</p>
                </div>
                <Button variant="secondary" onClick={fetchVideos} disabled={isLoading}>
                  Refresh
                </Button>
              </div>
              <div className="mt-6 space-y-4">
                {videos.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-black/10 bg-[#fcf6f2] p-6 text-sm text-black/60">
                    No videos have been uploaded yet.
                  </div>
                ) : (
                  videos.map((video) => (
                    <div key={video.id} className="rounded-[24px] border border-black/10 bg-[#fcf6f2] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-ink">{video.title}</p>
                          <p className="mt-1 text-sm text-black/60">Uploaded {formatDate(video.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => void handleDelete(video)}
                          className={buttonStyles("secondary", "text-rose-600")}
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-4 overflow-hidden rounded-[20px] bg-black">
                        <video controls className="w-full rounded-[20px] bg-black">
                          <source src={video.videoUrl} type={`video/${video.format || "mp4"}`} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </AdminPage>
  );
}
