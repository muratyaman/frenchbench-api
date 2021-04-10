import { AssetMediaTypeEnum } from '../enums';
import { AssetPurposeEnum } from '../enums';
import { AssetTypeEnum } from '../enums';
import { EntityKindEnum } from '../enums';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { UserMapper, UserSummaryMapper, UserListMapper, AdvertMapper, AdvertSummaryMapper, AdvertListMapper, PostMapper, PostSummaryMapper, PostListMapper, AssetMapper, AssetRelationListMapper, ListMetaMapper } from '../mappers';
import { IContext } from '../types';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  DateTime: any;
};

export type Advert = {
  __typename?: 'Advert';
  id: Scalars['ID'];
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
  tags: Scalars['String'];
  user_id: Scalars['ID'];
  owner?: Maybe<User>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['Date']>;
  created_by?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['Date']>;
  updated_by?: Maybe<Scalars['String']>;
  is_buying: Scalars['Int'];
  is_service: Scalars['Int'];
  price?: Maybe<Scalars['Float']>;
  currency: Scalars['String'];
  assets?: Maybe<AssetRelationList>;
};

export type AdvertFilter = {
  id?: Maybe<Scalars['ID']>;
  user_id?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
};

export type AdvertList = {
  __typename?: 'AdvertList';
  data: Array<AdvertSummary>;
  meta: ListMeta;
};

export type AdvertSummary = {
  __typename?: 'AdvertSummary';
  id: Scalars['ID'];
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
  tags: Scalars['String'];
  user_id: Scalars['ID'];
  username: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['Date']>;
  is_buying: Scalars['Int'];
  is_service: Scalars['Int'];
  price?: Maybe<Scalars['Float']>;
  currency: Scalars['String'];
  assets?: Maybe<AssetRelationList>;
};

export type AdvertsFilter = {
  q?: Maybe<Scalars['String']>;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  tags?: Maybe<Scalars['String']>;
  user_id?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
};

export type Asset = {
  __typename?: 'Asset';
  id: Scalars['ID'];
  asset_type: AssetTypeEnum;
  media_type: Scalars['String'];
  label: Scalars['String'];
  url: Scalars['String'];
  meta: AssetMeta;
  created_at?: Maybe<Scalars['Date']>;
  created_by?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['Date']>;
  updated_by?: Maybe<Scalars['String']>;
};

export { AssetMediaTypeEnum };

export type AssetMeta = {
  __typename?: 'AssetMeta';
  Key: Scalars['String'];
  ETag?: Maybe<Scalars['String']>;
  Bucket?: Maybe<Scalars['String']>;
  Location: Scalars['String'];
  file_size: Scalars['Int'];
};

export { AssetPurposeEnum };

export type AssetRelation = {
  __typename?: 'AssetRelation';
  id: Scalars['ID'];
  parent_entity_kind: EntityKindEnum;
  parent_entity_id: Scalars['ID'];
  purpose: AssetPurposeEnum;
  meta?: Maybe<Scalars['String']>;
  asset_id: Scalars['ID'];
  asset?: Maybe<Asset>;
  created_at?: Maybe<Scalars['Date']>;
  created_by?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['Date']>;
  updated_by?: Maybe<Scalars['String']>;
};

export type AssetRelationList = {
  __typename?: 'AssetRelationList';
  parent_entity_kind?: Maybe<EntityKindEnum>;
  parent_entity_id: Scalars['ID'];
  data: Array<AssetRelation>;
  meta: ListMeta;
};

export { AssetTypeEnum };

export type CreateAdvertInput = {
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
  tags: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  is_buying: Scalars['Int'];
  is_service: Scalars['Int'];
  price?: Maybe<Scalars['Float']>;
  currency: Scalars['String'];
};

export type CreateAdvertOutput = {
  __typename?: 'CreateAdvertOutput';
  id: Scalars['ID'];
  success: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
};

export type CreatePostInput = {
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
  tags: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
};

export type CreatePostOutput = {
  __typename?: 'CreatePostOutput';
  id: Scalars['ID'];
  success: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
};



