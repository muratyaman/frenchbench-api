import { TBL_USER, TBL_ADVERT } from '../src/lib/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_ADVERT, (table) => {
    table.uuid('id').notNullable().primary();

    table.uuid('user_id').notNullable().index()
      .references('id').inTable(TBL_USER)
      .onDelete('cascade');

    table.string('slug', 100).notNullable();
    table.text('title').notNullable();
    table.text('content').notNullable();
    table.text('tags').nullable();
    table.integer('is_buying').notNullable().defaultTo(0);
    table.integer('is_service').notNullable().defaultTo(0);
    table.float('price').notNullable().defaultTo(0).index();
    table.string('currency', 3).notNullable().defaultTo('GBP').index();
    table.string('price_info', 20).nullable().defaultTo('each');

    table.float('lat').defaultTo(0);
    table.float('lon').defaultTo(0);
    table.float('geo_accuracy').defaultTo(9999);
    table.timestamp('geo_updated_at', { useTz: true }).index();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();

    table.unique(['user_id', 'slug']);
    table.index(['lat', 'lon']);
    table.index(['is_buying', 'is_service']);
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_ADVERT);
};
