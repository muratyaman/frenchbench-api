import { TBL_USER } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_USER, (table) => {
    table.uuid('id').notNullable().primary();
    table.string('username', 50).notNullable().unique();
    table.text('password_hash').notNullable();

    table.string('first_name', 50).nullable();
    table.string('last_name', 50).nullable();
    table.string('email', 100).nullable();
    table.string('phone', 20).nullable();
    table.text('headline').nullable();
    table.string('neighbourhood', 50).nullable().index();
    table.float('lat').defaultTo(0);
    table.float('lon').defaultTo(0);
    table.jsonb('raw_geo').defaultTo('{}');

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();

    table.index(['lat', 'lon']);
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_USER);
};
