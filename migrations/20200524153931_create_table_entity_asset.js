import { TBL_ASSET, TBL_ENTITY_ASSET } from '../build/fblib/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_ENTITY_ASSET, (table) => {
    table.uuid('id').notNullable().primary();

    table.string('parent_entity_kind', 20).notNullable().index();
    table.uuid('parent_entity_id').notNullable().index();
    table.string('purpose', 20).notNullable().index();

    table.uuid('asset_id').notNullable().index()
      .references('id').inTable(TBL_ASSET)
      .onDelete('cascade');

    table.jsonb('meta').notNullable().defaultTo('{}');

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_ENTITY_ASSET);
};
