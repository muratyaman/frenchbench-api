import { Pool } from 'pg';
import { hash, log, newUuid } from './utils';

export interface IDb {
  query<TRow = any>(text: string, values?: any[], name?: string | null): Promise<IDbQueryResult<TRow>>;
  queryMeta(text: string, values?: any[], name?: string | null): Promise<IDbQueryResultMeta>;
  now(): Promise<IDbQueryResult<IRowNow>>;
  find<T>(tableName: string, condition?: any, limit?: number): Promise<IDbQueryResultWithRow<T>>;
  insert(tableName: string, row: any): Promise<IDbQueryResult>;
  update(tableName: string, condition: any, change: any, limit?: number): Promise<IDbQueryResult>;
  del(tableName: string, condition: any, limit?: number): Promise<IDbQueryResult>;
  placeHolder(idx: number): string;
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

export function newDb(pool: Pool): IDb {

  function placeHolder(idx: number): string {
    return '$' + idx;
  }

  async function query<TRow = any>(text: string, values: any[] = [], name: string | null = null): Promise<IDbQueryResult<TRow>> {
    let result: IResult<TRow> | null = null;
    let error: string | null = null;
    const id = newUuid();
    log('db query', id, name, text);
    log('db params', id, values);
    try {
      if (name) { // reusable prepared query
        const result1 = await pool.query({ text, values, name });
        const { command, rows = [], rowCount = 0 } = result1;
        result = { command, rowCount, success: 0 < rowCount, rows: (rows ?? []).map(r => r as TRow)};
      } else {
        const result2 = await pool.query(text, values);
        const { command, rows = [], rowCount = 0 } = result2;
        result = { command, rowCount, success: 0 < rowCount, rows: (rows ?? []).map(r => r as TRow)};
      }
      log('db result', id);
    } catch (err) {
      log('db error', id, err);
      error = err.message;
    }
    return { result, error };
  }

  async function queryMeta(text: string, values: any[] = [], name: string | null = null): Promise<IDbQueryResultMeta> {
    const counter = `SELECT COUNT(q.*) AS row_count FROM (${text}) q`;
    const { result, error } = await query<IRowMeta>(counter, values, name);
    const { rows = [] } = result ?? {};
    const { row_count = 0 } = rows[0] ?? {};
    return { error, row_count };
  }

  async function now(): Promise<IDbQueryResult<IRowNow>> {
    return query<IRowNow>('SELECT NOW() AS ts');
  }

  async function find<TRow = any>(tableName: string, condition: any = {}, limit = 0): Promise<IDbQueryResultWithRow<TRow>> {
    const where = [], params = [];
    Object.entries(condition).forEach(([field, value]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params.length));
    });
    const whereClause = where ? 'WHERE ' + where.join(' AND ') : '';
    
    let limitClause = '';
    let limitInt = Number.parseInt(String(limit));
    if (100 < limitInt) limitInt = 100;
    if (limitInt < 0) limitInt = 0;
    if (limitInt > 0) {
      params.push(limitInt);
      const limitPh = placeHolder(params.length);
      limitClause = limitInt ? `LIMIT ${limitPh}` : '';
    }

    const text = `SELECT * FROM ${tableName} ${whereClause} ${limitClause}`;
    const name = tableName + '-f-' + hash(text);
    const { result, error } = await query(text, params, name);
    const row = limitInt === 1 && result && result.rows && result.rows.length ? result.rows[0] : null;
    return { result, error, row };
  }

  /**
   * Insert a record in a table
   * @param {string} tableName 
   * @param {object} row
   * @see https://www.postgresql.org/docs/current/sql-insert.html
   */
  async function insert(tableName: string, row: any): Promise<IDbQueryResult> {
    const fields = [], params = [], placeHolders = [];
    Object.entries(row).forEach(([field, value]) => {
      fields.push(field);
      params.push(value);
      placeHolders.push(placeHolder(params.length));
    });
    const text = 'INSERT INTO ' + tableName + ' (' + fields.join(', ') + ') '
      + 'VALUES (' + placeHolders.join(', ') + ') '
      + 'RETURNING *';
    const name = tableName + '-i-' + hash(text);
    return query(text, params, name);
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
  async function update(tableName: string, condition: any, change: any, limit = 1): Promise<IDbQueryResult> {
    const assignments = [], where = [], params = [];
    Object.entries(change).forEach(([field, value]) => {
      params.push(value);
      assignments.push(field + ' = ' + placeHolder(params.length));
    });
    Object.entries(condition).forEach(([field, value]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params.length));
    });
    const assignmentsStr = assignments.join(', ');
    const whereStr = where ? ' WHERE ' + where.join(' AND ') : '';
    params.push(limit);
    const limitPh = placeHolder(params.length);
    const text = `UPDATE ${tableName} SET ${assignmentsStr} ${whereStr} LIMIT ${limitPh}`;
    const name = tableName + '-u-' + hash(text);
    return query(text, params, name);
  }

  /**
   * Delete one ore more records in a table
   * NOTE: try to limit delete operation by condition e.g. unique { id } as there is no LIMIT clause
   * NOTE: delete is keyword
   * @param {string} tableName 
   * @param {object} condition
   * @see https://www.postgresql.org/docs/current/sql-delete.html
   */
  async function del(tableName: string, condition: any, limit = 1): Promise<IDbQueryResult> {
    const where = [], params = [];
    Object.entries(condition).forEach(([field, value]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params.length));
    });
    const whereStr = where ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit);
    const limitPh = placeHolder(params.length);
    const text = `DELETE FROM ${tableName} ${whereStr} LIMIT ${limitPh}`;
    const name = tableName + '-d-' + hash(text);
    return query(text, params, name);
  }

  return {
    query,
    queryMeta,
    find,
    insert,
    update,
    del,
    now,
    placeHolder,
  };
}
