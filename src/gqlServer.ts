import { ApolloServer, gql } from 'apollo-server-express';
import fs from 'fs';
import path from 'path';
import * as codegen from './codegen';
import { IContext } from './types';
import { IFactory } from './factory';
import { getFields } from './gqlUtils';
import {
  ErrBadRequest, ErrNotFound, ErrUnauthorized, UserPublic,
  EntityKindEnum, AssetMediaTypeEnum, AssetPurposeEnum, AssetTypeEnum,
} from './fblib';

export function newGqlServer(f: IFactory): ApolloServer {
  const schemaFile = path.resolve(__dirname, '..', 'schema.gql');
  const schemaText = fs.readFileSync(schemaFile);
  const typeDefs   = gql`${schemaText}`;
  const resolvers  = makeResolvers(f);

  const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
    context({ req }): IContext {
      const { user, error: tokenError } = f.securityMgr.getSessionUser(req);
      console.log('gql ctx', user, tokenError);
      return { f, user, tokenError };
    },
  });

  gqlServer.applyMiddleware({ app: f.expressApp, path: '/api/graphql' });

  return gqlServer;
}

export function makeResolvers({ api }: IFactory): codegen.Resolvers {
  const { _isAllowed, _services } = api;
  return {
    Query: {
      me: async(_, args, { user, tokenError }, info) => {
        _isAllowed({ action: 'me', user, tokenError }); // will throw error
        let me;
        if (user) {
          const { data } = await _services.user.me({ user, input: { fields: getFields(info) } });
          me = data;
        }
        if (!me) throw new ErrUnauthorized();
        return me;
      },
      user: async (_, { filter }, { user, tokenError }, info) => {
        _isAllowed({ action: 'user_retrieve', user, tokenError }); // will throw error
        let data: UserPublic;
        if (filter.id) {
          const { data: user1 } = await _services.user.user_retrieve({ user, input: { ...filter, fields: getFields(info) } });
          if (user1) data = user1;
        } else if (filter.username) {
          const { data: user2 } = await _services.user.user_retrieve_by_username({ user, input: { ...filter, fields: getFields(info) } });
          if (user2) data = user2;
        } else throw new ErrBadRequest();
        if (!data) throw new ErrNotFound();
        return data;
      },
      users: async (_, { filter }, { user, tokenError }, info) => {
        _isAllowed({ action: 'user_search', user, tokenError }); // will throw error
        const { data, meta } = await _services.user.user_search({ user, input: { ...filter, fields: getFields(info) }});
        return { data: data ?? [], meta };
      },
      post: async (_, { filter }, { user, tokenError }, info) => {
        _isAllowed({ action: 'post_retrieve', user, tokenError }); // will throw error
        const { data } = await _services.post.post_retrieve({ user, input: { ...filter, fields: getFields(info) } });
        return data;
      },
      posts: async (_, { filter }, { user, tokenError }, info) => {
        _isAllowed({ action: 'post_search', user, tokenError }); // will throw error
        return _services.post.post_search({ user, input: { ...filter, fields: getFields(info) } });
      },
      advert: async (_, { filter }, { user, tokenError }, info) => {
        _isAllowed({ action: 'advert_retrieve', user, tokenError }); // will throw error
        const { data } = await _services.advert.advert_retrieve({ user, input: { ...filter, fields: getFields(info) } });
        return data;
      },
      adverts: async (_, { filter }, { user, tokenError }, info) => {
        _isAllowed({ action: 'advert_search', user, tokenError }); // will throw error
        return _services.advert.advert_search({ user, input: { ...filter, fields: getFields(info) } });
      },
    },
    Mutation: {
      signUp: async (_, { data }) => {
        const res = await _services.user.signup({ input: data }); // will throw error
        if (!res.data) throw new ErrBadRequest();
        // TODO: set session cookie
        return res.data;
      },
      signIn: async (_, { data }) => {
        const res = await _services.user.signin({ input: data }); // will throw error
        if (!res.data) throw new ErrBadRequest();
        // TODO: set session cookie
        return res.data;
      },
      signOut: async () => {
        // TODO: set session cookie to ''
        return true;
      },
    },
    User: {
      id: p => p.id,
      username: p => p.username,
      first_name: p => p.first_name ?? null,
      last_name: p => p.last_name ?? null,
      email: p => p.email ?? null,
      email_verified: p => p.email_verified !== 0,
      phone_mobile: p => p.phone_mobile ?? null,
      phone_mobile_verified: p => p.phone_mobile_verified !== 0,
      headline: p => p.headline ?? null,
      neighbourhood: p => p.neighbourhood ?? null,
      link_website: p => p.link_website ?? null,
      link_facebook: p => p.link_facebook ?? null,
      link_instagram: p => p.link_instagram ?? null,
      link_twitter: p => p.link_twitter ?? null,
      link_linkedin: p => p.link_linkedin ?? null,
      link_youtube: p => p.link_youtube ?? null,
    },
    Asset: {
      id: p => p.id,
    },
    Advert: {
      owner: async (p, args, ctx) => {
        const { data } = await _services.user.user_retrieve({ id: p.user_id });
        return data;
      },
      assets: async (p, args, ctx) => {
        const { data = [], meta } = await _services.asset.entity_asset_search({
          input: { parent_entity_kind: EntityKindEnum.ADVERTS, parent_entity_ids: [ p.id ] },
        });
        return { data, meta, parent_entity_kind: EntityKindEnum.ADVERTS, parent_entity_id: p.id };
      },
    },
    Post: {
      owner: async (p, args, ctx) => {
        const { data } = await _services.user.user_retrieve({ id: p.user_id });
        return data;
      },
      assets: async (p, args, ctx) => {
        const { data = [], meta } = await _services.asset.entity_asset_search({
          input: { parent_entity_kind: EntityKindEnum.POSTS, parent_entity_ids: [ p.id ] },
        });
        return { data, meta, parent_entity_kind: EntityKindEnum.POSTS, parent_entity_id: p.id };
      },
    },
    AssetRelation: {
      asset: async (p, args, ctx) => {
        if (p.asset) return p.asset;
        const { data } = await _services.asset.asset_retrieve({ id: p.asset_id });
        return data;
      },
    },
    AssetRelationList: {
      parent_entity_kind: p => p.parent_entity_kind ?? null,
      parent_entity_id: p => p.parent_entity_id,
      data: p => p.data,
      meta: p => p.meta,
    },
    ListMeta: {
      row_count: p => p.row_count,
    },
    // ENUMS ==============================================
    AssetMediaTypeEnum: {
      IMAGE_JPEG: AssetMediaTypeEnum.IMAGE_JPEG,
      IMAGE_PNG: AssetMediaTypeEnum.IMAGE_PNG,
    },
    AssetPurposeEnum: {
      ADVERT_IMAGE: AssetPurposeEnum.ADVERT_IMAGE,
      POST_IMAGE: AssetPurposeEnum.POST_IMAGE,
    },
    AssetTypeEnum: {
      IMAGE: AssetTypeEnum.IMAGE,
    },
    EntityKindEnum: {
      ADVERTS: EntityKindEnum.ADVERTS,
      ARTICLES: EntityKindEnum.ARTICLES,
      POSTS: EntityKindEnum.POSTS,
      USERS: EntityKindEnum.USERS,
    },
  }
}
