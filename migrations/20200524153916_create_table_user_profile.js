import { TBL_USER, TBL_USER_PROFILE } from '../src/constants';

export const up = knex => {
  return knex.schema.createTable(TBL_USER_PROFILE, (table) => {
    table.uuid('id').notNullable().primary();

    table.uuid('user_id').notNullable().index()
      .references('id').inTable(TBL_USER)
      .onDelete('cascade');

    table.string('first_name', 50).nullable();
    table.string('middle_name', 50).nullable();
    table.string('last_name', 50).nullable();
    table.string('job_title', 100).nullable().index();
    table.string('organisation', 100).nullable().index();
    table.string('industry', 100).nullable().index();
    table.string('city', 100).nullable().index();
    table.string('country', 100).nullable().index();
    table.integer('dob_year').nullable().index();
    table.integer('min_salary').nullable().index();
    table.text('summary').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
  });
};

export const down = knex => {
  return knex.schema.dropTable(TBL_USER_PROFILE);
};
