"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlbums, createAlbum, deleteAlbum, getVideos, addVideo, deleteVideo } from "@/lib/firebase/gallery";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, Plus, ImageIcon, VideoIcon, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/FormField";

export default function AdminGalleryDashboard() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumSlug, setAlbumSlug] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");

  const { data: albums = [], isLoading: isLoadingAlbums } = useQuery({
    queryKey: ["admin", "albums", selectedEventId],
    queryFn: () => getAlbums(selectedEventId),
    enabled: !!selectedEventId,
  });

  const { data: videos = [], isLoading: isLoadingVideos } = useQuery({
    queryKey: ["admin", "videos", selectedEventId],
    queryFn: () => getVideos(selectedEventId),
    enabled: !!selectedEventId,
  });

  const createAlbumMutation = useMutation({
    mutationFn: async () => {
      const id = `album-${Date.now()}`;
      await createAlbum({
        eventId: selectedEventId,
        slug: albumSlug,
        title: albumTitle,
        description: albumDesc,
        coverImageUrl: "",
        photoCount: 0,
        status: "published"
      }, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "albums", selectedEventId] });
      setIsAlbumModalOpen(false);
      setAlbumTitle("");
      setAlbumSlug("");
      setAlbumDesc("");
    }
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: (id: string) => deleteAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "albums", selectedEventId] });
    }
  });

  const addVideoMutation = useMutation({
    mutationFn: async () => {
      const id = `vid-${Date.now()}`;
      await addVideo({
        eventId: selectedEventId,
        title: videoTitle,
        youtubeId: youtubeId,
        description: "",
        publishedAt: new Date().toISOString()
      }, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "videos", selectedEventId] });
      setIsVideoModalOpen(false);
      setVideoTitle("");
      setYoutubeId("");
    }
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "videos", selectedEventId] });
    }
  });

  if (!selectedEventId) return null;

  return (
    <div className="pb-20 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground uppercase mb-1">
          Gallery & Media Library
        </h1>
        <p className="font-sans text-sm text-foreground-muted">
          Manage photo albums and YouTube video embeds for this event.
        </p>
      </div>

      {/* ALBUMS SECTION */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-[#C25627]" />
            Photo Albums
          </h2>
          <button
            onClick={() => setIsAlbumModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C25627] text-white rounded-xl text-sm font-bold active-press"
          >
            <Plus className="h-4 w-4" />
            New Album
          </button>
        </div>

        {isLoadingAlbums ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
        ) : albums.length === 0 ? (
          <div className="border border-dashed border-black/20 dark:border-white/20 rounded-2xl p-12 text-center text-zinc-500 text-sm">
            No albums found for this event.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative">
                  {album.coverImageUrl ? (
                    <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <ImageIcon className="h-8 w-8 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                      {album.photoCount} photos
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{album.title}</h3>
                  <p className="text-sm text-zinc-500 truncate mb-4">{album.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Link href={`/admin/gallery/${album.id}`} className="text-sm font-bold text-[#C25627] hover:underline flex items-center gap-1">
                      Manage Photos <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button onClick={() => { if(confirm("Delete album?")) deleteAlbumMutation.mutate(album.id); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VIDEOS SECTION */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <VideoIcon className="h-6 w-6 text-red-500" />
            YouTube Videos
          </h2>
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold active-press"
          >
            <Plus className="h-4 w-4" />
            Embed Video
          </button>
        </div>

        {isLoadingVideos ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
        ) : videos.length === 0 ? (
          <div className="border border-dashed border-black/20 dark:border-white/20 rounded-2xl p-12 text-center text-zinc-500 text-sm">
            No videos embedded for this event.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div key={vid.id} className="bg-surface border border-border rounded-2xl overflow-hidden p-4 flex gap-4">
                <div className="w-24 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                  <img src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover" alt="thumbnail" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{vid.title}</h3>
                  <a href={`https://youtube.com/watch?v=${vid.youtubeId}`} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:underline">Watch on YouTube</a>
                </div>
                <button onClick={() => { if(confirm("Delete video?")) deleteVideoMutation.mutate(vid.id); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg shrink-0 h-min">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Album Modal */}
      {isAlbumModalOpen && (
        <Modal onClose={() => setIsAlbumModalOpen(false)} title="Create New Album">
          <div className="space-y-4">
            <FormField label="Album Title">
              <input type="text" value={albumTitle} onChange={e => { setAlbumTitle(e.target.value); setAlbumSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} className="w-full border rounded-xl p-3 outline-none dark:bg-black/20" />
            </FormField>
            <FormField label="Slug (URL friendly)">
              <input type="text" value={albumSlug} onChange={e => setAlbumSlug(e.target.value)} className="w-full border rounded-xl p-3 outline-none dark:bg-black/20" />
            </FormField>
            <FormField label="Description">
              <textarea value={albumDesc} onChange={e => setAlbumDesc(e.target.value)} className="w-full border rounded-xl p-3 outline-none dark:bg-black/20" />
            </FormField>
            <button onClick={() => createAlbumMutation.mutate()} disabled={createAlbumMutation.isPending || !albumTitle} className="w-full py-3 bg-[#C25627] text-white rounded-xl font-bold flex justify-center disabled:opacity-50 active-press">
              {createAlbumMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Album"}
            </button>
          </div>
        </Modal>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <Modal onClose={() => setIsVideoModalOpen(false)} title="Embed YouTube Video">
          <div className="space-y-4">
            <FormField label="Video Title">
              <input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="w-full border rounded-xl p-3 outline-none dark:bg-black/20" />
            </FormField>
            <FormField label="YouTube ID (e.g. dQw4w9WgXcQ)">
              <input type="text" value={youtubeId} onChange={e => setYoutubeId(e.target.value)} className="w-full border rounded-xl p-3 outline-none dark:bg-black/20" />
            </FormField>
            <button onClick={() => addVideoMutation.mutate()} disabled={addVideoMutation.isPending || !youtubeId} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold flex justify-center disabled:opacity-50 active-press">
              {addVideoMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Embed Video"}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}
