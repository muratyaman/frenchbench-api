import { Pool } from 'pg';
import * as _ from './constants';
import { ErrNotFound } from './errors';
import { hash, log, newUuid } from './utils';

export interface IDb {
  ph(idx: number): string;
  param(params: any[], val: any): string
  query<TRow = any>(text: string, values?: any[], name?: string | null): Promise<IDbQueryResult<TRow>>;
  queryMeta(text: string, values?: any[], name?: string | null): Promise<IDbQueryResultMeta>;
  now(): Promise<IDbQueryResult<IRowNow>>;
  paginate({ offset, limit }: PaginationInput, defaultLimit?: number, maxLimit?: number, defaultOffset?: number): PaginationOutput;
  paginationClauses({ offset, limit }: Pagination, params: any[]): PaginationClauses;
  find<T>(tableName: string, condition?: any, limit?: number, offset?: number): Promise<IDbQueryResultWithRow<T>>;
  insert(tableName: string, row: any): Promise<IDbQueryResult>;
  update(tableName: string, condition: any, change: any, limit?: number): Promise<IDbQueryResult>;
  del(tableName: string, condition: any, limit?: number): Promise<IDbQueryResult>;
}

export interface IFieldInfo { // pg.FieldInfo
  name: string;
  dataTypeID: number;
}

export interface IResult<TRow = any> { // pg.Result
  command: string;  // command type last executed: INSERT, UPDATE CREATE SELECT
  rowCount: number; // # of rows affected
  rows: Array<TRow>;
  success: boolean;
}

export interface IDbQueryResult<TRow = any> {
  result: IResult<TRow> | null;
  error: string | null;
}

export interface IDbQueryResultWithRow<TRow = any> extends IDbQueryResult<TRow> {
  row: TRow | null;
}

export interface IRowMeta {
  row_count: number;
}
export interface IDbQueryResultMeta extends IRowMeta {
  error?: string | null;
}

export interface IRowNow {
  ts: string;
}

export interface Pagination {
  offset: number;
  limit: number;
}

export interface PaginationInput {
  offset?: string | number | null;
  limit?: string | number | null;
}
export type PaginationOutput = Pagination;

export interface PaginationClauses {
  offsetClause: string;
  limitClause: string;
}

export class DbService implements IDb {
  constructor(private pool: Pool) {}

  ph(idx: number): string {
    return '$' + idx;
  }

  param(params: any[], val: any): string {
    params.push(val);
    return this.ph(params.length);
  }

  async query<TRow = any>(text: string, values: any[] = [], name: string | null = null): Promise<IDbQueryResult<TRow>> {
    let result: IResult<TRow> | null = null;
    let error: string | null = null;
    const id = newUuid();
    //log('db query', id, name, text);
    //log('db params', id, values);
    try {
      if (name) { // reusable prepared query
        log('db query', text);
        const result1 = await this.pool.query({ text, values, name });
        const { command, rows = [], rowCount = 0 } = result1;
        result = { command, rowCount, success: 0 < rowCount, rows: (rows ?? []).map(r => r as TRow)};
      } else {
        log('db query', text);
        const result2 = await this.pool.query(text, values);
        const { command, rows = [], rowCount = 0 } = result2;
        result = { command, rowCount, success: 0 < rowCount, rows: (rows ?? []).map(r => r as TRow)};
      }
      //log('db result', id);
    } catch (err) {
      log('db error', id, err);
      error = err.message;
    }
    return { result, error };
  }

  async queryMeta(text: string, values: any[] = [], name: string | null = null): Promise<IDbQueryResultMeta> {
    const counter = `SELECT COUNT(q.*) AS row_count FROM (${text}) q`;
    const { result, error } = await this.query<IRowMeta>(counter, values, name);
    const { rows = [] } = result ?? {};
    const { row_count = 0 } = rows[0] ?? {};
    return { error, row_count };
  }

  async now(): Promise<IDbQueryResult<IRowNow>> {
    return this.query<IRowNow>('SELECT NOW() AS ts');
  }

  paginate({ offset, limit }: PaginationInput, defaultLimit = 10, maxLimit = 100, defaultOffset = 0): PaginationOutput {
    let _offset = defaultOffset, _limit = defaultLimit;
    if (offset) _offset = Number.parseInt(`${offset}`);
    if (_offset < 0) _offset = 0;

    if (limit) _limit = Number.parseInt(`${limit}`);
    if (_limit < 0) _limit = defaultLimit;
    if (maxLimit < _limit) _limit = maxLimit;
    return { offset: _offset, limit: _limit };
  }

