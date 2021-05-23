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
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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
  geo_updated_at?: Maybe<Scalars['Date']>;
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
  signUp: SignUpOutput;
  signIn: SignInOutput;
  signOut: Scalars['Boolean'];
  createPost: CreatePostOutput;
  updatePost: UpdatePostOutput;
  deletePost: DeletePostOutput;
  createAdvert: CreateAdvertOutput;
  updateAdvert: UpdateAdvertOutput;
  deleteAdvert: DeleteAdvertOutput;
};


export type MutationSignUpArgs = {
  data: SignUpInput;
};


export type MutationSignInArgs = {
  data: SignInInput;
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
  geo_updated_at?: Maybe<Scalars['Date']>;
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
  filter: UserFilter;
};


export type QueryUsersArgs = {
  filter?: Maybe<UsersFilter>;
};


export type QueryPostArgs = {
  filter: PostFilter;
};


export type QueryPostsArgs = {
  filter?: Maybe<PostsFilter>;
};


export type QueryAdvertArgs = {
  filter: AdvertFilter;
};


export type QueryAdvertsArgs = {
  filter?: Maybe<AdvertsFilter>;
};

export type SignInInput = {
  username: Scalars['String'];
  password: Scalars['String'];
};

export type SignInOutput = {
  __typename?: 'SignInOutput';
  id: Scalars['ID'];
  username: Scalars['String'];
  token_type: Scalars['String'];
  token: Scalars['String'];
};

export type SignUpInput = {
  username: Scalars['String'];
  password: Scalars['String'];
  password_confirm: Scalars['String'];
};

