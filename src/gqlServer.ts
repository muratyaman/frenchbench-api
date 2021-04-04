import { ApolloServer, gql } from 'apollo-server-express';
import fs from 'fs';
import path from 'path';
import * as lib from './lib';
import * as codegen from './codegen';
import { IContext } from './types';
import { IFactory } from './factory';

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
    user: lib.ISessionUser,
  ): Promise<lib.IUserPublic> {
    let data: lib.IUserPublic;
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
    },
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
    }
  }
}
