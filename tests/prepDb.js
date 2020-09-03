export async function prepDb(db) {
  const migrated = await db.migrate.latest();
  console.info('db migrated');//, migrated);
  const seeded = await db.seed.run();
  console.info('db seeded');//, seeded);
}
