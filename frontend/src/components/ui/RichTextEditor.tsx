import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface Props {
  value: string;
  onChange: (html: string) => void;
  error?: boolean;
}

export const RichTextEditor: React.FC<Props> = ({ value, onChange, error }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write a detailed event description...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div
      className={`border rounded-lg ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("bold") ? "bg-primary/10 text-primary" : ""
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("italic") ? "bg-primary/10 text-primary" : ""
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("bulletList") ? "bg-primary/10 text-primary" : ""
          }`}
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary/10 text-primary"
              : ""
          }`}
        >
          H2
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="p-3 min-h-[150px]" />
    </div>
  );
};
