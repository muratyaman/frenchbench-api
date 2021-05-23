import { TBL_USER } from '../build/fblib/constants';

exports.up = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.integer('email_verified').defaultTo(0).index();
    table.integer('phone_mobile_verified').defaultTo(0).index();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.dropColumn('email_verified');
    table.dropColumn('phone_mobile_verified');
  });
};
