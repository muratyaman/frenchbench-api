import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { IDb } from '../db';
import { makeArticleSlug, updateRow } from '../utils';
import { ErrForbidden, ErrNotFound } from '../errors';
import { AssetService } from './AssetService';

export class ArticleService {

  constructor(
    private db: IDb,
    private assetService: AssetService,
  ) {

  }

  async article_search({ user, input }: at.ArticleSearchInput): at.ArticleSearchOutput {
    let data = [];
    // eslint-disable-next-line prefer-const
    let { q = '', offset = '0', limit = '10', with_assets = false } = input;
    let myOffset = Number.parseInt(`${offset}`);
    if (myOffset < 0) myOffset = 0;
    let myLimit = Number.parseInt(`${limit}`);
    if (100 < myLimit) myLimit = 100;
    // do not include large records e.g. avoid returning large text fields
    const text = 'SELECT a.id, a.slug, a.title, a.keywords, a.created_at, a.updated_at FROM ' + _.TBL_ARTICLE + ' a'
      + ' WHERE (a.title LIKE $1)'
      + '    OR (a.content LIKE $1)'
      + '    OR (a.keywords LIKE $1)'
      + ' ORDER BY a.title'
      + ' OFFSET $2'
      + ' LIMIT $3';
    const { result, error: findError } = await this.db.query<at.ArticleSummary>(text, [`%${q}%`, myOffset, myLimit], 'article-text-search');
    if (findError) throw findError;
    data = result.rows;

    if (with_assets && data.length) {
      // with side effect on data
      await this.assetService.find_attach_assets<dm.Article>({ user, data, parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ARTICLE });
    }

    return { data };
  }

  async article_retrieve({ user, id, input }: at.ArticleRetrieveInput): at.ArticleRetrieveOutput {
    // TODO: validate uuid
    // TODO: analytics of 'views' per record per visitor per day
    const { slug = '', with_assets = false } = input;
    if ((id && (id !== '')) || (slug && (slug !== ''))) {
      const condition = id ? { id } : { slug };
      const { row, error } = await this.db.find<dm.Article>(_.TBL_ARTICLE, condition, 1);
      if (!row || error) throw new ErrNotFound(_.MSG_ARTICLE_NOT_FOUND);
      if (with_assets) {
        // with side effect on data
        await this.assetService.find_attach_assets<dm.Article>({ user, data: [ row ], parent_entity_kind: _.ENTITY_ASSET_PARENT_KIND.ARTICLE });
      }
      return { data: row };
    } else {
      return { data: null, error: 'article id or slug required' };
    }
  }

  async article_update({ user, id, input }) {
    // eslint-disable-next-line prefer-const
    let { slug, title, content, keywords } = input;
    const dt = new Date();

    const { row: articleFound, error: findArticleErr } = await this.db.find<dm.Article>(_.TBL_ARTICLE, { id }, 1);
    if (findArticleErr) throw findArticleErr;
    if (!articleFound) throw new ErrNotFound(_.MSG_ARTICLE_NOT_FOUND);
    if (articleFound.created_by !== user.id) throw new ErrForbidden();

    if (!title) title = 'my article at ' + dt.toISOString();
    if (!slug) slug = title;
    slug = makeArticleSlug(slug);
    const change = updateRow({ slug, title, content, keywords, user });
    const { result, error: updateArticleError } = await this.db.update(_.TBL_ARTICLE, { id }, change, 1);
    if (!result || updateArticleError) throw updateArticleError;

    return { data: result && result.rowCount };
  }

  _api() {
    return {
      article_retrieve: this.article_retrieve,
      article_search: this.article_search,
      article_update: this.article_update,
    };
  }
}
