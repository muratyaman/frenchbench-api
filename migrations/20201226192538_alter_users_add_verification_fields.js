import { TBL_USER } from '../src/lib/constants';

exports.up = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.integer('email_verified').defaultTo(0).index();
    table.integer('phone_verified').defaultTo(0).index();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.dropColumn('email_verified');
    table.dropColumn('phone_verified');
  });
};
