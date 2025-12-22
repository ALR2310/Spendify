import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Palette,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

const TipTapEditor = ({
  content,
  onChange,
  placeholder = 'Nhập nội dung...',
  className = '',
  editable = true,
}: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline cursor-pointer',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-base-content/20 rounded-lg overflow-hidden flex flex-col min-h-0 ${className}`}>
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-base-content/20 bg-base-200/50 shrink-0">
          {/* Format buttons */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`btn btn-xs btn-ghost ${editor.isActive('bold') ? 'btn-active' : ''}`}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`btn btn-xs btn-ghost ${editor.isActive('italic') ? 'btn-active' : ''}`}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`btn btn-xs btn-ghost ${editor.isActive('strike') ? 'btn-active' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`btn btn-xs btn-ghost ${editor.isActive('code') ? 'btn-active' : ''}`}
            title="Code"
          >
            <Code size={14} />
          </button>

          <div className="divider divider-horizontal mx-0"></div>

          {/* Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`btn btn-xs btn-ghost ${editor.isActive({ textAlign: 'left' }) ? 'btn-active' : ''}`}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`btn btn-xs btn-ghost ${editor.isActive({ textAlign: 'center' }) ? 'btn-active' : ''}`}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`btn btn-xs btn-ghost ${editor.isActive({ textAlign: 'right' }) ? 'btn-active' : ''}`}
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>

          <div className="divider divider-horizontal mx-0"></div>

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`btn btn-xs btn-ghost ${editor.isActive('bulletList') ? 'btn-active' : ''}`}
            title="Bullet List"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`btn btn-xs btn-ghost ${editor.isActive('orderedList') ? 'btn-active' : ''}`}
            title="Ordered List"
          >
            <ListOrdered size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`btn btn-xs btn-ghost ${editor.isActive('blockquote') ? 'btn-active' : ''}`}
            title="Quote"
          >
            <Quote size={14} />
          </button>

          <div className="divider divider-horizontal mx-0"></div>

          {/* Link */}
          <button
            onClick={setLink}
            className={`btn btn-xs btn-ghost ${editor.isActive('link') ? 'btn-active' : ''}`}
            title="Link"
          >
            <LinkIcon size={14} />
          </button>

          <div className="divider divider-horizontal mx-0"></div>

          {/* Color */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-xs btn-ghost" title="Text Color">
              <Palette size={14} />
            </label>
            <div
              tabIndex={0}
              className="dropdown-content card card-compact w-64 p-2 shadow bg-base-100 border border-base-content/20"
            >
              <div className="grid grid-cols-6 gap-1">
                {[
                  '#000000',
                  '#374151',
                  '#6B7280',
                  '#9CA3AF',
                  '#D1D5DB',
                  '#F3F4F6',
                  '#EF4444',
                  '#F97316',
                  '#F59E0B',
                  '#EAB308',
                  '#84CC16',
                  '#22C55E',
                  '#10B981',
                  '#06B6D4',
                  '#0EA5E9',
                  '#3B82F6',
                  '#6366F1',
                  '#8B5CF6',
                  '#A855F7',
                  '#D946EF',
                  '#EC4899',
                  '#F43F5E',
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-base-content/20"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
              <button
                className="btn btn-xs btn-ghost mt-2"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Xóa màu
              </button>
            </div>
          </div>

          <div className="divider divider-horizontal mx-0"></div>

          {/* Undo/Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="btn btn-xs btn-ghost"
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="btn btn-xs btn-ghost"
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={14} />
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className={`prose prose-sm max-w-none p-3 flex-1 min-h-0 overflow-y-auto focus-within:outline-none ${
          editable ? 'cursor-text' : 'cursor-default'
        } prose-headings:text-base-content prose-p:text-base-content/90 prose-strong:text-base-content prose-ul:text-base-content/90 prose-ol:text-base-content/90 prose-li:text-base-content/90 prose-a:text-accent prose-code:text-base-content/90 prose-blockquote:text-base-content/70 [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_*]:outline-none`}
      />
    </div>
  );
};

export default TipTapEditor;
