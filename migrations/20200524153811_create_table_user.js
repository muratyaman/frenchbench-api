import { TBL_USER } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_USER, (table) => {
    table.uuid('id').notNullable().primary();
    table.string('username', 50).notNullable().unique();
    table.text('password_hash').notNullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_USER);
};
