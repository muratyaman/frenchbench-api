import { TBL_EMAIL_VERIF } from '../build/fblib/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_EMAIL_VERIF, (table) => {
    table.uuid('id').notNullable().primary();
    table.string('email', 100).notNullable();
    table.string('code', 10).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.integer('used').defaultTo(0);
    
    table.unique(['email', 'code']);
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_EMAIL_VERIF);
};
