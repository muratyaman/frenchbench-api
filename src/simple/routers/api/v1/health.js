export function health({ db, router }) {

  router.get('/', async (req, res) => {
    const result = await db.query('SELECT NOW() AS ts');
    res.json({ data: result.rows[0] });
  });

  return router;
}
