"use client";

/**
 * @file RichTextEditor.tsx
 * @description Simple rich text editor component for inline HTML formatting.
 */

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = "" }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean'] // remove formatting button
    ],
  }), []);

  return (
    <div className={`rich-text-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className="bg-white text-black rounded-xl overflow-hidden shadow-sm"
      />
      <style jsx global>{`
        .rich-text-wrapper .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: rgba(0,0,0,0.1);
          background-color: #F7F4EE;
        }
        .rich-text-wrapper .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: rgba(0,0,0,0.1);
          min-height: 150px;
          font-family: inherit;
        }
        .rich-text-wrapper .ql-editor {
          min-height: 150px;
          font-size: 0.875rem; /* 14px */
        }
      `}</style>
    </div>
  );
}
