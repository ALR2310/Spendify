import { db } from '@/common/database';
import { NewCategories, UpdateCategories } from '@/common/database/types/tables/categories';

export const categoryService = new (class CategoryService {
  async getAll() {
    try {
      const categories = await db.selectFrom('categories').selectAll().execute();
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const category = await db.selectFrom('categories').selectAll().where('id', '=', id).executeTakeFirst();
      return category;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  async create(data: NewCategories) {
    try {
      const category = await db.insertInto('categories').values(data).returningAll().executeTakeFirst();
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateCategories) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Category not found');

      const category = await db
        .updateTable('categories')
        .set(data)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
      return category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Category not found');

      await db.deleteFrom('categories').where('id', '=', id).execute();
      return existing;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
})();
