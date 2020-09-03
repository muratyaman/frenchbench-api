import { TBL_SECRET } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_SECRET, (table) => {
    table.uuid('id').notNullable().primary();
    table.timestamp('created_at', { useTz: true, precision: 3 }).notNullable();
    table.string('secret', 20).notNullable();
    table.string('email', 100).notNullable();
    table.jsonb('meta').notNullable().defaultTo('{}');
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_SECRET);
};
