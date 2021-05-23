import { TBL_USER } from '../build/fblib/constants';

exports.up = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.string('link_website', 50).nullable();
    table.string('link_facebook', 50).nullable();
    table.string('link_instagram', 50).nullable();
    table.string('link_twitter', 50).nullable();
    table.string('link_linkedin', 50).nullable();
    table.string('link_youtube', 50).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TBL_USER, (table) => {
    table.dropColumn('link_website');
    table.dropColumn('link_facebook');
    table.dropColumn('link_instagram');
    table.dropColumn('link_twitter');
    table.dropColumn('link_linkedin');
    table.dropColumn('link_youtube');
  });
};
