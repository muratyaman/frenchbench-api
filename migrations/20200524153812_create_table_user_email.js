import { TBL_USER, TBL_USER_EMAIL } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_USER_EMAIL, (table) => {
    table.uuid('id').notNullable().primary();

    table.uuid('user_id').notNullable().index()
      .references('id').inTable(TBL_USER)
      .onDelete('cascade');

    table.string('email', 100).notNullable().unique();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_USER_EMAIL);
};
