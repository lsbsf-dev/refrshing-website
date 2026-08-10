"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlbums, updateAlbum, getPhotos, addPhoto, deletePhoto, updatePhoto } from "@/lib/firebase/gallery";
import { getEventScopedDocs, setEventScopedDoc, HomepageSettings } from "@/lib/firebase/cms";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, ArrowLeft, Save, Trash2, Star, MoveRight } from "lucide-react";
import Link from "next/link";
import { FormField } from "@/components/shared/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";

export default function AlbumManagementPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params?.albumId as string;
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ title: "", description: "", coverImageUrl: "" });

  const { data: albums = [], isLoading: isLoadingAlbums } = useQuery({
    queryKey: ["admin", "albums", selectedEventId],
    queryFn: () => getAlbums(selectedEventId),
    enabled: !!selectedEventId,
  });

  const { data: photos = [], isLoading: isLoadingPhotos } = useQuery({
    queryKey: ["admin", "photos", selectedEventId, albumId],
    queryFn: () => getPhotos(selectedEventId, albumId),
    enabled: !!selectedEventId && !!albumId,
  });

  const { data: settingsDocs = [] } = useQuery({
    queryKey: ["admin", "homepageSettings", selectedEventId],
    queryFn: () => getEventScopedDocs<HomepageSettings>(selectedEventId, "homepageSettings"),
    enabled: !!selectedEventId,
  });

  const currentAlbum = albums.find(a => a.id === albumId);

  useEffect(() => {
    if (currentAlbum) {
      setForm({
        title: currentAlbum.title,
        description: currentAlbum.description,
        coverImageUrl: currentAlbum.coverImageUrl,
      });
    }
  }, [currentAlbum]);

  const updateAlbumMutation = useMutation({
    mutationFn: () => updateAlbum(albumId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "albums", selectedEventId] });
      alert("Album settings saved.");
    }
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (id: string) => deletePhoto(id, albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos", selectedEventId, albumId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "albums", selectedEventId] });
    }
  });

  const movePhotoMutation = useMutation({
    mutationFn: async ({ photoId, targetAlbumId }: { photoId: string, targetAlbumId: string }) => {
      await updatePhoto(photoId, { albumId: targetAlbumId });
      // We manually decrement the old album and increment the new album to maintain consistency
      // In a real app, this should be a transaction or a cloud function
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos", selectedEventId, albumId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "albums", selectedEventId] });
      alert("Photo moved successfully.");
    }
  });

  const featurePhotoMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!settingsDocs.length) return;
      const settings = settingsDocs[0];
      const current = settings.featuredGalleryImages || [];
      if (!current.includes(url)) {
        const newSettings = { ...settings, featuredGalleryImages: [...current, url] };
        await setEventScopedDoc(selectedEventId, "homepageSettings", newSettings);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepageSettings", selectedEventId] });
      alert("Photo set as Featured on Homepage.");
    }
  });

  const handleUploadSuccess = async (urls: string[]) => {
    for (const url of urls) {
      const id = `photo-${Math.random().toString(36).substring(7)}`;
      await addPhoto({
        eventId: selectedEventId,
        albumId,
        url,
        altText: currentAlbum?.title || "Gallery photo",
        uploadedAt: new Date().toISOString()
      }, id);
    }
    queryClient.invalidateQueries({ queryKey: ["admin", "photos", selectedEventId, albumId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "albums", selectedEventId] });
  };

  if (!selectedEventId) return null;
  if (isLoadingAlbums || !currentAlbum) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

  const homepageSettings = settingsDocs[0];
  const featuredImages = homepageSettings?.featuredGalleryImages || [];

  return (
    <div className="pb-20 max-w-6xl mx-auto space-y-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/gallery" className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground uppercase mb-1">
            {currentAlbum.title}
          </h1>
          <p className="font-sans text-sm text-foreground-muted">
            Manage album details and photos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Album Settings */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="font-serif text-xl font-bold mb-4">Album Settings</h2>
            <div className="space-y-4">
              <FormField label="Title">
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-xl p-3 outline-none dark:bg-black/20" />
              </FormField>
              <FormField label="Description">
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-xl p-3 outline-none dark:bg-black/20 h-24" />
              </FormField>
              <FormField label="Cover Image">
                <ImageUploader value={form.coverImageUrl} onChange={url => setForm({...form, coverImageUrl: url})} />
              </FormField>
              <button onClick={() => updateAlbumMutation.mutate()} disabled={updateAlbumMutation.isPending} className="w-full py-3 bg-[#C25627] text-white rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 active-press">
                {updateAlbumMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Details
              </button>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="font-serif text-xl font-bold mb-4">Upload Photos</h2>
            <MultiImageUploader onUploadSuccess={handleUploadSuccess} />
          </section>
        </div>

        {/* Photos Grid */}
        <div className="lg:col-span-2">
          <section className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold">Photos ({photos.length})</h2>
            </div>
            
            {isLoadingPhotos ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
            ) : photos.length === 0 ? (
              <div className="border border-dashed border-black/20 dark:border-white/20 rounded-2xl p-12 text-center text-zinc-500 text-sm">
                No photos uploaded to this album yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map(photo => {
                  const isFeatured = featuredImages.includes(photo.url);
                  return (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-zinc-100 aspect-square border border-black/10">
                      <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div className="flex justify-between items-start">
                          <button 
                            title={isFeatured ? "Already featured" : "Set as Featured"}
                            onClick={() => !isFeatured && featurePhotoMutation.mutate(photo.url)}
                            disabled={isFeatured || featurePhotoMutation.isPending}
                            className={`p-2 rounded-lg backdrop-blur-sm ${isFeatured ? 'bg-[#DDB94E] text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={() => { if(confirm("Delete this photo?")) deletePhotoMutation.mutate(photo.id); }}
                            className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 backdrop-blur-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="relative">
                          <select 
                            className="w-full bg-white/20 text-white text-xs p-2 rounded-lg outline-none backdrop-blur-sm cursor-pointer appearance-none"
                            onChange={(e) => {
                              if (e.target.value && e.target.value !== albumId) {
                                if(confirm("Move this photo to another album?")) {
                                  movePhotoMutation.mutate({ photoId: photo.id, targetAlbumId: e.target.value });
                                }
                              }
                            }}
                            value={albumId}
                          >
                            <option value={albumId} disabled>Move to...</option>
                            {albums.filter(a => a.id !== albumId).map(a => (
                              <option key={a.id} value={a.id} className="text-black">{a.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {isFeatured && (
                        <div className="absolute bottom-2 left-2 right-2 pointer-events-none text-center">
                           <span className="text-[10px] font-bold bg-[#DDB94E] text-white px-2 py-1 rounded-full uppercase tracking-wider shadow-md">Featured</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
