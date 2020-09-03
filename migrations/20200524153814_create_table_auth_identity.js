import { TBL_AUTH_IDENTITY } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_AUTH_IDENTITY, (table) => {
    table.uuid('id').notNullable().primary();

    table.string('provider_id', 20).notNullable();
    table.string('external_username', 100).notNullable();
    table.jsonb('meta').notNullable().defaultTo('{}');

    table.timestamp('created_at', { useTz: true, precision: 3 }).notNullable();
    table.timestamp('updated_at', { useTz: true, precision: 3 }).notNullable();

    table.unique(['provider_id', 'external_username']);
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_AUTH_IDENTITY);
};
