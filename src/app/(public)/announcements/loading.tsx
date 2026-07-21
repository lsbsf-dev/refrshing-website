/**
 * Announcements Loading Component
 * Skeleton loader page.
 */

import React from "react";

export default function AnnouncementsLoading() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
      <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-36 pb-24 px-6 md:px-16 border-b border-white/5" />
      <div className="max-w-3xl mx-auto w-full py-28 px-6 flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white border border-black/5" />
        ))}
      </div>
    </div>
  );
}
