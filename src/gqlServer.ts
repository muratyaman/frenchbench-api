import { ApolloServer, gql } from 'apollo-server-express';
import fs from 'fs';
import path from 'path';
import * as lib from './lib';
import * as codegen from './codegen';
import { IContext } from './types';
import { IFactory } from './factory';
import { ErrNotFound } from './lib';

export function newGqlServer(f: IFactory): ApolloServer {
  const schemaFile = path.resolve(__dirname, '..', 'schema.gql');
  const schemaText = fs.readFileSync(schemaFile);
  const typeDefs   = gql`${schemaText}`;
  const resolvers  = makeResolvers(f);

  const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
    context({ req }): IContext {
      const { user, error } = f.securityMgr.getSessionUser(req);
      console.log('gql ctx', user, error);
      return {
        user,
        f,
      };
    },
  });

  gqlServer.applyMiddleware({ app: f.expressApp, path: '/api/graphql' });

  return gqlServer;
}

export function makeResolvers(f: IFactory): codegen.Resolvers {

  async function findUser(
    input: { id?: string | null; username?: string | null; },
    user: lib.SessionUser,
  ): Promise<lib.UserPublic> {
    let data: lib.UserPublic;
    if (input.id) {
      const result1 = await f.api.user_retrieve({ user, input });
      data = result1.data;
    }
    if (input.username) {
      const result2 = await f.api.user_retrieve_by_username({ user, input });
      data = result2.data;
    }
    return data;
  }


  return {
    Query: {
      me: async(_, args, ctx) => {
        let me;
        if (ctx.user && f.api) {
          const { data } = await f.api.user_retrieve_self({ user: ctx.user });
          me = data;
        }
        if (!me) throw new lib.ErrUnauthorized();
        return me;
      },
      user: async (_, args, ctx) => {
        if (!ctx.user) throw new lib.ErrUnauthorized();
        if (!args.filter.id && !args.filter.username) throw new lib.ErrNotFound();
        return findUser(args.filter, ctx.user);
      },
      users: async (_, args, ctx) => {
        if (!ctx.user) throw new lib.ErrUnauthorized();
        const { data, meta } = await f.api.user_search({ user: ctx.user, input: args.filter });
        return { data: data ?? [], meta };
      },
      posts: async (_, args, ctx) => {
        if (!ctx.user) throw new lib.ErrUnauthorized();
        const { data, meta } = await f.api.post_search({ user: ctx.user, input: args.filter });
        return { data: data ?? [], meta };
      },
      adverts: async (_, args, ctx) => {
        if (!ctx.user) throw new lib.ErrUnauthorized();
        const { data, meta } = await f.api.advert_search({ user: ctx.user, input: args.filter });
        return { data: data ?? [], meta };
      },
    },
    Mutation: {

    },
    User: {
      id: p => p.id,
      username: p => p.username,
      first_name: p => p.first_name ?? null,
      last_name: p => p.last_name ?? null,
      email: p => p.email ?? null,
      email_verified: p => p.email_verified !== 0,
      phone: p => p.phone ?? null,
      phone_verified: p => p.phone_verified !== 0,
      headline: p => p.headline ?? null,
      neighbourhood: p => p.neighbourhood ?? null,
    },
    Asset: {

    },
    Advert: {
      owner: async (p, args, ctx) => {
        const { data } = await f.api.user_retrieve({ id: p.user_id });
        return data;
      },
      assets: async (p, args, ctx) => {
        const { data = [], meta } = await f.api.entity_asset_search({
          input: { parent_entity_kind: lib.EntityKindEnum.ADVERTS, parent_entity_ids: [ p.id ] },
        });
        return { data, meta, parent_entity_kind: lib.EntityKindEnum.ADVERTS, parent_entity_id: p.id };
      },
    },
    Post: {
      owner: async (p, args, ctx) => {
        const { data } = await f.api.user_retrieve({ id: p.user_id });
        return data;
      },
      assets: async (p, args, ctx) => {
        const { data = [], meta } = await f.api.entity_asset_search({
          input: { parent_entity_kind: lib.EntityKindEnum.POSTS, parent_entity_ids: [ p.id ] },
        });
        return { data, meta, parent_entity_kind: lib.EntityKindEnum.POSTS, parent_entity_id: p.id };
      },
    },
    AssetRelation: {
      asset: async (p, args, ctx) => {
        if (p.asset) return p.asset;
        const { data } = await f.api.asset_retrieve({ id: p.asset_id });
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
      IMAGE_JPEG: lib.AssetMediaTypeEnum.IMAGE_JPEG,
      IMAGE_PNG: lib.AssetMediaTypeEnum.IMAGE_PNG,
    },
    AssetPurposeEnum: {
      ADVERT_IMAGE: lib.AssetPurposeEnum.ADVERT_IMAGE,
      POST_IMAGE: lib.AssetPurposeEnum.POST_IMAGE,
    },
    AssetTypeEnum: {
      IMAGE: lib.AssetTypeEnum.IMAGE,
    },
    EntityKindEnum: {
      ADVERTS: lib.EntityKindEnum.ADVERTS,
      ARTICLES: lib.EntityKindEnum.ARTICLES,
      POSTS: lib.EntityKindEnum.POSTS,
      USERS: lib.EntityKindEnum.USERS,
    },
  }
}
