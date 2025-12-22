import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { useNoteListQuery } from '@/hooks/apis/note.hook';
import { useNoteContext } from '@/hooks/app/useNote';
import { useThemeContext } from '@/hooks/app/useTheme';

function NoteItem({ data, onClick }: { data: any; onClick: () => void }) {
  return (
    <button
      className="text-left w-full bg-base-100 border border-base-content/10 rounded-xl p-4 hover:border-base-content/20 transition-colors"
      onClick={onClick}
    >
      <h2 className="text-lg font-semibold mb-1">{data.title || 'Không tiêu đề'}</h2>
      <span className="text-xs text-base-content/60">{new Date(data.updatedAt).toLocaleDateString('vi-VN')}</span>
      <div
        className="line-clamp-3 mt-2 text-sm text-base-content/80 prose prose-sm max-w-none prose-headings:text-base-content prose-p:text-base-content/80 prose-strong:text-base-content prose-ul:text-base-content/80 prose-ol:text-base-content/80 prose-li:text-base-content/80 prose-a:text-accent prose-code:text-base-content/80 overflow-hidden"
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
      />
    </button>
  );
}

export default function NotePage() {
  const { resolvedTheme } = useThemeContext();
  const { openDetail, openCreate } = useNoteContext();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notes = [], isLoading } = useNoteListQuery();

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) => note.title?.toLowerCase().includes(query) || note.content?.toLowerCase().includes(query),
    );
  }, [notes, searchQuery]);

  return (
    <div className="flex flex-col h-full min-h-0 p-4">
      <div
        className={`w-full sticky top-0 mb-0 z-10 pb-4 ${resolvedTheme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}
      >
        <input
          type="search"
          className="input w-full"
          placeholder="Tìm kiếm ghi chú..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/60">
            <p className="text-lg">{searchQuery ? 'Không tìm thấy ghi chú nào' : 'Chưa có ghi chú nào'}</p>
            {!searchQuery && (
              <button className="btn btn-soft btn-accent mt-4" onClick={openCreate}>
                Tạo ghi chú đầu tiên
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => <NoteItem key={note.id} data={note} onClick={() => openDetail(note.id)} />)
        )}
      </div>

      <div className="fab bottom-6">
        <button className="btn btn-soft btn-lg btn-circle btn-accent" onClick={openCreate}>
          <Plus className="animate-pulse"></Plus>
        </button>
      </div>
    </div>
  );
}
