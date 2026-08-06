"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventScopedDocs, Article, BibleStudy, Devotional, Advertisement, Download } from "@/lib/firebase/cms";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, FileText, Download as DownloadIcon, ExternalLink, Calendar, User } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

export function ProgrammeExtras({ eventId, activeDayLabel }: { eventId: string, activeDayLabel?: string }) {
  const { data: articles = [] } = useQuery({
    queryKey: ["public", "articles", eventId],
    queryFn: () => getEventScopedDocs<Article>(eventId, "articles"),
    enabled: !!eventId,
  });

  const { data: bibleStudies = [] } = useQuery({
    queryKey: ["public", "bibleStudies", eventId],
    queryFn: () => getEventScopedDocs<BibleStudy>(eventId, "bibleStudies"),
    enabled: !!eventId,
  });

  const { data: devotionals = [] } = useQuery({
    queryKey: ["public", "devotionals", eventId],
    queryFn: () => getEventScopedDocs<Devotional>(eventId, "devotionals"),
    enabled: !!eventId,
  });

  const { data: ads = [] } = useQuery({
    queryKey: ["public", "ads", eventId],
    queryFn: () => getEventScopedDocs<Advertisement>(eventId, "advertisements"),
    enabled: !!eventId,
  });

  const { data: downloads = [] } = useQuery({
    queryKey: ["public", "downloads", eventId],
    queryFn: () => getEventScopedDocs<Download>(eventId, "downloads"),
    enabled: !!eventId,
  });

  const pubArticles = articles.filter(a => a.status === 'published').sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  const pubBibleStudies = bibleStudies.filter(b => b.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0));
  const pubDevotionals = devotionals.filter(d => d.status === 'published' && (!activeDayLabel || d.day.toLowerCase() === activeDayLabel.toLowerCase())).sort((a, b) => (a.order || 0) - (b.order || 0));
  const pubAds = ads.filter(a => a.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0));
  const pubDownloads = downloads.filter(d => d.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0));

  const [expandedStudyId, setExpandedStudyId] = useState<string | null>(null);
  const [expandedDevoId, setExpandedDevoId] = useState<string | null>(null);

  if (!pubArticles.length && !pubBibleStudies.length && !pubDevotionals.length && !pubAds.length && !pubDownloads.length) {
    return null;
  }

  return (
    <div className="w-full bg-[#FAF6EE] text-[#0B0907] flex flex-col gap-16 py-12 px-4 sm:px-6 md:px-16 border-t border-black/5">
      
      {/* ADVERTISEMENTS (INLINE) */}
      {pubAds.length > 0 && (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pubAds.map(ad => (
            <a key={ad.id} href={ad.linkUrl || "#"} target={ad.linkUrl ? "_blank" : "_self"} rel="noopener noreferrer" className="block relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-black/10 shadow-sm group">
              {ad.imageUrl && <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                <span className="text-white/70 font-mono text-xs uppercase tracking-widest mb-1">{ad.sponsor}</span>
                <h4 className="text-white font-serif text-xl sm:text-2xl font-bold leading-tight mb-2">{ad.title}</h4>
                {ad.description && <p className="text-white/80 font-sans text-sm line-clamp-2">{ad.description}</p>}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* DEVOTIONALS ACCORDION */}
      {pubDevotionals.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-6 flex items-center gap-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#0B0907]">Daily Devotionals</h3>
            <div className="h-[1px] flex-1 bg-black/10"></div>
          </div>
          <div className="flex flex-col gap-4">
            {pubDevotionals.map(devo => (
              <div key={devo.id} className="border border-black/10 rounded-2xl bg-white overflow-hidden shadow-sm">
                <button 
                  onClick={() => setExpandedDevoId(expandedDevoId === devo.id ? null : devo.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-black/5 transition-colors"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-[#C25627] tracking-widest uppercase mb-1 block">{devo.day} • {devo.author}</span>
                    <h4 className="font-serif text-xl font-semibold">{devo.title}</h4>
                    {devo.scripture && <span className="font-sans text-sm text-zinc-500 italic mt-1 block">{devo.scripture}</span>}
                  </div>
                  <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform ${expandedDevoId === devo.id ? 'rotate-180' : ''}`} />
                </button>
                {expandedDevoId === devo.id && (
                  <div className="p-6 pt-0 border-t border-black/5 mt-2 bg-white">
                    <div 
                      className="prose prose-sm sm:prose-base prose-zinc max-w-none pt-4 font-sans font-light leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(devo.content) }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BIBLE STUDIES ACCORDION */}
      {pubBibleStudies.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-6 flex items-center gap-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#0B0907]">Bible Studies</h3>
            <div className="h-[1px] flex-1 bg-black/10"></div>
          </div>
          <div className="flex flex-col gap-4">
            {pubBibleStudies.map(study => (
              <div key={study.id} className="border border-black/10 rounded-2xl bg-white overflow-hidden shadow-sm">
                <button 
                  onClick={() => setExpandedStudyId(expandedStudyId === study.id ? null : study.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-black/5 transition-colors"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-[#C25627] tracking-widest uppercase mb-1 block">{study.theme}</span>
                    <h4 className="font-serif text-xl font-semibold">{study.title}</h4>
                    <span className="font-sans text-sm text-zinc-500 mt-1 block">By {study.author}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform ${expandedStudyId === study.id ? 'rotate-180' : ''}`} />
                </button>
                {expandedStudyId === study.id && (
                  <div className="p-6 pt-0 border-t border-black/5 mt-2 bg-white">
                    <div 
                      className="prose prose-sm sm:prose-base prose-zinc max-w-none pt-4 font-sans font-light leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(study.content) }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTICLES GRID */}
      {pubArticles.length > 0 && (
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 flex items-center gap-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#0B0907]">Featured Articles</h3>
            <div className="h-[1px] flex-1 bg-black/10"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pubArticles.map(article => (
              <Link href={`/${eventId}/programme/articles/${article.id}`} key={article.id} className="group flex flex-col gap-4">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-black/10 shadow-sm">
                  {article.coverImageUrl ? (
                    <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-200 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 text-xs font-sans text-zinc-500 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {article.publishedDate}</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {article.author}</span>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#0B0907] group-hover:text-[#C25627] transition-colors line-clamp-2 mb-2">{article.title}</h4>
                  <p className="font-sans text-sm text-zinc-600 font-light line-clamp-3 leading-relaxed">{article.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* DOWNLOADS LIST */}
      {pubDownloads.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-6 flex items-center gap-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#0B0907]">Downloads & Resources</h3>
            <div className="h-[1px] flex-1 bg-black/10"></div>
          </div>
          <div className="flex flex-col gap-3">
            {pubDownloads.map(download => (
              <a 
                key={download.id} 
                href={download.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 border border-black/10 rounded-2xl bg-white hover:border-[#C25627]/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#C25627]/10 flex items-center justify-center text-[#C25627] shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#0B0907]">{download.title}</h4>
                    {download.description && <p className="font-sans text-sm text-zinc-500 mt-0.5 line-clamp-1">{download.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#C25627] uppercase tracking-wider shrink-0 pl-4">
                  <span className="hidden sm:inline">Download</span>
                  <DownloadIcon className="h-5 w-5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
