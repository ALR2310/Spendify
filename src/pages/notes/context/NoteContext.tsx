import { CircleAlert, Pencil, Trash2, X } from 'lucide-react';
import { createContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import Drawer, { DrawerRef } from '@/components/Drawer';
import TipTapEditor from '@/components/TipTapEditor';
import { confirm } from '@/global/confirm';
import {
  useNoteByIdQuery,
  useNoteCreateMutation,
  useNoteDeleteMutation,
  useNoteUpdateMutation,
} from '@/hooks/apis/note.hook';

interface NoteContextType {
  openDetail(noteId: number): void;
  closeDetail(): void;
  openCreate(): void;
  openEdit(noteId: number): void;
  closeUpsert(): void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const NoteProvider = ({ children }: { children: React.ReactNode }) => {
  const detailDrawerRef = useRef<DrawerRef>(null!);
  const upsertDrawerRef = useRef<DrawerRef>(null!);
  const [detailNoteId, setDetailNoteId] = useState<number>();
  const [upsertNoteId, setUpsertNoteId] = useState<number | null>(null);

  const openDetail = (noteId: number) => {
    setDetailNoteId(noteId);
    detailDrawerRef.current?.openDrawer();
  };

  const closeDetail = () => {
    setDetailNoteId(undefined);
    detailDrawerRef.current?.close();
  };

  const openCreate = () => {
    setUpsertNoteId(null);
    upsertDrawerRef.current?.openDrawer();
  };

  const openEdit = (noteId: number) => {
    setUpsertNoteId(noteId);
    closeDetail();
    upsertDrawerRef.current?.openDrawer();
  };

  const closeUpsert = () => {
    setUpsertNoteId(null);
    upsertDrawerRef.current?.close();
  };

  const ctx = { openDetail, closeDetail, openCreate, openEdit, closeUpsert };

  return (
    <NoteContext.Provider value={ctx}>
      {children}
      <NoteDetailDrawer
        drawerRef={detailDrawerRef}
        noteId={detailNoteId}
        onEdit={openEdit}
        onClose={closeDetail}
      />
      <NoteUpsertDrawer drawerRef={upsertDrawerRef} noteId={upsertNoteId} onClose={closeUpsert} />
    </NoteContext.Provider>
  );
};

const NoteDetailDrawer = ({
  drawerRef,
  noteId,
  onEdit,
  onClose,
}: {
  drawerRef: React.RefObject<DrawerRef>;
  noteId?: number;
  onEdit: (noteId: number) => void;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { data: note, isLoading } = useNoteByIdQuery(noteId || 0);
  const { mutateAsync: deleteNote } = useNoteDeleteMutation();

  const handleDelete = async () => {
    if (!noteId) return;

    const confirmed = await confirm(
      'Bạn có chắc chắn muốn xóa ghi chú này? Hành động này không thể hoàn tác.',
      <span className="inline-flex items-center gap-2 text-error font-semibold">
        <CircleAlert />
        Xác nhận xóa
      </span>,
    );
    if (!confirmed) return;

    try {
      await deleteNote(noteId);
      queryClient.invalidateQueries({ queryKey: ['notes', 'getList'] });
      toast.success('Đã xóa ghi chú thành công!');
      drawerRef.current?.close();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Xóa ghi chú thất bại. Vui lòng thử lại.');
    }
  };

  const handleEdit = () => {
    if (noteId) {
      onEdit(noteId);
    }
  };

  return (
    <Drawer
      ref={drawerRef}
      className="h-[calc(100vh-env(safe-area-inset-top))]"
      position="bottom"
      onClose={onClose}
    >
      <div className="flex flex-col h-full">
        <div className="relative flex items-center justify-center p-4 border-b border-base-content/10">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <h3 className="font-semibold text-lg">{note?.title || 'Không tiêu đề'}</h3>
          )}
          <button className="btn btn-circle btn-ghost absolute right-2" onClick={() => drawerRef.current?.close()}>
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-base-content/60">
                Cập nhật: {note?.updatedAt ? new Date(note.updatedAt).toLocaleString('vi-VN') : ''}
              </div>
              <div
                className="text-base-content/90 prose prose-sm max-w-none prose-headings:text-base-content prose-p:text-base-content/90 prose-strong:text-base-content prose-ul:text-base-content/90 prose-ol:text-base-content/90 prose-li:text-base-content/90 prose-a:text-accent prose-code:text-base-content/90"
                dangerouslySetInnerHTML={{ __html: note?.content || '' }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 items-center gap-2 p-4 border-t border-base-content/10">
          <button className="btn btn-ghost rounded-xl" onClick={() => drawerRef.current?.close()}>
            Đóng
          </button>
          <button className="btn btn-soft btn-accent rounded-xl" onClick={handleEdit}>
            <Pencil size={20} /> Sửa
          </button>
          <button className="btn btn-error rounded-xl" onClick={handleDelete}>
            <Trash2 size={20} /> Xóa
          </button>
        </div>
      </div>
    </Drawer>
  );
};

const NoteUpsertDrawer = ({
  drawerRef,
  noteId,
  onClose,
}: {
  drawerRef: React.RefObject<DrawerRef>;
  noteId: number | null;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: note, isLoading: isLoadingNote } = useNoteByIdQuery(noteId || 0);
  const { mutateAsync: createNote } = useNoteCreateMutation();
  const { mutateAsync: updateNote } = useNoteUpdateMutation();

  // Reset form when creating new note
  useEffect(() => {
    if (noteId === null) {
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

      if (noteId === null) {
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
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(noteId === null ? 'Tạo ghi chú thất bại' : 'Cập nhật ghi chú thất bại');
    }
  };

  return (
    <Drawer
      ref={drawerRef}
      className="h-[calc(100vh-env(safe-area-inset-top))]"
      position="bottom"
      onClose={onClose}
    >
      <div className="flex flex-col min-h-0 h-full">
        <div className="relative flex items-center justify-center p-4 border-b border-base-content/10">
          <h3 className="font-semibold text-lg">{noteId === null ? 'Tạo ghi chú mới' : 'Chỉnh sửa ghi chú'}</h3>
          <button className="btn btn-circle btn-ghost absolute right-2" onClick={onClose}>
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
              <div>
                <span className="text-sm font-medium">Tiêu đề</span>
                <input
                  type="text"
                  className="input input-lg"
                  placeholder="Nhập tiêu đề..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-auto">
                <span className="text-sm font-medium">Nội dung</span>
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Nhập nội dung..."
                  className="flex-1"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-base-content/10">
          <button className="btn btn-ghost rounded-xl flex-1" onClick={onClose}>
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

export { NoteContext, NoteProvider };
export type { NoteContextType };