export type DeleteAdvertOutput = {
  __typename?: 'DeleteAdvertOutput';
  success: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
};

export type DeletePostOutput = {
  __typename?: 'DeletePostOutput';
  success: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
};

export { EntityKindEnum };

export type ListMeta = {
  __typename?: 'ListMeta';
  row_count: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost: CreatePostOutput;
  updatePost: UpdatePostOutput;
  deletePost: DeletePostOutput;
  createAdvert: CreateAdvertOutput;
  updateAdvert: UpdateAdvertOutput;
  deleteAdvert: DeleteAdvertOutput;
};


export type MutationCreatePostArgs = {
  data: CreatePostInput;
};


export type MutationUpdatePostArgs = {
  id: Scalars['ID'];
  data: UpdatePostInput;
};


export type MutationDeletePostArgs = {
  id: Scalars['ID'];
};


export type MutationCreateAdvertArgs = {
  data: CreateAdvertInput;
};


export type MutationUpdateAdvertArgs = {
  id: Scalars['ID'];
  data: UpdateAdvertInput;
};


export type MutationDeleteAdvertArgs = {
  id: Scalars['ID'];
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['ID'];
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
  tags: Scalars['String'];
  user_id: Scalars['ID'];
  owner: User;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['Date']>;
  created_by?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['Date']>;
  updated_by?: Maybe<Scalars['String']>;
  assets?: Maybe<AssetRelationList>;
};

export type PostFilter = {
  id?: Maybe<Scalars['ID']>;
  user_id?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
};

export type PostList = {
  __typename?: 'PostList';
  data: Array<PostSummary>;
  meta: ListMeta;
};

export type PostSummary = {
  __typename?: 'PostSummary';
  id: Scalars['ID'];
  slug: Scalars['String'];
  title: Scalars['String'];
  tags: Scalars['String'];
  user_id: Scalars['ID'];
  username: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['Date']>;
  assets?: Maybe<AssetRelationList>;
};

export type PostsFilter = {
  q?: Maybe<Scalars['String']>;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  tags?: Maybe<Scalars['String']>;
  user_id?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  me: User;
  user: User;
  users: UserList;
  post: Post;
  posts: PostList;
  advert: Advert;
  adverts: AdvertList;
};


export type QueryUserArgs = {
  filter?: Maybe<UserFilter>;
};


export type QueryUsersArgs = {
  filter?: Maybe<UsersFilter>;
};


export type QueryPostArgs = {
  filter?: Maybe<PostFilter>;
};


export type QueryPostsArgs = {
  filter?: Maybe<PostsFilter>;
};


export type QueryAdvertArgs = {
  filter?: Maybe<AdvertFilter>;
};


export type QueryAdvertsArgs = {
  filter?: Maybe<AdvertsFilter>;
};

export type UpdateAdvertInput = {
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
  tags: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  is_buying: Scalars['Int'];
  is_service: Scalars['Int'];
  price?: Maybe<Scalars['Float']>;
  currency: Scalars['String'];
};

export type UpdateAdvertOutput = {
  __typename?: 'UpdateAdvertOutput';
  success: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
};

export type UpdatePostInput = {
  slug: Scalars['String'];
  title: Scalars['String'];
  content: Scalars['String'];
  tags: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
};

export type UpdatePostOutput = {
  __typename?: 'UpdatePostOutput';
  success: Scalars['Boolean'];
  error?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  username: Scalars['String'];
  first_name?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  email_verified: Scalars['Boolean'];
  phone?: Maybe<Scalars['String']>;
  phone_verified: Scalars['Boolean'];
  headline?: Maybe<Scalars['String']>;
  neighbourhood?: Maybe<Scalars['String']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  geo_updated_at?: Maybe<Scalars['Date']>;
  created_at?: Maybe<Scalars['Date']>;
  created_by?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['Date']>;
  updated_by?: Maybe<Scalars['String']>;
  assets?: Maybe<AssetRelationList>;
};

export type UserFilter = {
  id?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
};

