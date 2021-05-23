import { TBL_POST } from '../build/fblib/constants';

exports.up = function(knex) {
  return knex.schema.table(TBL_POST, (table) => {
    table.float('lat').defaultTo(0);
    table.float('lon').defaultTo(0);
    table.float('geo_accuracy').defaultTo(9999);
    table.timestamp('geo_updated_at', { useTz: true }).index();
    table.index(['lat', 'lon']);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TBL_POST, (table) => {
    table.dropIndex(['lat', 'lon']);
    table.dropColumn('lat');
    table.dropColumn('lon');
    table.dropColumn('geo_accuracy');
    table.dropColumn('geo_updated_at');
  });
};
