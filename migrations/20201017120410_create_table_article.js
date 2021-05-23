import { TBL_ARTICLE } from '../build/fblib/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_ARTICLE, (table) => {
    table.uuid('id').notNullable().primary();

    table.string('slug', 100).notNullable();
    table.text('title').notNullable();
    table.text('content').notNullable();
    table.text('tags').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();

    table.unique(['slug']);
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_ARTICLE);
};
