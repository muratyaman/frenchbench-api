import { TBL_USER } from '../build/fblib/constants';

exports.up = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.integer('is_volunteer').defaultTo(0).index();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.dropColumn('is_volunteer');
  });
};
