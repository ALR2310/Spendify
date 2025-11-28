import {
  DatabaseConnection,
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  QueryCompiler,
  QueryResult,
  CompiledQuery,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

export class CapacitorSQLiteConnection implements DatabaseConnection {
  constructor(private db: SQLiteDBConnection) {}

  async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    try {
      const { sql, parameters } = compiledQuery;
      const values = parameters as any[];

      if (sql.trim().toLowerCase().startsWith('select') || sql.trim().toLowerCase().startsWith('pragma')) {
        const result = await this.db.query(sql, values);
        return {
          rows: result.values || [],
        };
      } else {
        const result = await this.db.run(sql, values);
        return {
          rows: [],
          insertId: result.changes?.lastId ? BigInt(result.changes.lastId) : undefined,
          numAffectedRows: result.changes?.changes ? BigInt(result.changes.changes) : BigInt(0),
        };
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  async *streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
    throw new Error('Streaming is not supported by CapacitorSQLite');
  }
}

export class CapacitorSQLiteDriver implements Driver {
  private connection: CapacitorSQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async init(): Promise<void> {}

  async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.connection && this.db) {
      this.connection = new CapacitorSQLiteConnection(this.db);
    }
    if (!this.connection) {
      throw new Error('Database connection not available');
    }
    return this.connection;
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('BEGIN'));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('COMMIT'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('ROLLBACK'));
  }

  async releaseConnection(): Promise<void> {}

  async destroy(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }
}

export class CapacitorSQLiteDialect implements Dialect {
  constructor(private dbConnection: SQLiteDBConnection) {}

  createDriver(): Driver {
    return new CapacitorSQLiteDriver(this.dbConnection);
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler();
  }

  createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SqliteIntrospector(db);
  }
}
