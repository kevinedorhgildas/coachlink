"use client";

import { useState, useRef } from "react";

type Video = { id: string; url: string; legende: string | null };

export default function VideoPlayer({ videos }: { videos: Video[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = videos[activeIndex];

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Lecteur principal */}
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          key={active.url}
          src={active.url}
          controls
          autoPlay={false}
          className="w-full max-h-[65vh]"
        />
        <button
          onClick={handleFullscreen}
          className="absolute bottom-14 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/80 transition"
        >
          ⛶ Plein écran
        </button>
        {active.legende && (
          <div className="bg-gray-900 px-4 py-3">
            <p className="text-sm text-gray-300">{active.legende}</p>
          </div>
        )}
      </div>

      {/* Miniatures */}
      {videos.length > 1 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActiveIndex(i)}
              className={`relative overflow-hidden rounded-xl border-2 transition ${
                i === activeIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <video src={v.url} className="h-20 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-2xl text-white">▶</span>
              </div>
              {v.legende && (
                <p className="truncate bg-gray-900 px-2 py-1 text-left text-xs text-gray-400">{v.legende}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
