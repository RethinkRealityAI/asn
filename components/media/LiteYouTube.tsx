"use client";

/**
 * LiteYouTube — performant click-to-load YouTube player.
 *
 * Shows the video thumbnail + a play button; only injects the (privacy-friendly,
 * nocookie) iframe once the user clicks. Keeps the page light and avoids
 * loading YouTube on every visit. Rounded corners, never blue.
 */

import { useState } from "react";

interface LiteYouTubeProps {
  id: string;
  title: string;
  className?: string;
}

export function LiteYouTube({ id, title, className }: LiteYouTubeProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={
        "media-rounded relative aspect-video w-full bg-espresso " + (className ?? "")
      }
    >
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.includes("hqdefault")) {
                img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
              }
            }}
          />
          {/* warm scrim for legible play button */}
          <span aria-hidden className="absolute inset-0 bg-espresso/25 transition-colors group-hover:bg-espresso/15" />
          {/* play button */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-lg transition-transform duration-300 group-hover:scale-110"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-6 w-6">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
