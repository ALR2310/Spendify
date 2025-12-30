import { X } from 'lucide-react';
import { createContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import Drawer, { DrawerRef } from '@/components/Drawer';
import TipTapEditor from '@/components/TipTapEditor';
import { useNoteByIdQuery, useNoteCreateMutation, useNoteUpdateMutation } from '@/hooks/apis/note.hook';
import { useAppContext } from '@/hooks/app/useApp';

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: note, isLoading: isLoadingNote } = useNoteByIdQuery(noteId || 0);
  const { mutateAsync: createNote } = useNoteCreateMutation();
  const { mutateAsync: updateNote } = useNoteUpdateMutation();
  const { syncData } = useAppContext();

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
      toast.error(t('notes.form.validationError'));
      return;
    }

    try {
      const now = new Date().toISOString();

      if (!noteId) {
        // Create
        await createNote({
          title: title.trim() || t('notes.item.untitled'),
          content: content.trim() || '',
          createdAt: now,
          updatedAt: now,
        });
        toast.success(t('notes.form.createSuccess'));
      } else {
        // Update
        await updateNote({
          id: noteId,
          data: {
            title: title.trim() || t('notes.item.untitled'),
            content: content.trim() || '',
            updatedAt: now,
          },
        });
        toast.success(t('notes.form.updateSuccess'));
      }

      queryClient.invalidateQueries({ queryKey: ['notes', 'getList'] });

      if (noteId) {
        queryClient.invalidateQueries({ queryKey: ['notes', 'getById', noteId] });
      }

      drawerRef.current?.close();

      syncData();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(noteId === null ? t('notes.form.createError') : t('notes.form.updateError'));
    }
  };

  return (
    <Drawer ref={drawerRef} className="h-[calc(100vh-env(safe-area-inset-top))]" position="bottom">
      <div className="flex flex-col min-h-0 h-full">
        <div className="relative flex items-center justify-center p-4 border-b border-base-content/10">
          <h3 className="font-semibold text-lg">
            {noteId === null ? t('notes.form.createTitle') : t('notes.form.editTitle')}
          </h3>
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
              <span className="text-sm font-medium mb-0">{t('notes.form.titleLabel')}</span>
              <input
                type="text"
                className="input input-lg"
                placeholder={t('notes.form.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <span className="text-sm font-medium mb-0">{t('notes.form.contentLabel')}</span>
              <TipTapEditor content={content} onChange={setContent} className="flex-1" />
            </>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-base-content/10">
          <button className="btn btn-ghost rounded-xl flex-1" onClick={() => drawerRef.current?.close()}>
            {t('notes.form.cancel')}
          </button>
          <button className="btn btn-accent rounded-xl flex-1" onClick={handleSave}>
            {t('notes.form.save')}
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export { NoteUpsertContext, NoteUpsertProvider };
export type { NoteUpsertContextType };
