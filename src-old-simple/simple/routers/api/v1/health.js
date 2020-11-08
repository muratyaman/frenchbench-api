export function health({ config, db, router, mw }) {

  router.get('/', async (req, res) => {
    const { result, error } = await db.query('SELECT NOW() AS ts');
    res.json({ result, error });
  });

  return router;
}