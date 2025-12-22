import { X } from 'lucide-react';
import { createContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import Drawer, { DrawerRef } from '@/components/Drawer';
import TipTapEditor from '@/components/TipTapEditor';
import { useNoteByIdQuery, useNoteCreateMutation, useNoteUpdateMutation } from '@/hooks/apis/note.hook';

interface NoteUpsertContextType {
  openForm(id?: number): void;
  closeForm(): void;
}

const NoteUpsertContext = createContext<NoteUpsertContextType | undefined>(undefined);

const NoteUpsertProvider = ({ children }: { children: React.ReactNode }) => {
  const drawerRef = useRef<DrawerRef>(null!);
  const [noteId, setNoteId] = useState<number>();

  const openForm = (id?: number) => {
    setNoteId(id);
    drawerRef.current?.openDrawer();
  };

  const closeForm = () => {
    setNoteId(undefined);
    drawerRef.current?.close();
  };

  return (
    <NoteUpsertContext.Provider value={{ openForm, closeForm }}>
      {children}
      <NoteUpsertDrawer drawerRef={drawerRef} noteId={noteId} />
    </NoteUpsertContext.Provider>
  );
};

const NoteUpsertDrawer = ({ drawerRef, noteId }: { drawerRef: React.RefObject<DrawerRef>; noteId?: number }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: note, isLoading: isLoadingNote } = useNoteByIdQuery(noteId || 0);
  const { mutateAsync: createNote } = useNoteCreateMutation();
  const { mutateAsync: updateNote } = useNoteUpdateMutation();

  // Reset form when creating new note
  useEffect(() => {
    if (!noteId) {
      setTitle('');
      setContent('');
    }
  }, [noteId]);

  // Populate form when editing
  useEffect(() => {
    if (note && !isLoadingNote) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note, isLoadingNote]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('Vui lòng nhập tiêu đề hoặc nội dung');
      return;
    }

    try {
      const now = new Date().toISOString();

      if (!noteId) {
        // Create
        await createNote({
          title: title.trim() || 'Không tiêu đề',
          content: content.trim() || '',
          createdAt: now,
          updatedAt: now,
        });
        toast.success('Đã tạo ghi chú thành công!');
      } else {
        // Update
        await updateNote({
          id: noteId,
          data: {
            title: title.trim() || 'Không tiêu đề',
            content: content.trim() || '',
            updatedAt: now,
          },
        });
        toast.success('Đã cập nhật ghi chú thành công!');
      }

      queryClient.invalidateQueries({ queryKey: ['notes', 'getList'] });

      if (noteId) {
        queryClient.invalidateQueries({ queryKey: ['notes', 'getById', noteId] });
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(noteId === null ? 'Tạo ghi chú thất bại' : 'Cập nhật ghi chú thất bại');
    }
  };

  return (
    <Drawer ref={drawerRef} className="h-[calc(100vh-env(safe-area-inset-top))]" position="bottom">
      <div className="flex flex-col min-h-0 h-full">
        <div className="relative flex items-center justify-center p-4 border-b border-base-content/10">
          <h3 className="font-semibold text-lg">{noteId === null ? 'Tạo ghi chú mới' : 'Chỉnh sửa ghi chú'}</h3>
          <button className="btn btn-circle btn-ghost absolute right-2" onClick={() => drawerRef.current?.close()}>
            <X />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
          {isLoadingNote && noteId !== null ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium mb-0">Tiêu đề:</span>
              <input
                type="text"
                className="input input-lg"
                placeholder="Nhập tiêu đề..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <span className="text-sm font-medium mb-0">Nội dung:</span>
              <TipTapEditor content={content} onChange={setContent} className="flex-1" />
            </>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-base-content/10">
          <button className="btn btn-ghost rounded-xl flex-1" onClick={() => drawerRef.current?.close()}>
            Hủy
          </button>
          <button className="btn btn-accent rounded-xl flex-1" onClick={handleSave}>
            Lưu
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export { NoteUpsertContext, NoteUpsertProvider };
export type { NoteUpsertContextType };
