import { CircleAlert, Pencil, Trash2, X } from 'lucide-react';
import { createContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import Drawer, { DrawerRef } from '@/components/Drawer';
import { confirm } from '@/global/confirm';
import { useNoteByIdQuery, useNoteDeleteMutation } from '@/hooks/apis/note.hook';
import { useNoteUpsertContext } from '@/hooks/app/useNote';

interface NoteDetailContextType {
  openDetail(noteId: number): void;
  closeDetail(): void;
}

const NoteDetailContext = createContext<NoteDetailContextType | undefined>(undefined);

const NoteDetailProvider = ({ children }: { children: React.ReactNode }) => {
  const drawerRef = useRef<DrawerRef>(null!);
  const [noteId, setNoteId] = useState<number>();

  const openDetail = (noteId: number) => {
    setNoteId(noteId);
    drawerRef.current?.openDrawer();
  };

  const closeDetail = () => {
    setNoteId(undefined);
    drawerRef.current?.close();
  };

  return (
    <NoteDetailContext.Provider value={{ openDetail, closeDetail }}>
      {children}
      <NoteDetailDrawer drawerRef={drawerRef} noteId={noteId} />
    </NoteDetailContext.Provider>
  );
};

const NoteDetailDrawer = ({ drawerRef, noteId }: { drawerRef: React.RefObject<DrawerRef>; noteId?: number }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { openForm } = useNoteUpsertContext();
  const { data: note, isLoading } = useNoteByIdQuery(noteId || 0);
  const { mutateAsync: deleteNote } = useNoteDeleteMutation();

  const handleEdit = () => {
    if (!noteId) return;
    drawerRef.current?.close();
    openForm(noteId);
  };

  const handleDelete = async () => {
    if (!noteId) return;

    const confirmed = await confirm(
      t('notes.delete.confirm'),
      <span className="inline-flex items-center gap-2 text-error font-semibold">
        <CircleAlert />
        {t('notes.delete.title')}
      </span>,
    );
    if (!confirmed) return;

    try {
      await deleteNote(noteId);
      queryClient.invalidateQueries({ queryKey: ['notes', 'getList'] });
      toast.success(t('notes.delete.success'));
      drawerRef.current?.close();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(t('notes.delete.error'));
    }
  };

  return (
    <Drawer ref={drawerRef} className="h-[calc(100vh-env(safe-area-inset-top))]" position="bottom">
      <div className="flex flex-col h-full">
        <div className="relative flex items-center justify-center p-4 border-b border-base-content/10">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <h3 className="font-semibold text-lg">{note?.title || t('notes.detail.untitled')}</h3>
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
                {t('notes.detail.updated')}{' '}
                {note?.updatedAt ? new Date(note.updatedAt).toLocaleString('vi-VN') : ''}
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
            {t('notes.detail.close')}
          </button>
          <button className="btn btn-soft btn-accent rounded-xl" onClick={handleEdit}>
            <Pencil size={20} /> {t('notes.detail.edit')}
          </button>
          <button className="btn btn-error rounded-xl" onClick={handleDelete}>
            <Trash2 size={20} /> {t('notes.detail.delete')}
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export { NoteDetailContext, NoteDetailProvider };
export type { NoteDetailContextType };
