import { v4 } from 'uuid';
import { TBL_SECRET } from '../../../../constants';
import { randSecret } from 'frenchbench-common';

export function secrets({ db, router }) {

  const createSecret = async (req, res) => {
    const { email } = req.body;
    const row = {
      id: v4(),
      created_at: new Date(),
      secret: randSecret('AB12CD'),
      email,
      meta: {},
    };
    const { result, error } = await db.insertOne(TBL_SECRET, row);
    res.json({ data: result.rowCount, error });
  };

  router.post('/', createSecret);

  return router;
}
