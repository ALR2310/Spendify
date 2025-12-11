import { logger } from '@/common/logger';
import { db } from '@/database';
import { NewNote, UpdateNote } from '@/database/types/tables/notes';

export const noteService = new (class NoteService {
  async getList() {
    try {
      const notes = await db.selectFrom('notes').selectAll().execute();
      return notes;
    } catch (error) {
      logger.error('Error fetching notes:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const note = await db.selectFrom('notes').selectAll().where('id', '=', id).executeTakeFirst();
      return note;
    } catch (error) {
      logger.error('Error fetching note by ID:', error);
      throw error;
    }
  }

  async create(data: NewNote) {
    try {
      const note = await db.insertInto('notes').values(data).returningAll().executeTakeFirst();
      return note;
    } catch (error) {
      logger.error('Error creating note:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateNote) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Note not found');

      const note = await db.updateTable('notes').set(data).where('id', '=', id).returningAll().executeTakeFirst();
      return note;
    } catch (error) {
      logger.error('Error updating note:', error);
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
      logger.error('Error deleting note:', error);
      throw error;
    }
  }
})();
