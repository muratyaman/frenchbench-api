// @see https://node-postgres.com/features/queries
import { Pool } from 'pg';

export function extendDb(db) {

  const placeHolder = (idx) => {
    return '$' + idx;
  };

  const query = async (text, values = [], name = null) => {
    let result, error;
    try {
      if (name) {
        result = await db.query({ name, text, values });
      } else {
        result = await db.query(text, values);
      }
    } catch (err) {
      console.error('query text', text);
      console.error('query error', err);
      error = err;
    }
    return { result, error };
  };

  const findOne = async (table, field, value) => {
    const { result, error } = await query(
      `SELECT * FROM ${table} WHERE ${field} = ` + placeHolder(1),
      [ value ],
      table + '-find-one-by-' + field,
    );
    return { result, error, row: result && result.rows && result.rows[0] ? result.rows[0] : null };
  };

  const insertOne = async(tableName, row) => {
    const fields = [], params = [], placeHolders = [];
    Object.entries(row).forEach(([ field , value ]) => {
      fields.push(field);
      params.push(value);
      placeHolders.push(placeHolder(params.length));
    });
    // param placeholders: $1, $2, etc.
    const text = 'INSERT INTO ' + tableName + ' (' + fields.join(', ') + ') '
      + 'VALUES (' + placeHolders.join(', ') + ') '
      + 'RETURNING *';
    return query(text, params);
  };

  const updateOne = async(tableName, condition, row, limit = 1) => {
    const assignments = [], where = [], params = [];
    Object.entries(row).forEach(([ field, value ]) => {
      params.push(value);
      assignments.push(field + ' = ' + placeHolder(params.length));
    });
    Object.entries(condition).forEach(([ field , value ]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params.length));
    });
    const assignmentsStr = assignments.join(', ');
    const whereStr = where ? ' WHERE ' + where.join(' AND ') : '';
    const limitStr = limit ? `LIMIT ${limit}` : '';
    const text = `UPDATE ${tableName} SET ${assignmentsStr} ${whereStr} ${limitStr}`;
    return query(text, params);
  };

  const deleteOne = async(tableName, condition, limit  = 1) => {
    const where = [], params = [];
    Object.entries(condition).forEach(([field , value]) => {
      params.push(value);
      where.push(field + ' = ' + placeHolder(params.length));
    });
    const whereStr = where ? 'WHERE ' + where.join(' AND ') : '';
    const limitStr = limit ? `LIMIT ${limit}` : '';
    const text = `DELETE FROM ${tableName} ${whereStr} ${limitStr}`;
    return query(text, params);
  };

  return {
    query,
    findOne,
    insertOne,
    updateOne,
    deleteOne,
  };
}

export function newDb({ config }) {
  const _pool = new Pool(config.pg.poolOptions);

  const sampleOps = async(client) => {
    // do something using client
    Promise.resolve(true);
  }

  const txn = async(ops = sampleOps) => {
    const _client = await _pool.connect();
    const db = { _client, ...extendDb(_client) };
    try {
      await _client.query('BEGIN');
      await ops(db);
      await _client.query('COMMIT');
    } catch (err) {
      await _client.query('ROLLBACK');
      throw err;
    } finally {
      _client.release();
    }
  };

  return {
    _pool,
    ...extendDb(_pool),
    txn,
  };
}
