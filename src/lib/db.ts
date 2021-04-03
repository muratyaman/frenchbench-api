import { Pool, Result } from 'pg';
import { hash, log, newUuid } from './utils';

export interface IDbProps {
  pool: Pool;
}

export interface IDb {
  query(text: string, values?: any[], name?: string | null): Promise<IDbQueryResult>;
  queryMeta(text: string, values?: any[], name?: string | null): Promise<IDbQueryResultMeta>;
  now(): Promise<IDbQueryResult>;
  find<T>(tableName: string, condition?: any, limit?: number): Promise<IDbQueryResultWithRow<T>>;
  insert(tableName: string, row: any): Promise<IDbQueryResult>;
  update(tableName: string, condition: any, change: any, limit?: number): Promise<IDbQueryResult>;
  del(tableName: string, condition: any, limit?: number): Promise<IDbQueryResult>;
  placeHolder(idx: number): string;
}

export interface IDbQueryResult {
  result: Result;
  error: any;
}

export interface IDbQueryResultWithRow<TRow = any> extends IDbQueryResult {
  row?: TRow;
}

export interface IDbQueryResultMeta {
  error: any;
  row_count?: number;
}

export function newDb({ pool }: IDbProps): IDb {

  function placeHolder(idx: number): string {
    return '$' + idx;
  }

  async function query(text: string, values: any[] = [], name: string | null = null): Promise<IDbQueryResult> {
    let result = null, error = null;
    const id = newUuid();
    log('db query', id, name, text);
    log('db params', id, values);
    try {
      if (name) { // reusable prepared query
        result = await pool.query({ text, values, name });
      } else {
        result = await pool.query(text, values);
      }
      log('db result', id);//, result);
    } catch (err) {
      log('db error', id, err);
      error = err;
    }
    return { result, error };
  }

  async function queryMeta(text: string, values: any[] = [], name: string | null = null): Promise<IDbQueryResultMeta> {
    const counter = `SELECT COUNT(q.*) AS row_count FROM (${text}) q`;
    const { result, error } = await query(counter, values, name);
    const row0 = result && result.rows && result.rows[0] ? result.rows[0] : {};
    return { error, ...row0 };
  }

  async function now(): Promise<IDbQueryResult> {
    return query('SELECT NOW() AS ts');
  }

  async function find<TRow = any>(tableName: string, condition: any = {}, limit = 0): Promise<IDbQueryResultWithRow<TRow>> {
    const where = [], params = [];
    Object.entries(condition).forEach(([field, value]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params.length));
    });
    const whereStr = where ? 'WHERE ' + where.join(' AND ') : '';
    
    let limitStr = '';
    let limitInt = Number.parseInt(String(limit));
    if (100 < limitInt) limitInt = 100;
    if (limitInt < 0) limitInt = 0;
    if (limitInt) {
      params.push(limitInt);
      const limitPh = placeHolder(params.length);
      limitStr = limitInt ? `LIMIT ${limitPh}` : '';
    }

    const text = `SELECT * FROM ${tableName} ${whereStr} ${limitStr}`;
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
