import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { DbService } from '../DbService';
import { makeArticleSlug, updateRow } from '../utils';
import { ErrForbidden, ErrNotFound } from '../errors';
import { AssetService } from './AssetService';

export class ArticleService {
  constructor(
    private db: DbService,
    private assetService: AssetService,
  ) {
    // do nothing
  }

  async article_search({ user, input }: at.ArticleSearchInput): Promise<at.ArticleSearchOutput> {
    let data = [];
    // eslint-disable-next-line prefer-const
    let { q = '', with_assets = false } = input;
    const params = [];
    params.push(`%${q}%`); const ph1 = this.db.ph(params.length);

    const pagination = this.db.paginate(input, 100);
    const { offsetClause, limitClause } = this.db.paginationClauses(pagination, params);

    // do not include large records e.g. avoid returning large text fields
    const text = `
SELECT a.id, a.slug, a.title, a.keywords, a.created_at, a.updated_at
FROM ${_.TBL_ARTICLE} a
WHERE (a.title LIKE ${ph1})
   OR (a.content LIKE ${ph1})
   OR (a.keywords LIKE ${ph1})
ORDER BY a.title
${offsetClause}
${limitClause}
`;
    
    const { result, error } = await this.db.query<at.ArticleSummary>(text, params, 'article-text-search');

    if (error) throw new ErrNotFound();
    data = result.rows;

    if (with_assets && data.length) {
      // with side effect on data
      await this.assetService._find_attach_assets<dm.Article>({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ARTICLE });
    }

    // no need for meta query, we have not many articles
    return { data, meta: { row_count: data.length } };
  }

  async article_retrieve({ user, id, input }: at.ArticleRetrieveInput): Promise<at.ArticleRetrieveOutput> {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { slug = '', with_assets = false } = input;
    if ((id && (id !== '')) || (slug && (slug !== ''))) {
      const condition = id ? { id } : { slug };
      const { row, error } = await this.db.find<dm.Article>(_.TBL_ARTICLE, condition, 1);
      if (!row || error) throw new ErrNotFound(_.MSG_ARTICLE_NOT_FOUND);
      if (with_assets) {
        // with side effect on data
        await this.assetService._find_attach_assets<dm.Article>({
          user, data: [ row ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ARTICLE,
        });
      }
      return { data: row };
    } else {
      return { data: null, error: 'article id or slug required' };
    }
  }

  async article_update({ user, id, input }: at.ArticleUpdateInput): Promise<at.ArticleUpdateOutput> {
    // eslint-disable-next-line prefer-const
    let { slug, title, content, tags } = input;
    const dt = new Date();

    const { row: articleFound, error: findArticleErr } = await this.db.find<dm.Article>(_.TBL_ARTICLE, { id }, 1);
    if (findArticleErr) throw findArticleErr;
    if (!articleFound) throw new ErrNotFound(_.MSG_ARTICLE_NOT_FOUND);
    if (articleFound.created_by !== user.id) throw new ErrForbidden();

    if (!title) title = 'my article at ' + dt.toISOString();
    if (!slug) slug = title;
    slug = makeArticleSlug(slug);
    const change = updateRow({ slug, title, content, tags, user });
    const { result, error: updateArticleError } = await this.db.update(_.TBL_ARTICLE, { id }, change, 1);
    if (!result || updateArticleError) throw updateArticleError;

    return { data: result.success };
  }

  _api() {
    return {
      article_retrieve: this,
      article_search: this,
      article_update: this,
    };
  }
}
