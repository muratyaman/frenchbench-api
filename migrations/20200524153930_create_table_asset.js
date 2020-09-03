import { TBL_ASSET } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_ASSET, (table) => {
    table.uuid('id').notNullable().primary();
    table.string('asset_type', 50).notNullable();
    table.string('media_type', 50).notNullable();
    table.string('label', 50).nullable();
    table.string('url', 255).notNullable();
    table.jsonb('meta').notNullable().defaultTo('{}');

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_ASSET);
};