export type UserList = {
  __typename?: 'UserList';
  data: Array<UserSummary>;
  meta: ListMeta;
};

export type UserSummary = {
  __typename?: 'UserSummary';
  id: Scalars['ID'];
  username: Scalars['String'];
  email_verified: Scalars['Boolean'];
  phone_verified: Scalars['Boolean'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  geo_accuracy?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['Date']>;
  assets?: Maybe<AssetRelationList>;
};

export type UsersFilter = {
  q?: Maybe<Scalars['String']>;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  user_id?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Advert: ResolverTypeWrapper<AdvertMapper>;
  ID: ResolverTypeWrapper<any>;
  String: ResolverTypeWrapper<any>;
  Float: ResolverTypeWrapper<any>;
  Int: ResolverTypeWrapper<any>;
  AdvertFilter: ResolverTypeWrapper<any>;
  AdvertList: ResolverTypeWrapper<AdvertListMapper>;
  AdvertSummary: ResolverTypeWrapper<AdvertSummaryMapper>;
  AdvertsFilter: ResolverTypeWrapper<any>;
  Asset: ResolverTypeWrapper<AssetMapper>;
  AssetMediaTypeEnum: AssetMediaTypeEnum;
  AssetMeta: ResolverTypeWrapper<any>;
  AssetPurposeEnum: AssetPurposeEnum;
  AssetRelation: ResolverTypeWrapper<any>;
  AssetRelationList: ResolverTypeWrapper<AssetRelationListMapper>;
  AssetTypeEnum: AssetTypeEnum;
  CreateAdvertInput: ResolverTypeWrapper<any>;
  CreateAdvertOutput: ResolverTypeWrapper<any>;
  Boolean: ResolverTypeWrapper<any>;
  CreatePostInput: ResolverTypeWrapper<any>;
  CreatePostOutput: ResolverTypeWrapper<any>;
  Date: ResolverTypeWrapper<any>;
  DateTime: ResolverTypeWrapper<any>;
  DeleteAdvertOutput: ResolverTypeWrapper<any>;
  DeletePostOutput: ResolverTypeWrapper<any>;
  EntityKindEnum: EntityKindEnum;
  ListMeta: ResolverTypeWrapper<ListMetaMapper>;
  Mutation: ResolverTypeWrapper<{}>;
  Post: ResolverTypeWrapper<PostMapper>;
  PostFilter: ResolverTypeWrapper<any>;
  PostList: ResolverTypeWrapper<PostListMapper>;
  PostSummary: ResolverTypeWrapper<PostSummaryMapper>;
  PostsFilter: ResolverTypeWrapper<any>;
  Query: ResolverTypeWrapper<{}>;
  UpdateAdvertInput: ResolverTypeWrapper<any>;
  UpdateAdvertOutput: ResolverTypeWrapper<any>;
  UpdatePostInput: ResolverTypeWrapper<any>;
  UpdatePostOutput: ResolverTypeWrapper<any>;
  User: ResolverTypeWrapper<UserMapper>;
  UserFilter: ResolverTypeWrapper<any>;
  UserList: ResolverTypeWrapper<UserListMapper>;
  UserSummary: ResolverTypeWrapper<UserSummaryMapper>;
  UsersFilter: ResolverTypeWrapper<any>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Advert: AdvertMapper;
  ID: any;
  String: any;
  Float: any;
  Int: any;
  AdvertFilter: any;
  AdvertList: AdvertListMapper;
  AdvertSummary: AdvertSummaryMapper;
  AdvertsFilter: any;
  Asset: AssetMapper;
  AssetMeta: any;
  AssetRelation: any;
  AssetRelationList: AssetRelationListMapper;
  CreateAdvertInput: any;
  CreateAdvertOutput: any;
  Boolean: any;
  CreatePostInput: any;
  CreatePostOutput: any;
  Date: any;
  DateTime: any;
  DeleteAdvertOutput: any;
  DeletePostOutput: any;
  ListMeta: ListMetaMapper;
  Mutation: {};
  Post: PostMapper;
  PostFilter: any;
  PostList: PostListMapper;
  PostSummary: PostSummaryMapper;
  PostsFilter: any;
  Query: {};
  UpdateAdvertInput: any;
  UpdateAdvertOutput: any;
  UpdatePostInput: any;
  UpdatePostOutput: any;
  User: UserMapper;
  UserFilter: any;
  UserList: UserListMapper;
  UserSummary: UserSummaryMapper;
  UsersFilter: any;
};

export type AdvertResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['Advert'] = ResolversParentTypes['Advert']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  geo_accuracy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  is_buying?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  is_service?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assets?: Resolver<Maybe<ResolversTypes['AssetRelationList']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AdvertListResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['AdvertList'] = ResolversParentTypes['AdvertList']> = {
  data?: Resolver<Array<ResolversTypes['AdvertSummary']>, ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['ListMeta'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AdvertSummaryResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['AdvertSummary'] = ResolversParentTypes['AdvertSummary']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  geo_accuracy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  is_buying?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  is_service?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assets?: Resolver<Maybe<ResolversTypes['AssetRelationList']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssetResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['Asset'] = ResolversParentTypes['Asset']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  asset_type?: Resolver<ResolversTypes['AssetTypeEnum'], ParentType, ContextType>;
  media_type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['AssetMeta'], ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssetMediaTypeEnumResolvers = EnumResolverSignature<{ IMAGE_JPEG?: any, IMAGE_PNG?: any }, ResolversTypes['AssetMediaTypeEnum']>;

export type AssetMetaResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['AssetMeta'] = ResolversParentTypes['AssetMeta']> = {
  Key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ETag?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Bucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  file_size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssetPurposeEnumResolvers = EnumResolverSignature<{ USER_PROFILE_IMAGE?: any, POST_IMAGE?: any, ADVERT_IMAGE?: any, ARTICLE_IMAGE?: any }, ResolversTypes['AssetPurposeEnum']>;

export type AssetRelationResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['AssetRelation'] = ResolversParentTypes['AssetRelation']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent_entity_kind?: Resolver<ResolversTypes['EntityKindEnum'], ParentType, ContextType>;
  parent_entity_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  purpose?: Resolver<ResolversTypes['AssetPurposeEnum'], ParentType, ContextType>;
  meta?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  asset_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  asset?: Resolver<Maybe<ResolversTypes['Asset']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssetRelationListResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['AssetRelationList'] = ResolversParentTypes['AssetRelationList']> = {
  parent_entity_kind?: Resolver<Maybe<ResolversTypes['EntityKindEnum']>, ParentType, ContextType>;
  parent_entity_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  data?: Resolver<Array<ResolversTypes['AssetRelation']>, ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['ListMeta'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssetTypeEnumResolvers = EnumResolverSignature<{ IMAGE?: any }, ResolversTypes['AssetTypeEnum']>;

export type CreateAdvertOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['CreateAdvertOutput'] = ResolversParentTypes['CreateAdvertOutput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreatePostOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['CreatePostOutput'] = ResolversParentTypes['CreatePostOutput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteAdvertOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['DeleteAdvertOutput'] = ResolversParentTypes['DeleteAdvertOutput']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeletePostOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['DeletePostOutput'] = ResolversParentTypes['DeletePostOutput']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EntityKindEnumResolvers = EnumResolverSignature<{ POSTS?: any, ADVERTS?: any, ARTICLES?: any, USERS?: any }, ResolversTypes['EntityKindEnum']>;

export type ListMetaResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['ListMeta'] = ResolversParentTypes['ListMeta']> = {
  row_count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createPost?: Resolver<ResolversTypes['CreatePostOutput'], ParentType, ContextType, RequireFields<MutationCreatePostArgs, 'data'>>;
  updatePost?: Resolver<ResolversTypes['UpdatePostOutput'], ParentType, ContextType, RequireFields<MutationUpdatePostArgs, 'id' | 'data'>>;
  deletePost?: Resolver<ResolversTypes['DeletePostOutput'], ParentType, ContextType, RequireFields<MutationDeletePostArgs, 'id'>>;
  createAdvert?: Resolver<ResolversTypes['CreateAdvertOutput'], ParentType, ContextType, RequireFields<MutationCreateAdvertArgs, 'data'>>;
  updateAdvert?: Resolver<ResolversTypes['UpdateAdvertOutput'], ParentType, ContextType, RequireFields<MutationUpdateAdvertArgs, 'id' | 'data'>>;
  deleteAdvert?: Resolver<ResolversTypes['DeleteAdvertOutput'], ParentType, ContextType, RequireFields<MutationDeleteAdvertArgs, 'id'>>;
};

export type PostResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  geo_accuracy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assets?: Resolver<Maybe<ResolversTypes['AssetRelationList']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostListResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['PostList'] = ResolversParentTypes['PostList']> = {
  data?: Resolver<Array<ResolversTypes['PostSummary']>, ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['ListMeta'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostSummaryResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['PostSummary'] = ResolversParentTypes['PostSummary']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  geo_accuracy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  assets?: Resolver<Maybe<ResolversTypes['AssetRelationList']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, never>>;
  users?: Resolver<ResolversTypes['UserList'], ParentType, ContextType, RequireFields<QueryUsersArgs, never>>;
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType, RequireFields<QueryPostArgs, never>>;
  posts?: Resolver<ResolversTypes['PostList'], ParentType, ContextType, RequireFields<QueryPostsArgs, never>>;
  advert?: Resolver<ResolversTypes['Advert'], ParentType, ContextType, RequireFields<QueryAdvertArgs, never>>;
  adverts?: Resolver<ResolversTypes['AdvertList'], ParentType, ContextType, RequireFields<QueryAdvertsArgs, never>>;
};

export type UpdateAdvertOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['UpdateAdvertOutput'] = ResolversParentTypes['UpdateAdvertOutput']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatePostOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['UpdatePostOutput'] = ResolversParentTypes['UpdatePostOutput']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone_verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  headline?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  neighbourhood?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  geo_accuracy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  geo_updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updated_by?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assets?: Resolver<Maybe<ResolversTypes['AssetRelationList']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserListResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['UserList'] = ResolversParentTypes['UserList']> = {
  data?: Resolver<Array<ResolversTypes['UserSummary']>, ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['ListMeta'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSummaryResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['UserSummary'] = ResolversParentTypes['UserSummary']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email_verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  phone_verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  geo_accuracy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  assets?: Resolver<Maybe<ResolversTypes['AssetRelationList']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = IContext> = {
  Advert?: AdvertResolvers<ContextType>;
  AdvertList?: AdvertListResolvers<ContextType>;
  AdvertSummary?: AdvertSummaryResolvers<ContextType>;
  Asset?: AssetResolvers<ContextType>;
  AssetMediaTypeEnum?: AssetMediaTypeEnumResolvers;
  AssetMeta?: AssetMetaResolvers<ContextType>;
  AssetPurposeEnum?: AssetPurposeEnumResolvers;
  AssetRelation?: AssetRelationResolvers<ContextType>;
  AssetRelationList?: AssetRelationListResolvers<ContextType>;
  AssetTypeEnum?: AssetTypeEnumResolvers;
  CreateAdvertOutput?: CreateAdvertOutputResolvers<ContextType>;
  CreatePostOutput?: CreatePostOutputResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  DeleteAdvertOutput?: DeleteAdvertOutputResolvers<ContextType>;
  DeletePostOutput?: DeletePostOutputResolvers<ContextType>;
  EntityKindEnum?: EntityKindEnumResolvers;
  ListMeta?: ListMetaResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  PostList?: PostListResolvers<ContextType>;
  PostSummary?: PostSummaryResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UpdateAdvertOutput?: UpdateAdvertOutputResolvers<ContextType>;
  UpdatePostOutput?: UpdatePostOutputResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserList?: UserListResolvers<ContextType>;
  UserSummary?: UserSummaryResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = IContext> = Resolvers<ContextType>;
