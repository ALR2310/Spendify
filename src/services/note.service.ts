import { db } from '@/common/database';
import { NewNotes, UpdateNotes } from '@/common/database/types/tables/notes';

export const noteService = new (class NoteService {
  async getAll() {
    try {
      const notes = await db.selectFrom('notes').selectAll().execute();
      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const note = await db.selectFrom('notes').selectAll().where('id', '=', id).executeTakeFirst();
      return note;
    } catch (error) {
      console.error('Error fetching note by ID:', error);
      throw error;
    }
  }

  async create(data: NewNotes) {
    try {
      const note = await db.insertInto('notes').values(data).returningAll().executeTakeFirst();
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateNotes) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Note not found');

      const note = await db.updateTable('notes').set(data).where('id', '=', id).returningAll().executeTakeFirst();
      return note;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Note not found');

      await db.deleteFrom('notes').where('id', '=', id).execute();
      return existing;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
})();