export type SignUpOutput = {
  __typename?: 'SignUpOutput';
  id: Scalars['ID'];
  username: Scalars['String'];
  token_type: Scalars['String'];
  token: Scalars['String'];
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
  phone_mobile?: Maybe<Scalars['String']>;
  phone_mobile_verified: Scalars['Boolean'];
  headline?: Maybe<Scalars['String']>;
  neighbourhood?: Maybe<Scalars['String']>;
  link_website?: Maybe<Scalars['String']>;
  link_facebook?: Maybe<Scalars['String']>;
  link_instagram?: Maybe<Scalars['String']>;
  link_twitter?: Maybe<Scalars['String']>;
  link_linkedin?: Maybe<Scalars['String']>;
  link_youtube?: Maybe<Scalars['String']>;
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
  phone_mobile_verified: Scalars['Boolean'];
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
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  AdvertFilter: AdvertFilter;
  AdvertList: ResolverTypeWrapper<AdvertListMapper>;
  AdvertSummary: ResolverTypeWrapper<AdvertSummaryMapper>;
  AdvertsFilter: AdvertsFilter;
  Asset: ResolverTypeWrapper<AssetMapper>;
  AssetMediaTypeEnum: AssetMediaTypeEnum;
  AssetMeta: ResolverTypeWrapper<AssetMeta>;
  AssetPurposeEnum: AssetPurposeEnum;
  AssetRelation: ResolverTypeWrapper<Omit<AssetRelation, 'asset'> & { asset?: Maybe<ResolversTypes['Asset']> }>;
  AssetRelationList: ResolverTypeWrapper<AssetRelationListMapper>;
  AssetTypeEnum: AssetTypeEnum;
  CreateAdvertInput: CreateAdvertInput;
  CreateAdvertOutput: ResolverTypeWrapper<CreateAdvertOutput>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CreatePostInput: CreatePostInput;
  CreatePostOutput: ResolverTypeWrapper<CreatePostOutput>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteAdvertOutput: ResolverTypeWrapper<DeleteAdvertOutput>;
  DeletePostOutput: ResolverTypeWrapper<DeletePostOutput>;
  EntityKindEnum: EntityKindEnum;
  ListMeta: ResolverTypeWrapper<ListMetaMapper>;
  Mutation: ResolverTypeWrapper<{}>;
  Post: ResolverTypeWrapper<PostMapper>;
  PostFilter: PostFilter;
  PostList: ResolverTypeWrapper<PostListMapper>;
  PostSummary: ResolverTypeWrapper<PostSummaryMapper>;
  PostsFilter: PostsFilter;
  Query: ResolverTypeWrapper<{}>;
  SignInInput: SignInInput;
  SignInOutput: ResolverTypeWrapper<SignInOutput>;
  SignUpInput: SignUpInput;
  SignUpOutput: ResolverTypeWrapper<SignUpOutput>;
  UpdateAdvertInput: UpdateAdvertInput;
  UpdateAdvertOutput: ResolverTypeWrapper<UpdateAdvertOutput>;
  UpdatePostInput: UpdatePostInput;
  UpdatePostOutput: ResolverTypeWrapper<UpdatePostOutput>;
  User: ResolverTypeWrapper<UserMapper>;
  UserFilter: UserFilter;
  UserList: ResolverTypeWrapper<UserListMapper>;
  UserSummary: ResolverTypeWrapper<UserSummaryMapper>;
  UsersFilter: UsersFilter;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Advert: AdvertMapper;
  ID: Scalars['ID'];
  String: Scalars['String'];
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  AdvertFilter: AdvertFilter;
  AdvertList: AdvertListMapper;
  AdvertSummary: AdvertSummaryMapper;
  AdvertsFilter: AdvertsFilter;
  Asset: AssetMapper;
  AssetMeta: AssetMeta;
  AssetRelation: Omit<AssetRelation, 'asset'> & { asset?: Maybe<ResolversParentTypes['Asset']> };
  AssetRelationList: AssetRelationListMapper;
  CreateAdvertInput: CreateAdvertInput;
  CreateAdvertOutput: CreateAdvertOutput;
  Boolean: Scalars['Boolean'];
  CreatePostInput: CreatePostInput;
  CreatePostOutput: CreatePostOutput;
  Date: Scalars['Date'];
  DateTime: Scalars['DateTime'];
  DeleteAdvertOutput: DeleteAdvertOutput;
  DeletePostOutput: DeletePostOutput;
  ListMeta: ListMetaMapper;
  Mutation: {};
  Post: PostMapper;
  PostFilter: PostFilter;
  PostList: PostListMapper;
  PostSummary: PostSummaryMapper;
  PostsFilter: PostsFilter;
  Query: {};
  SignInInput: SignInInput;
  SignInOutput: SignInOutput;
  SignUpInput: SignUpInput;
  SignUpOutput: SignUpOutput;
  UpdateAdvertInput: UpdateAdvertInput;
  UpdateAdvertOutput: UpdateAdvertOutput;
  UpdatePostInput: UpdatePostInput;
  UpdatePostOutput: UpdatePostOutput;
  User: UserMapper;
  UserFilter: UserFilter;
  UserList: UserListMapper;
  UserSummary: UserSummaryMapper;
  UsersFilter: UsersFilter;
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
  geo_updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
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
  signUp?: Resolver<ResolversTypes['SignUpOutput'], ParentType, ContextType, RequireFields<MutationSignUpArgs, 'data'>>;
  signIn?: Resolver<ResolversTypes['SignInOutput'], ParentType, ContextType, RequireFields<MutationSignInArgs, 'data'>>;
  signOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  geo_updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
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
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'filter'>>;
  users?: Resolver<ResolversTypes['UserList'], ParentType, ContextType, RequireFields<QueryUsersArgs, never>>;
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType, RequireFields<QueryPostArgs, 'filter'>>;
  posts?: Resolver<ResolversTypes['PostList'], ParentType, ContextType, RequireFields<QueryPostsArgs, never>>;
  advert?: Resolver<ResolversTypes['Advert'], ParentType, ContextType, RequireFields<QueryAdvertArgs, 'filter'>>;
  adverts?: Resolver<ResolversTypes['AdvertList'], ParentType, ContextType, RequireFields<QueryAdvertsArgs, never>>;
};

export type SignInOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['SignInOutput'] = ResolversParentTypes['SignInOutput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token_type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignUpOutputResolvers<ContextType = IContext, ParentType extends ResolversParentTypes['SignUpOutput'] = ResolversParentTypes['SignUpOutput']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token_type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  phone_mobile?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone_mobile_verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  headline?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  neighbourhood?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link_website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link_facebook?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link_instagram?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link_twitter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link_linkedin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link_youtube?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  phone_mobile_verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  SignInOutput?: SignInOutputResolvers<ContextType>;
  SignUpOutput?: SignUpOutputResolvers<ContextType>;
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
