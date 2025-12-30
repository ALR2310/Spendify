import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Undo,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface ClassNames {
  content?: string;
  toolbar?: string;
}

interface TipTapEditorProps {
  className?: string;
  classNames?: ClassNames;
  content?: string;
  onChange?: (value: string) => void;
}

export default function TipTapEditor({ className, classNames, content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-accent underline cursor-pointer',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content ?? '');
    }
  }, [content, editor]);

  return (
    <div className={`flex flex-col min-h-0 w-full h-full border border-base-content/20 rounded-lg ${className}`}>
      <ToolbarMenu editor={editor} className={classNames?.toolbar} />

      <EditorContent
        editor={editor}
        className={`flex-1 p-2 overflow-auto [&_.ProseMirror]:outline-none ${classNames?.content}`}
        onClick={() => editor?.commands.focus()}
      />
    </div>
  );
}

function ToolbarMenu({ editor, className }: { editor: ReturnType<typeof useEditor>; className?: string }) {
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

  const handleHeadingChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (!editor) return;

      const value = event.target.value;
      switch (value) {
        case 'paragraph':
          editor.chain().focus().setParagraph().run();
          break;
        case 'heading1':
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'heading2':
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'heading3':
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
      }
    },
    [editor],
  );

  const getCurrentHeadingLevel = () => {
    if (!editor) return 'paragraph';

    if (editor.isActive('heading', { level: 1 })) return 'heading1';
    if (editor.isActive('heading', { level: 2 })) return 'heading2';
    if (editor.isActive('heading', { level: 3 })) return 'heading3';
    return 'paragraph';
  };

  return (
    <div
      className={`flex flex-nowrap gap-1 p-1 border-b border-base-content/20 overflow-x-auto bg-base-100 ${className}`}
    >
      {/* Format buttons */}
      <select
        className="select select-sm select-ghost w-auto"
        value={getCurrentHeadingLevel()}
        onChange={handleHeadingChange}
      >
        <option value="paragraph">Paragraph</option>
        <option value="heading1">Heading 1</option>
        <option value="heading2">Heading 2</option>
        <option value="heading3">Heading 3</option>
      </select>

      <div className="divider divider-horizontal m-0"></div>

      <button
        title="Bold"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive('bold') ? 'btn-active' : ''}`}
      >
        <Bold size={14} strokeWidth={3} />
      </button>

      <button
        title="Italic"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive('italic') ? 'btn-active' : ''}`}
      >
        <Italic size={14} />
      </button>

      <button
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive('strike') ? 'btn-active' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </button>

      <div className="divider divider-horizontal m-0"></div>

      {/* Link */}
      <button
        onClick={setLink}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive('link') ? 'btn-active' : ''}`}
        title="Link"
      >
        <LinkIcon size={14} />
      </button>

      {/* Color */}
      <input
        type="color"
        onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
        value={editor?.getAttributes('textStyle').color || '#000000'}
        className="w-8 h-8 rounded cursor-pointer"
        title="Text Color"
      />

      {/* Image */}
      <button
        onClick={() => {
          const url = window.prompt('Nhập URL hình ảnh:');
          if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="btn btn-square btn-sm btn-ghost"
        title="Insert Image"
      >
        <ImageIcon size={14} />
      </button>

      <div className="divider divider-horizontal m-0"></div>

      {/* Alignment */}
      <button
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive({ textAlign: 'left' }) ? 'btn-active' : ''}`}
        title="Align Left"
      >
        <AlignLeft size={14} />
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive({ textAlign: 'center' }) ? 'btn-active' : ''}`}
        title="Align Center"
      >
        <AlignCenter size={14} />
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive({ textAlign: 'right' }) ? 'btn-active' : ''}`}
        title="Align Right"
      >
        <AlignRight size={14} />
      </button>

      <div className="divider divider-horizontal m-0"></div>

      {/* Lists */}
      <button
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive('bulletList') ? 'btn-active' : ''}`}
        title="Bullet List"
      >
        <List size={14} />
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive('orderedList') ? 'btn-active' : ''}`}
        title="Ordered List"
      >
        <ListOrdered size={14} />
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        className={`btn btn-square btn-sm btn-ghost ${editor?.isActive('blockquote') ? 'btn-active' : ''}`}
        title="Quote"
      >
        <Quote size={14} />
      </button>

      <div className="divider divider-horizontal m-0"></div>

      {/* Table */}
      <button
        onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="btn btn-square btn-sm btn-ghost"
        title="Add Table"
      >
        <TableIcon size={14} />
      </button>

      <div className="divider divider-horizontal m-0"></div>

      {/* Undo/Redo */}
      <button
        onClick={() => editor?.chain().focus().undo().run()}
        className="btn btn-square btn-sm btn-ghost"
        disabled={!editor?.can().undo()}
        title="Undo"
      >
        <Undo size={14} strokeWidth={3} />
      </button>
      <button
        onClick={() => editor?.chain().focus().redo().run()}
        className="btn btn-square btn-sm btn-ghost"
        disabled={!editor?.can().redo()}
        title="Redo"
      >
        <Redo size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
