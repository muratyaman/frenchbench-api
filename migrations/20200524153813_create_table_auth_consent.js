import { TBL_AUTH_CONSENT } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_AUTH_CONSENT, (table) => {
    table.uuid('id').notNullable().primary();
    table.string('provider_id', 10).notNullable(); // 'linkedin'
    table.text('scope').notNullable();
    table.text('auth_code').notNullable().defaultTo('');
    table.string('grant_type', 10).notNullable().defaultTo(''); // 'Bearer'
    table.text('access_token').notNullable().defaultTo('');
    table.text('refresh_token').notNullable().defaultTo('');
    table.timestamp('expires_at', { useTz: true, precision: 3 }).nullable();

    table.timestamp('created_at', { useTz: true, precision: 3 }).notNullable();
    table.timestamp('updated_at', { useTz: true, precision: 3 }).notNullable();
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_AUTH_CONSENT);
};
