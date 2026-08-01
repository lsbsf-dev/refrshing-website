"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';
import 'react-quill-new/dist/quill.snow.css';

// Load ReactQuill dynamically to avoid SSR document is not defined errors
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function SpikePage() {
  const [value, setValue] = useState('');

  const handleChange = (content: string, delta: any, source: string, editor: any) => {
    setValue(content);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">React Quill + DOMPurify Spike</h1>
        <p className="text-sm opacity-70 mb-4">
          1. Copy some formatted text (bold, italic, lists) from MS Word.<br/>
          2. Paste it into the editor below.<br/>
          3. We are outputting Sanitized HTML which guarantees 100% fidelity to the original paste.
        </p>
        <div className="bg-white text-black rounded-xl overflow-hidden shadow-sm">
          <ReactQuill 
            theme="snow" 
            value={value} 
            onChange={handleChange} 
            className="min-h-[200px]"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Sanitized HTML Output:</h2>
        <pre className="bg-zinc-900 text-emerald-400 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap text-sm font-mono border border-zinc-800">
          {DOMPurify.sanitize(value) || 'No output yet...'}
        </pre>
        
        <h2 className="text-xl font-bold mt-8 mb-2">Live Preview (DangerouslySetInnerHTML with Purify):</h2>
        <div 
          className="bg-white text-black p-4 rounded-xl prose max-w-none shadow-sm"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
        />
      </div>
    </div>
  );
}
