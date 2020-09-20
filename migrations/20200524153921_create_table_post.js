import { TBL_USER, TBL_POST } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_POST, (table) => {
    table.uuid('id').notNullable().primary();

    table.uuid('user_id').notNullable().index()
      .references('id').inTable(TBL_USER)
      .onDelete('cascade');

    table.string('post_ref', 100).notNullable();
    table.text('title').notNullable();
    table.text('content').notNullable();
    table.text('tags').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();

    table.unique(['user_id', 'post_ref']);
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_POST);
};
