import { TBL_USER, TBL_USER_SKILL } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_USER_SKILL, (table) => {
    table.uuid('id').notNullable().primary();

    table.uuid('user_id').notNullable().index()
      .references('id').inTable(TBL_USER)
      .onDelete('cascade');

    table.string('skill', 100).notNullable().index();
    table.integer('stars').notNullable().defaultTo(1).index();
    table.integer('order_idx').notNullable().defaultTo(0).index();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();

    table.index(['user_id', 'order_idx']);
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_USER_SKILL);
};
