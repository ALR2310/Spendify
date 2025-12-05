import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import {
  CompiledQuery,
  DatabaseConnection,
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  QueryCompiler,
  QueryResult,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely';

export class CapacitorSQLiteConnection implements DatabaseConnection {
  constructor(
    private db: SQLiteDBConnection,
    private isInTransactionRef: { value: boolean },
  ) {}

  async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    try {
      const { sql, parameters } = compiledQuery;
      const values = parameters as any[];

      const lower = sql.trim().toLowerCase();

      if (lower.startsWith('select') || lower.startsWith('pragma')) {
        const result = await this.db.query(sql, values);
        return { rows: result.values || [] };
      }

      if (this.isInTransactionRef.value) {
        const result = await (this.db as any).run(sql, values, false);
        return {
          rows: [],
          insertId: result.changes?.lastId ? BigInt(result.changes.lastId) : undefined,
          numAffectedRows: result.changes?.changes ? BigInt(result.changes.changes) : BigInt(0),
        };
      }

      const result = await this.db.run(sql, values);
      return {
        rows: [],
        insertId: result.changes?.lastId ? BigInt(result.changes.lastId) : undefined,
        numAffectedRows: result.changes?.changes ? BigInt(result.changes.changes) : BigInt(0),
      };
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
    throw new Error('Streaming not supported');
  }
}

export class CapacitorSQLiteDriver implements Driver {
  private connection: CapacitorSQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private isInTransaction = { value: false };

  constructor(dbConnection: SQLiteDBConnection) {
    this.db = dbConnection;
  }

  async init(): Promise<void> {}

  async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.connection && this.db) {
      this.connection = new CapacitorSQLiteConnection(this.db, this.isInTransaction);
    }
    if (!this.connection) {
      throw new Error('No DB connection available');
    }
    return this.connection;
  }

  async beginTransaction(): Promise<void> {
    this.isInTransaction.value = true;
    await this.db!.beginTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this.db!.commitTransaction();
    this.isInTransaction.value = false;
  }

  async rollbackTransaction(): Promise<void> {
    await this.db!.rollbackTransaction();
    this.isInTransaction.value = false;
  }

  async releaseConnection(): Promise<void> {}
  async destroy(): Promise<void> {}
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
