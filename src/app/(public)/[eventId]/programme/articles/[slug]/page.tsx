"use client";

import React, { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import { Article } from "@/lib/firebase/cms";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, User, Loader2 } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { notFound } from "next/navigation";

export default function ArticlePage({ params }: { params: Promise<{ eventId: string, slug: string }> }) {
  const { eventId, slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, "events", eventId, "articles", slug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setArticle({ id: snap.id, ...snap.data() } as Article);
        } else {
          setArticle(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (eventId && slug) fetchArticle();
  }, [eventId, slug]);

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex items-center justify-center bg-[#FAF6EE] min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C25627]" />
      </div>
    );
  }

  if (!article || article.status !== 'published') {
    return notFound();
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907]">
      <section className="relative w-full pt-40 pb-16 px-4 sm:px-6 md:px-16 bg-[#0B0907] text-white">
        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <Link href={`/${eventId}/programme`} className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm font-sans uppercase tracking-wider font-bold">
            <ChevronLeft className="h-4 w-4" />
            Back to Programme
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white uppercase leading-none mb-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-sans text-white/80">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {article.publishedDate}</span>
            <span className="flex items-center gap-2"><User className="h-4 w-4" /> {article.author || "Editorial Board"}</span>
          </div>
        </div>
      </section>

      <section className="relative w-full py-16 px-4 sm:px-6 md:px-16">
        <div className="max-w-3xl mx-auto w-full">
          {article.coverImageUrl && (
            <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-12 shadow-md border border-black/10">
              <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" priority />
            </div>
          )}

          {article.summary && (
            <p className="font-sans text-lg sm:text-xl text-zinc-600 font-light leading-relaxed mb-12 italic border-l-2 border-[#C25627] pl-6">
              {article.summary}
            </p>
          )}

          <div 
            className="prose prose-zinc sm:prose-lg max-w-none font-sans font-light leading-relaxed text-zinc-800"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
          />
        </div>
      </section>
    </div>
  );
}
