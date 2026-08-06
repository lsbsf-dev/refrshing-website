"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon } from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    if (previousUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const url = window.prompt("URL", "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btnClass = (isActive: boolean) =>
    `p-2 rounded-md transition-colors ${
      isActive ? "bg-[#C25627] text-white" : "text-zinc-600 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-black/10 dark:border-white/10 p-2 bg-zinc-50 dark:bg-black/20 rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title="Bold"
        type="button"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title="Italic"
        type="button"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive("strike"))}
        title="Strikethrough"
        type="button"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
        type="button"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
        type="button"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        title="Bullet List"
        type="button"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        title="Numbered List"
        type="button"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
        title="Blockquote"
        type="button"
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

      <button
        onClick={toggleLink}
        className={btnClass(editor.isActive("link"))}
        title="Link"
        type="button"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#C25627] underline hover:text-[#a1451f]",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert sm:prose-base focus:outline-none max-w-none p-4 min-h-[150px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep content synced if it changes from outside (e.g., initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-[#181612] rounded-xl overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto cursor-text" />
    </div>
  );
}
