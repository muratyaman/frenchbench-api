import { TBL_USER } from '../src/lib/constants';

exports.up = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.float('geo_accuracy').defaultTo(9999);
    table.timestamp('geo_updated_at', { useTz: true }).index();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.dropColumn('geo_accuracy');
    table.dropColumn('geo_updated_at');
  });
};