  paginationClauses({ offset, limit }: Pagination, params: any[]): PaginationClauses {
    let offsetClause = '', limitClause = '';
    if (0 < offset) { // no need when offset = 0
      params.push(offset);
      offsetClause = 'OFFSET ' + this.ph(params.length);
    }
    if (0 < limit) {
      params.push(limit);
      limitClause = 'LIMIT ' + this.ph(params.length);
    }
    return { offsetClause, limitClause };
  }

  async find<TRow = any>(tableName: string, condition: any = {}, limit = 0, offset = 0): Promise<IDbQueryResultWithRow<TRow>> {
    const where = [], params = [];
    Object.entries(condition).forEach(([field, value]) => {
      where.push(field + ' = ' + this.param(params, value));
    });
    const whereClause = where ? 'WHERE ' + where.join(' AND ') : '';
    
    const pagination = this.paginate({ offset, limit }, limit); // limit optional
    const { offsetClause, limitClause } = this.paginationClauses(pagination, params);

    const text = `SELECT * FROM ${tableName} ${whereClause} ${offsetClause} ${limitClause}`;
    const name = tableName + '-f-' + hash(text);
    const { result, error } = await this.query(text, params, name);
    // special case, row is for convenience
    const row: TRow = pagination.limit === 1 && result && result.rows && result.rows.length ? result.rows[0] : null;
    return { result, error, row };
  }

  async findOneOrErr<TRow = any>(tableName: string, condition: any = {}, err = _.MSG_USER_NOT_FOUND): Promise<TRow> {
    const { row, error } = await this.find<TRow>(tableName, condition, 1);
    if (error) throw new ErrNotFound(err);
    return row;
  }

  /**
   * Insert a record in a table
   * @param {string} tableName 
   * @param {object} row
   * @see https://www.postgresql.org/docs/current/sql-insert.html
   */
  async insert(tableName: string, row: Record<string, any>): Promise<IDbQueryResult> {
    const fields = [], params = [], valueArr = [];
    Object.entries(row).forEach(([field, value]) => {
      fields.push(field);
      params.push(value);
      valueArr.push(this.ph(params.length));
    });
    const fieldList = fields.join(',');
    const valueList = valueArr.join(',');
    const text = `INSERT INTO ${tableName} (${fieldList}) VALUES (${valueList}) RETURNING *`;
    const name = tableName + '-i-' + hash(text);
    return this.query(text, params, name);
  }

  // TODO: insertMany() efficiently

  /**
   * Update one ore more records in a table
   * NOTE: try to limit update operation by condition e.g. unique { id } as there is no LIMIT clause
   * @param {string} tableName 
   * @param {object} condition
   * @param {object} change
   * @see https://www.postgresql.org/docs/current/sql-update.html
   */
  async update(tableName: string, condition: any, change: any, limit = 1): Promise<IDbQueryResult> {
    const assignments = [], where = [], params = [];
    Object.entries(change).forEach(([field, value]) => {
      params.push(value);
      assignments.push(field + ' = ' + this.ph(params.length));
    });
    Object.entries(condition).forEach(([field, value]) => {
      params.push(value);
      where.push(field + ' = ' + this.ph(params.length));
    });
    const assignmentsStr = assignments.join(',');
    const whereStr = where ? ' WHERE ' + where.join(' AND ') : '';
    // params.push(limit);
    // const limitPh = this.ph(params.length); // TODO check issue with LIMIT clause
    const text = `UPDATE ${tableName} SET ${assignmentsStr} ${whereStr}`; // LIMIT ${limitPh}`;
    const name = tableName + '-u-' + hash(text);
    return this.query(text, params, name);
  }

  /**
   * Delete one ore more records in a table
   * NOTE: try to limit delete operation by condition e.g. unique { id } as there is no LIMIT clause
   * NOTE: delete is keyword
   * @param {string} tableName 
   * @param {object} condition
   * @see https://www.postgresql.org/docs/current/sql-delete.html
   */
  async del(tableName: string, condition: any, limit = 1): Promise<IDbQueryResult> {
    const where = [], params = [];
    Object.entries(condition).forEach(([field, value]) => {
      params.push(value);
      where.push(field + ' = ' + this.ph(params.length));
    });
    const whereStr = where ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit); const limitPh = this.ph(params.length);
    const text = `DELETE FROM ${tableName} ${whereStr} LIMIT ${limitPh}`;
    const name = tableName + '-d-' + hash(text);
    return this.query(text, params, name);
  }
}
