/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: any; output: any };
  /**
   * Allows use of a JSON String for input / output from the GraphQL schema.
   *
   * Use of this type is *not recommended* as you lose the benefits of having a defined, static
   * schema (one of the key benefits of GraphQL).
   */
  JSONString: { input: any; output: any };
  /**
   * Leverages the internal Python implmeentation of UUID (uuid.UUID) to provide native UUID objects
   * in fields, resolvers and input.
   */
  UUID: { input: any; output: any };
};

export type AddTagToCustomSet = {
  __typename?: 'AddTagToCustomSet';
  customSet: CustomSet;
};

export type Buff = GlobalNode & {
  __typename?: 'Buff';
  critIncrementBy?: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  incrementBy?: Maybe<Scalars['Int']['output']>;
  item?: Maybe<Item>;
  itemId?: Maybe<Scalars['String']['output']>;
  maxStacks?: Maybe<Scalars['Int']['output']>;
  spellStatId?: Maybe<Scalars['String']['output']>;
  spellStats?: Maybe<SpellStats>;
  stat: Stat;
  uuid: Scalars['String']['output'];
};

/** An enumeration. */
export enum BuildGender {
  Female = 'FEMALE',
  Male = 'MALE',
}

export type ChangeClassic = {
  __typename?: 'ChangeClassic';
  ok: Scalars['Boolean']['output'];
};

export type ChangeLocale = {
  __typename?: 'ChangeLocale';
  ok: Scalars['Boolean']['output'];
};

export type ChangePassword = {
  __typename?: 'ChangePassword';
  ok: Scalars['Boolean']['output'];
};

export type ChangeProfilePicture = {
  __typename?: 'ChangeProfilePicture';
  user: User;
};

export type Class = GlobalNode & {
  __typename?: 'Class';
  allNames: Array<Scalars['String']['output']>;
  enName: Scalars['String']['output'];
  faceImageUrl: Scalars['String']['output'];
  femaleFaceImageUrl: Scalars['String']['output'];
  femaleSpriteImageUrl: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  maleFaceImageUrl: Scalars['String']['output'];
  maleSpriteImageUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
  spellVariantPairs: Array<SpellVariantPair>;
  uuid: Scalars['String']['output'];
};

export type CopyCustomSet = {
  __typename?: 'CopyCustomSet';
  customSet: CustomSet;
};

export type CreateCustomSet = {
  __typename?: 'CreateCustomSet';
  customSet: CustomSet;
};

export type CustomSet = GlobalNode & {
  __typename?: 'CustomSet';
  buildGender: BuildGender;
  childrenCustomSets?: Maybe<Array<Maybe<CustomSet>>>;
  creationDate?: Maybe<Scalars['DateTime']['output']>;
  defaultClass?: Maybe<Class>;
  defaultClassId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  equippedItems: Array<EquippedItem>;
  hasEditPermission: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  lastModified?: Maybe<Scalars['DateTime']['output']>;
  level: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
  ownerId?: Maybe<Scalars['String']['output']>;
  parentCustomSet?: Maybe<Array<Maybe<CustomSet>>>;
  parentCustomSetId?: Maybe<Scalars['String']['output']>;
  stats: CustomSetStats;
  tagAssociations: Array<CustomSetTagAssociation>;
  tags?: Maybe<Array<Maybe<CustomSetTag>>>;
  uuid: Scalars['String']['output'];
};

export type CustomSetConnection = {
  __typename?: 'CustomSetConnection';
  edges: Array<CustomSetEdge>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CustomSetEdge = {
  __typename?: 'CustomSetEdge';
  cursor: Scalars['String']['output'];
  node: CustomSet;
};

export type CustomSetExosInput = {
  stat: Stat;
  value: Scalars['Int']['input'];
};

export type CustomSetFilters = {
  defaultClassId?: InputMaybe<Scalars['UUID']['input']>;
  search: Scalars['String']['input'];
  tagIds: Array<Scalars['UUID']['input']>;
};

export type CustomSetImportedItemInput = {
  apExo?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['UUID']['input'];
  mpExo?: InputMaybe<Scalars['Boolean']['input']>;
  rangeExo?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CustomSetStats = GlobalNode & {
  __typename?: 'CustomSetStats';
  baseAgility: Scalars['Int']['output'];
  baseChance: Scalars['Int']['output'];
  baseIntelligence: Scalars['Int']['output'];
  baseStrength: Scalars['Int']['output'];
  baseVitality: Scalars['Int']['output'];
  baseWisdom: Scalars['Int']['output'];
  customSet?: Maybe<CustomSet>;
  customSetId: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  scrolledAgility: Scalars['Int']['output'];
  scrolledChance: Scalars['Int']['output'];
  scrolledIntelligence: Scalars['Int']['output'];
  scrolledStrength: Scalars['Int']['output'];
  scrolledVitality: Scalars['Int']['output'];
  scrolledWisdom: Scalars['Int']['output'];
  uuid: Scalars['String']['output'];
};

export type CustomSetStatsInput = {
  baseAgility: Scalars['Int']['input'];
  baseChance: Scalars['Int']['input'];
  baseIntelligence: Scalars['Int']['input'];
  baseStrength: Scalars['Int']['input'];
  baseVitality: Scalars['Int']['input'];
  baseWisdom: Scalars['Int']['input'];
  scrolledAgility: Scalars['Int']['input'];
  scrolledChance: Scalars['Int']['input'];
  scrolledIntelligence: Scalars['Int']['input'];
  scrolledStrength: Scalars['Int']['input'];
  scrolledVitality: Scalars['Int']['input'];
  scrolledWisdom: Scalars['Int']['input'];
};

export type CustomSetTag = GlobalNode & {
  __typename?: 'CustomSetTag';
  customSets?: Maybe<Array<Maybe<CustomSet>>>;
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type CustomSetTagAssociation = {
  __typename?: 'CustomSetTagAssociation';
  associationDate: Scalars['DateTime']['output'];
  customSet?: Maybe<CustomSet>;
  customSetId: Scalars['String']['output'];
  customSetTag: CustomSetTag;
  customSetTagId: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type DeleteCustomSet = {
  __typename?: 'DeleteCustomSet';
  ok: Scalars['Boolean']['output'];
};

export type DeleteCustomSetItem = {
  __typename?: 'DeleteCustomSetItem';
  customSet: CustomSet;
};

export type EditBuildSettings = {
  __typename?: 'EditBuildSettings';
  userSetting: UserSetting;
};

export type EditCustomSetDefaultClass = {
  __typename?: 'EditCustomSetDefaultClass';
  customSet: CustomSet;
};

export type EditCustomSetMetadata = {
  __typename?: 'EditCustomSetMetadata';
  customSet: CustomSet;
};

export type EditCustomSetStats = {
  __typename?: 'EditCustomSetStats';
  customSet: CustomSet;
};

export type EquipMultipleItems = {
  __typename?: 'EquipMultipleItems';
  customSet: CustomSet;
};

export type EquipSet = {
  __typename?: 'EquipSet';
  customSet: CustomSet;
};

export type EquippedItem = GlobalNode & {
  __typename?: 'EquippedItem';
  exos: Array<EquippedItemExo>;
  id: Scalars['UUID']['output'];
  item: Item;
  slot: ItemSlot;
  weaponElementMage?: Maybe<WeaponElementMage>;
};

export type EquippedItemExo = GlobalNode & {
  __typename?: 'EquippedItemExo';
  equippedItemId?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  stat: Stat;
  uuid: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type GlobalNode = {
  id: Scalars['UUID']['output'];
};

export type ImportCustomSet = {
  __typename?: 'ImportCustomSet';
  customSet: CustomSet;
};

export type Item = GlobalNode & {
  __typename?: 'Item';
  buffs?: Maybe<Array<Buff>>;
  conditions?: Maybe<Scalars['JSONString']['output']>;
  dofusDbId?: Maybe<Scalars['String']['output']>;
  dofusDbMountId?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  itemType: ItemType;
  itemTypeId: Scalars['String']['output'];
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  set?: Maybe<Set>;
  setId?: Maybe<Scalars['String']['output']>;
  stats: Array<ItemStat>;
  uuid: Scalars['String']['output'];
  weaponStats?: Maybe<WeaponStat>;
};

export type ItemConnection = {
  __typename?: 'ItemConnection';
  edges: Array<ItemEdge>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ItemEdge = {
  __typename?: 'ItemEdge';
  cursor: Scalars['String']['output'];
  node: Item;
};

export type ItemFilters = {
  itemTypeIds: Array<Scalars['UUID']['input']>;
  maxLevel: Scalars['Int']['input'];
  search: Scalars['String']['input'];
  stats: Array<StatFilter>;
};

export type ItemNameObject = {
  imageId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ItemSlot = GlobalNode & {
  __typename?: 'ItemSlot';
  enName: Scalars['String']['output'];
  equippedItems?: Maybe<Array<Maybe<EquippedItem>>>;
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  itemTypes: Array<ItemType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  uuid: Scalars['String']['output'];
};

export type ItemStat = GlobalNode & {
  __typename?: 'ItemStat';
  customStat?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  item?: Maybe<Item>;
  itemId: Scalars['String']['output'];
  maxValue?: Maybe<Scalars['Int']['output']>;
  minValue?: Maybe<Scalars['Int']['output']>;
  order: Scalars['Int']['output'];
  stat?: Maybe<Stat>;
  uuid: Scalars['String']['output'];
};

export type ItemType = GlobalNode & {
  __typename?: 'ItemType';
  eligibleItemSlots: Array<ItemSlot>;
  enName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  items?: Maybe<Array<Maybe<Item>>>;
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type LoginUser = {
  __typename?: 'LoginUser';
  ok: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type LogoutUser = {
  __typename?: 'LogoutUser';
  ok: Scalars['Boolean']['output'];
};

export type MageEquippedItem = {
  __typename?: 'MageEquippedItem';
  equippedItem: EquippedItem;
};

export type Mutation = {
  __typename?: 'Mutation';
  addTagToCustomSet?: Maybe<AddTagToCustomSet>;
  changeClassic?: Maybe<ChangeClassic>;
  changeLocale?: Maybe<ChangeLocale>;
  changePassword?: Maybe<ChangePassword>;
  changeProfilePicture?: Maybe<ChangeProfilePicture>;
  copyCustomSet?: Maybe<CopyCustomSet>;
  createCustomSet?: Maybe<CreateCustomSet>;
  deleteCustomSet?: Maybe<DeleteCustomSet>;
  deleteCustomSetItem?: Maybe<DeleteCustomSetItem>;
  editBuildSettings?: Maybe<EditBuildSettings>;
  editCustomSetDefaultClass?: Maybe<EditCustomSetDefaultClass>;
  editCustomSetMetadata?: Maybe<EditCustomSetMetadata>;
  editCustomSetStats?: Maybe<EditCustomSetStats>;
  equipMultipleItems?: Maybe<EquipMultipleItems>;
  equipSet?: Maybe<EquipSet>;
  importCustomSet?: Maybe<ImportCustomSet>;
  loginUser?: Maybe<LoginUser>;
  logoutUser?: Maybe<LogoutUser>;
  mageEquippedItem?: Maybe<MageEquippedItem>;
  registerUser?: Maybe<RegisterUser>;
  removeTagFromCustomSet?: Maybe<RemoveTagFromCustomSet>;
  requestPasswordReset?: Maybe<RequestPasswordReset>;
  resendVerificationEmail?: Maybe<ResendVerificationEmail>;
  resetPassword?: Maybe<ResetPassword>;
  restartCustomSet?: Maybe<RestartCustomSet>;
  setEquippedItemExo?: Maybe<SetEquippedItemExo>;
  toggleFavoriteItem?: Maybe<ToggleFavoriteItem>;
  updateCustomSetItem?: Maybe<UpdateCustomSetItem>;
};

export type MutationAddTagToCustomSetArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  customSetTagId: Scalars['UUID']['input'];
};

export type MutationChangeClassicArgs = {
  classic: Scalars['Boolean']['input'];
};

export type MutationChangeLocaleArgs = {
  locale: Scalars['String']['input'];
};

export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type MutationChangeProfilePictureArgs = {
  picture: Scalars['String']['input'];
};

export type MutationCopyCustomSetArgs = {
  customSetId: Scalars['UUID']['input'];
};

export type MutationDeleteCustomSetArgs = {
  customSetId: Scalars['UUID']['input'];
};

export type MutationDeleteCustomSetItemArgs = {
  customSetId: Scalars['UUID']['input'];
  itemSlotId: Scalars['UUID']['input'];
};

export type MutationEditBuildSettingsArgs = {
  buildDefaultClassId?: InputMaybe<Scalars['UUID']['input']>;
  gender: BuildGender;
};

export type MutationEditCustomSetDefaultClassArgs = {
  buildGender: BuildGender;
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  defaultClassId?: InputMaybe<Scalars['UUID']['input']>;
};

export type MutationEditCustomSetMetadataArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  level: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type MutationEditCustomSetStatsArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  stats: CustomSetStatsInput;
};

export type MutationEquipMultipleItemsArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  itemIds: Array<Scalars['UUID']['input']>;
};

export type MutationEquipSetArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  setId: Scalars['UUID']['input'];
};

export type MutationImportCustomSetArgs = {
  items: Array<CustomSetImportedItemInput>;
  level: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  stats: CustomSetStatsInput;
};

export type MutationLoginUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  remember: Scalars['Boolean']['input'];
};

export type MutationMageEquippedItemArgs = {
  equippedItemId: Scalars['UUID']['input'];
  stats: Array<CustomSetExosInput>;
  weaponElementMage?: InputMaybe<WeaponElementMage>;
};

export type MutationRegisterUserArgs = {
  buildDefaultClassId?: InputMaybe<Scalars['UUID']['input']>;
  email: Scalars['String']['input'];
  gender: BuildGender;
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MutationRemoveTagFromCustomSetArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  customSetTagId: Scalars['UUID']['input'];
};

export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};

export type MutationResetPasswordArgs = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationRestartCustomSetArgs = {
  customSetId: Scalars['UUID']['input'];
  shouldResetStats: Scalars['Boolean']['input'];
};

export type MutationSetEquippedItemExoArgs = {
  equippedItemId: Scalars['UUID']['input'];
  hasStat: Scalars['Boolean']['input'];
  stat: Stat;
};

export type MutationToggleFavoriteItemArgs = {
  isFavorite: Scalars['Boolean']['input'];
  itemId: Scalars['UUID']['input'];
};

export type MutationUpdateCustomSetItemArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  itemId?: InputMaybe<Scalars['UUID']['input']>;
  itemSlotId: Scalars['UUID']['input'];
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  classById?: Maybe<Class>;
  classes: Array<Class>;
  classic: Scalars['Boolean']['output'];
  currentUser?: Maybe<User>;
  customSetById?: Maybe<CustomSet>;
  customSetTags: Array<CustomSetTag>;
  customSets: CustomSetConnection;
  itemById?: Maybe<Item>;
  itemSlots: Array<ItemSlot>;
  itemSuggestions: Array<Item>;
  items: ItemConnection;
  itemsByName: Array<Item>;
  locale: Scalars['String']['output'];
  setById: Set;
  sets: SetConnection;
  userById?: Maybe<User>;
  userByName?: Maybe<User>;
};

export type QueryClassByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryCustomSetByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryCustomSetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryItemByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryItemSuggestionsArgs = {
  eligibleItemTypeIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
  equippedItemIds: Array<Scalars['UUID']['input']>;
  level: Scalars['Int']['input'];
  numSuggestions?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<ItemFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryItemsByNameArgs = {
  itemNameObjs: Array<ItemNameObject>;
};

export type QuerySetByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QuerySetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SetFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryUserByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryUserByNameArgs = {
  username: Scalars['String']['input'];
};

export type RegisterUser = {
  __typename?: 'RegisterUser';
  ok: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type RemoveTagFromCustomSet = {
  __typename?: 'RemoveTagFromCustomSet';
  customSet: CustomSet;
};

export type RequestPasswordReset = {
  __typename?: 'RequestPasswordReset';
  ok: Scalars['Boolean']['output'];
};

export type ResendVerificationEmail = {
  __typename?: 'ResendVerificationEmail';
  ok: Scalars['Boolean']['output'];
};

export type ResetPassword = {
  __typename?: 'ResetPassword';
  ok: Scalars['Boolean']['output'];
};

export type RestartCustomSet = {
  __typename?: 'RestartCustomSet';
  customSet: CustomSet;
};

export type Set = GlobalNode & {
  __typename?: 'Set';
  bonuses: Array<SetBonus>;
  dofusDbId: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  items: Array<Item>;
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type SetBonus = GlobalNode & {
  __typename?: 'SetBonus';
  customStat?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  numItems: Scalars['Int']['output'];
  setId: Scalars['String']['output'];
  stat?: Maybe<Stat>;
  uuid: Scalars['String']['output'];
  value?: Maybe<Scalars['Int']['output']>;
};

export type SetConnection = {
  __typename?: 'SetConnection';
  edges: Array<SetEdge>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SetEdge = {
  __typename?: 'SetEdge';
  cursor: Scalars['String']['output'];
  node: Set;
};

export type SetEquippedItemExo = {
  __typename?: 'SetEquippedItemExo';
  equippedItem: EquippedItem;
};

export type SetFilters = {
  maxLevel: Scalars['Int']['input'];
  search: Scalars['String']['input'];
  stats: Array<StatFilter>;
};

export type Spell = GlobalNode & {
  __typename?: 'Spell';
  description: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  isTrap: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  spellStats: Array<SpellStats>;
  spellVariantPair?: Maybe<SpellVariantPair>;
  spellVariantPairId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type SpellDamageIncrease = GlobalNode & {
  __typename?: 'SpellDamageIncrease';
  baseIncrease: Scalars['Int']['output'];
  critBaseIncrease?: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  maxStacks?: Maybe<Scalars['Int']['output']>;
  spellStatId: Scalars['String']['output'];
  spellStats?: Maybe<SpellStats>;
  uuid: Scalars['String']['output'];
};

/** An enumeration. */
export enum SpellEffectType {
  AirDamage = 'AIR_DAMAGE',
  AirHealing = 'AIR_HEALING',
  AirSteal = 'AIR_STEAL',
  Ap = 'AP',
  BestElementDamage = 'BEST_ELEMENT_DAMAGE',
  BestElementHealing = 'BEST_ELEMENT_HEALING',
  BestElementSteal = 'BEST_ELEMENT_STEAL',
  EarthDamage = 'EARTH_DAMAGE',
  EarthHealing = 'EARTH_HEALING',
  EarthSteal = 'EARTH_STEAL',
  FireDamage = 'FIRE_DAMAGE',
  FireHealing = 'FIRE_HEALING',
  FireSteal = 'FIRE_STEAL',
  HpRestored = 'HP_RESTORED',
  Mp = 'MP',
  NeutralDamage = 'NEUTRAL_DAMAGE',
  NeutralHealing = 'NEUTRAL_HEALING',
  NeutralSteal = 'NEUTRAL_STEAL',
  PushbackDamage = 'PUSHBACK_DAMAGE',
  Shield = 'SHIELD',
  WaterDamage = 'WATER_DAMAGE',
  WaterHealing = 'WATER_HEALING',
  WaterSteal = 'WATER_STEAL',
}

export type SpellEffects = GlobalNode & {
  __typename?: 'SpellEffects';
  condition?: Maybe<Scalars['String']['output']>;
  critMaxDamage?: Maybe<Scalars['Int']['output']>;
  critMinDamage?: Maybe<Scalars['Int']['output']>;
  effectType: SpellEffectType;
  id: Scalars['UUID']['output'];
  maxDamage: Scalars['Int']['output'];
  minDamage?: Maybe<Scalars['Int']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  spellStatId: Scalars['String']['output'];
  spellStats?: Maybe<SpellStats>;
  uuid: Scalars['String']['output'];
};

export type SpellStats = GlobalNode & {
  __typename?: 'SpellStats';
  aoe?: Maybe<Scalars['String']['output']>;
  apCost: Scalars['Int']['output'];
  baseCritChance?: Maybe<Scalars['Int']['output']>;
  buffs?: Maybe<Array<Buff>>;
  castsPerTarget?: Maybe<Scalars['Int']['output']>;
  castsPerTurn?: Maybe<Scalars['Int']['output']>;
  cooldown?: Maybe<Scalars['Int']['output']>;
  hasModifiableRange: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  isLinear: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  maxRange?: Maybe<Scalars['Int']['output']>;
  minRange?: Maybe<Scalars['Int']['output']>;
  needsFreeCell: Scalars['Boolean']['output'];
  needsLos: Scalars['Boolean']['output'];
  spell?: Maybe<Spell>;
  spellDamageIncrease?: Maybe<SpellDamageIncrease>;
  spellEffects: Array<SpellEffects>;
  spellId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type SpellVariantPair = GlobalNode & {
  __typename?: 'SpellVariantPair';
  class?: Maybe<Class>;
  classId: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  spells: Array<Spell>;
  uuid: Scalars['String']['output'];
};

/** An enumeration. */
export enum Stat {
  Agility = 'AGILITY',
  AirDamage = 'AIR_DAMAGE',
  AirRes = 'AIR_RES',
  Ap = 'AP',
  ApParry = 'AP_PARRY',
  ApReduction = 'AP_REDUCTION',
  Chance = 'CHANCE',
  Critical = 'CRITICAL',
  CriticalDamage = 'CRITICAL_DAMAGE',
  CriticalRes = 'CRITICAL_RES',
  Damage = 'DAMAGE',
  Dodge = 'DODGE',
  EarthDamage = 'EARTH_DAMAGE',
  EarthRes = 'EARTH_RES',
  FireDamage = 'FIRE_DAMAGE',
  FireRes = 'FIRE_RES',
  Heals = 'HEALS',
  Initiative = 'INITIATIVE',
  Intelligence = 'INTELLIGENCE',
  Lock = 'LOCK',
  Mp = 'MP',
  MpParry = 'MP_PARRY',
  MpReduction = 'MP_REDUCTION',
  NeutralDamage = 'NEUTRAL_DAMAGE',
  NeutralRes = 'NEUTRAL_RES',
  PctAirRes = 'PCT_AIR_RES',
  PctEarthRes = 'PCT_EARTH_RES',
  PctFinalDamage = 'PCT_FINAL_DAMAGE',
  PctFireRes = 'PCT_FIRE_RES',
  PctMeleeDamage = 'PCT_MELEE_DAMAGE',
  PctMeleeRes = 'PCT_MELEE_RES',
  PctNeutralRes = 'PCT_NEUTRAL_RES',
  PctRangedDamage = 'PCT_RANGED_DAMAGE',
  PctRangedRes = 'PCT_RANGED_RES',
  PctSpellDamage = 'PCT_SPELL_DAMAGE',
  PctWaterRes = 'PCT_WATER_RES',
  PctWeaponDamage = 'PCT_WEAPON_DAMAGE',
  Pods = 'PODS',
  Power = 'POWER',
  Prospecting = 'PROSPECTING',
  PushbackDamage = 'PUSHBACK_DAMAGE',
  PushbackRes = 'PUSHBACK_RES',
  Range = 'RANGE',
  Reflect = 'REFLECT',
  Strength = 'STRENGTH',
  Summon = 'SUMMON',
  TrapDamage = 'TRAP_DAMAGE',
  TrapPower = 'TRAP_POWER',
  Vitality = 'VITALITY',
  WaterDamage = 'WATER_DAMAGE',
  WaterRes = 'WATER_RES',
  Wisdom = 'WISDOM',
}

export type StatFilter = {
  maxValue?: InputMaybe<Scalars['Int']['input']>;
  minValue?: InputMaybe<Scalars['Int']['input']>;
  stat: Stat;
};

export type ToggleFavoriteItem = {
  __typename?: 'ToggleFavoriteItem';
  user: User;
};

export type UpdateCustomSetItem = {
  __typename?: 'UpdateCustomSetItem';
  customSet: CustomSet;
};

export type User = GlobalNode & {
  __typename?: 'User';
  creationDate?: Maybe<Scalars['DateTime']['output']>;
  customSets: CustomSetConnection;
  email: Scalars['String']['output'];
  favoriteItems: Array<Item>;
  id: Scalars['UUID']['output'];
  profilePicture: Scalars['String']['output'];
  settings: UserSetting;
  username: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};

export type UserCustomSetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<CustomSetFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type UserSetting = GlobalNode & {
  __typename?: 'UserSetting';
  buildClass?: Maybe<Class>;
  buildClassId?: Maybe<Scalars['String']['output']>;
  buildGender: BuildGender;
  classic: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  locale: Scalars['String']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type WeaponEffect = GlobalNode & {
  __typename?: 'WeaponEffect';
  effectType: WeaponEffectType;
  id: Scalars['UUID']['output'];
  maxDamage: Scalars['Int']['output'];
  minDamage?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
  weaponStat?: Maybe<WeaponStat>;
  weaponStatId: Scalars['String']['output'];
};

/** An enumeration. */
export enum WeaponEffectType {
  AirDamage = 'AIR_DAMAGE',
  AirHealing = 'AIR_HEALING',
  AirSteal = 'AIR_STEAL',
  Ap = 'AP',
  AttractCells = 'ATTRACT_CELLS',
  BestElementDamage = 'BEST_ELEMENT_DAMAGE',
  EarthDamage = 'EARTH_DAMAGE',
  EarthHealing = 'EARTH_HEALING',
  EarthSteal = 'EARTH_STEAL',
  FireDamage = 'FIRE_DAMAGE',
  FireHealing = 'FIRE_HEALING',
  FireSteal = 'FIRE_STEAL',
  HpRestored = 'HP_RESTORED',
  Mp = 'MP',
  NeutralDamage = 'NEUTRAL_DAMAGE',
  NeutralHealing = 'NEUTRAL_HEALING',
  NeutralSteal = 'NEUTRAL_STEAL',
  PushbackDamage = 'PUSHBACK_DAMAGE',
  StealsMp = 'STEALS_MP',
  WaterDamage = 'WATER_DAMAGE',
  WaterHealing = 'WATER_HEALING',
  WaterSteal = 'WATER_STEAL',
}

/** An enumeration. */
export enum WeaponElementMage {
  Air_50 = 'AIR_50',
  Air_68 = 'AIR_68',
  Air_85 = 'AIR_85',
  Earth_50 = 'EARTH_50',
  Earth_68 = 'EARTH_68',
  Earth_85 = 'EARTH_85',
  Fire_50 = 'FIRE_50',
  Fire_68 = 'FIRE_68',
  Fire_85 = 'FIRE_85',
  Water_50 = 'WATER_50',
  Water_68 = 'WATER_68',
  Water_85 = 'WATER_85',
}

export type WeaponStat = GlobalNode & {
  __typename?: 'WeaponStat';
  apCost: Scalars['Int']['output'];
  baseCritChance?: Maybe<Scalars['Int']['output']>;
  critBonusDamage?: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  item?: Maybe<Item>;
  itemId: Scalars['String']['output'];
  maxRange: Scalars['Int']['output'];
  minRange?: Maybe<Scalars['Int']['output']>;
  usesPerTurn: Scalars['Int']['output'];
  uuid: Scalars['String']['output'];
  weaponEffects: Array<WeaponEffect>;
};

export type AbbreviatedCustomSetFragment = {
  __typename?: 'CustomSet';
  id: any;
  buildGender: BuildGender;
  name?: string | null;
  level: number;
  defaultClass?: {
    __typename?: 'Class';
    id: any;
    name: string;
    maleFaceImageUrl: string;
    femaleFaceImageUrl: string;
  } | null;
  equippedItems: Array<{
    __typename?: 'EquippedItem';
    id: any;
    slot: { __typename?: 'ItemSlot'; id: any; order: number };
    item: { __typename?: 'Item'; id: any; imageUrl: string };
  }>;
  tagAssociations: Array<{
    __typename?: 'CustomSetTagAssociation';
    id: string;
    associationDate: any;
    customSetTag: {
      __typename?: 'CustomSetTag';
      id: any;
      name: string;
      imageUrl: string;
    };
  }>;
} & { ' $fragmentName'?: 'AbbreviatedCustomSetFragment' };

export type BaseStatsFragment = {
  __typename?: 'CustomSetStats';
  id: any;
  baseVitality: number;
  baseWisdom: number;
  baseStrength: number;
  baseIntelligence: number;
  baseChance: number;
  baseAgility: number;
  scrolledVitality: number;
  scrolledWisdom: number;
  scrolledStrength: number;
  scrolledIntelligence: number;
  scrolledChance: number;
  scrolledAgility: number;
} & { ' $fragmentName'?: 'BaseStatsFragment' };

export type BuffFragment = {
  __typename?: 'Buff';
  id: any;
  stat: Stat;
  incrementBy?: number | null;
  critIncrementBy?: number | null;
  maxStacks?: number | null;
} & { ' $fragmentName'?: 'BuffFragment' };

export type CustomSetFragment = {
  __typename?: 'CustomSet';
  id: any;
  name?: string | null;
  level: number;
  creationDate?: any | null;
  lastModified?: any | null;
  hasEditPermission: boolean;
  buildGender: BuildGender;
  equippedItems: Array<{
    __typename?: 'EquippedItem';
    id: any;
    weaponElementMage?: WeaponElementMage | null;
    slot: {
      __typename?: 'ItemSlot';
      id: any;
      enName: string;
      name: string;
      order: number;
    };
    item: { __typename?: 'Item' } & {
      ' $fragmentRefs'?: { ItemFragment: ItemFragment };
    };
    exos: Array<{
      __typename?: 'EquippedItemExo';
      id: any;
      stat: Stat;
      value: number;
    }>;
  }>;
  stats: { __typename?: 'CustomSetStats' } & {
    ' $fragmentRefs'?: { BaseStatsFragment: BaseStatsFragment };
  };
  owner?: { __typename?: 'User'; id: any; username: string } | null;
  defaultClass?: {
    __typename?: 'Class';
    id: any;
    name: string;
    enName: string;
    femaleFaceImageUrl: string;
    maleFaceImageUrl: string;
    femaleSpriteImageUrl: string;
    maleSpriteImageUrl: string;
  } | null;
  tagAssociations: Array<{
    __typename?: 'CustomSetTagAssociation';
    id: string;
    associationDate: any;
    customSetTag: {
      __typename?: 'CustomSetTag';
      id: any;
      name: string;
      imageUrl: string;
    };
  }>;
} & { ' $fragmentName'?: 'CustomSetFragment' };

export type ItemFragment = {
  __typename?: 'Item';
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  conditions?: any | null;
  stats: Array<{
    __typename?: 'ItemStat';
    id: any;
    order: number;
    maxValue?: number | null;
    stat?: Stat | null;
    customStat?: string | null;
  }>;
  weaponStats?: {
    __typename?: 'WeaponStat';
    id: any;
    apCost: number;
    usesPerTurn: number;
    minRange?: number | null;
    maxRange: number;
    baseCritChance?: number | null;
    critBonusDamage?: number | null;
    weaponEffects: Array<{
      __typename?: 'WeaponEffect';
      id: any;
      minDamage?: number | null;
      maxDamage: number;
      effectType: WeaponEffectType;
    }>;
  } | null;
  itemType: {
    __typename?: 'ItemType';
    id: any;
    name: string;
    enName: string;
    eligibleItemSlots: Array<{
      __typename?: 'ItemSlot';
      id: any;
      enName: string;
      order: number;
    }>;
  };
  set?: {
    __typename?: 'Set';
    id: any;
    name: string;
    bonuses: Array<{
      __typename?: 'SetBonus';
      id: any;
      numItems: number;
      stat?: Stat | null;
      value?: number | null;
      customStat?: string | null;
    }>;
  } | null;
  buffs?: Array<
    { __typename?: 'Buff' } & {
      ' $fragmentRefs'?: { BuffFragment: BuffFragment };
    }
  > | null;
} & { ' $fragmentName'?: 'ItemFragment' };

export type SetFragment = {
  __typename?: 'Set';
  id: any;
  name: string;
  bonuses: Array<{
    __typename?: 'SetBonus';
    id: any;
    numItems: number;
    stat?: Stat | null;
    value?: number | null;
    customStat?: string | null;
  }>;
} & { ' $fragmentName'?: 'SetFragment' };

export type AddTagToCustomSetMutationVariables = Exact<{
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  customSetTagId: Scalars['UUID']['input'];
}>;

export type AddTagToCustomSetMutation = {
  __typename?: 'Mutation';
  addTagToCustomSet?: {
    __typename?: 'AddTagToCustomSet';
    customSet: {
      __typename?: 'CustomSet';
      id: any;
      tagAssociations: Array<{
        __typename?: 'CustomSetTagAssociation';
        id: string;
        associationDate: any;
        customSetTag: {
          __typename?: 'CustomSetTag';
          id: any;
          name: string;
          imageUrl: string;
        };
      }>;
    };
  } | null;
};

export type ChangeClassicMutationVariables = Exact<{
  classic: Scalars['Boolean']['input'];
}>;

export type ChangeClassicMutation = {
  __typename?: 'Mutation';
  changeClassic?: { __typename?: 'ChangeClassic'; ok: boolean } | null;
};

export type ChangeLocaleMutationVariables = Exact<{
  locale: Scalars['String']['input'];
}>;

export type ChangeLocaleMutation = {
  __typename?: 'Mutation';
  changeLocale?: { __typename?: 'ChangeLocale'; ok: boolean } | null;
};

export type ChangePasswordMutationVariables = Exact<{
  oldPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;

export type ChangePasswordMutation = {
  __typename?: 'Mutation';
  changePassword?: { __typename?: 'ChangePassword'; ok: boolean } | null;
};

export type ChangeProfilePictureMutationVariables = Exact<{
  picture: Scalars['String']['input'];
}>;

export type ChangeProfilePictureMutation = {
  __typename?: 'Mutation';
  changeProfilePicture?: {
    __typename?: 'ChangeProfilePicture';
    user: { __typename?: 'User'; id: any; profilePicture: string };
  } | null;
};

export type CopyCustomSetMutationVariables = Exact<{
  customSetId: Scalars['UUID']['input'];
}>;

export type CopyCustomSetMutation = {
  __typename?: 'Mutation';
  copyCustomSet?: {
    __typename?: 'CopyCustomSet';
    customSet: { __typename?: 'CustomSet' } & {
      ' $fragmentRefs'?: { CustomSetFragment: CustomSetFragment };
    };
  } | null;
};

export type CreateCustomSetMutationVariables = Exact<{ [key: string]: never }>;

export type CreateCustomSetMutation = {
  __typename?: 'Mutation';
  createCustomSet?: {
    __typename?: 'CreateCustomSet';
    customSet: { __typename?: 'CustomSet' } & {
      ' $fragmentRefs'?: { CustomSetFragment: CustomSetFragment };
    };
  } | null;
};

export type DeleteCustomSetMutationVariables = Exact<{
  customSetId: Scalars['UUID']['input'];
}>;

export type DeleteCustomSetMutation = {
  __typename?: 'Mutation';
  deleteCustomSet?: { __typename?: 'DeleteCustomSet'; ok: boolean } | null;
};

export type DeleteCustomSetItemMutationVariables = Exact<{
  itemSlotId: Scalars['UUID']['input'];
  customSetId: Scalars['UUID']['input'];
}>;

export type DeleteCustomSetItemMutation = {
  __typename?: 'Mutation';
  deleteCustomSetItem?: {
    __typename?: 'DeleteCustomSetItem';
    customSet: {
      __typename?: 'CustomSet';
      id: any;
      lastModified?: any | null;
      equippedItems: Array<{ __typename?: 'EquippedItem'; id: any }>;
    };
  } | null;
};

export type EditBuildSettingsMutationVariables = Exact<{
  gender: BuildGender;
  buildDefaultClassId?: InputMaybe<Scalars['UUID']['input']>;
}>;

export type EditBuildSettingsMutation = {
  __typename?: 'Mutation';
  editBuildSettings?: {
    __typename?: 'EditBuildSettings';
    userSetting: {
      __typename?: 'UserSetting';
      id: any;
      buildGender: BuildGender;
      buildClass?: {
        __typename?: 'Class';
        id: any;
        name: string;
        maleFaceImageUrl: string;
        femaleFaceImageUrl: string;
        maleSpriteImageUrl: string;
        femaleSpriteImageUrl: string;
      } | null;
    };
  } | null;
};

export type EditCustomSetDefaultClassMutationVariables = Exact<{
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  defaultClassId?: InputMaybe<Scalars['UUID']['input']>;
  buildGender: BuildGender;
}>;

export type EditCustomSetDefaultClassMutation = {
  __typename?: 'Mutation';
  editCustomSetDefaultClass?: {
    __typename?: 'EditCustomSetDefaultClass';
    customSet: {
      __typename?: 'CustomSet';
      id: any;
      lastModified?: any | null;
      buildGender: BuildGender;
      defaultClass?: {
        __typename?: 'Class';
        id: any;
        name: string;
        enName: string;
        femaleFaceImageUrl: string;
        maleFaceImageUrl: string;
        femaleSpriteImageUrl: string;
        maleSpriteImageUrl: string;
      } | null;
    };
  } | null;
};

export type EditCustomSetMetadataMutationVariables = Exact<{
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  level: Scalars['Int']['input'];
}>;

export type EditCustomSetMetadataMutation = {
  __typename?: 'Mutation';
  editCustomSetMetadata?: {
    __typename?: 'EditCustomSetMetadata';
    customSet: {
      __typename?: 'CustomSet';
      id: any;
      name?: string | null;
      level: number;
      lastModified?: any | null;
    };
  } | null;
};

export type EditCustomSetStatsMutationVariables = Exact<{
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  stats: CustomSetStatsInput;
}>;

export type EditCustomSetStatsMutation = {
  __typename?: 'Mutation';
  editCustomSetStats?: {
    __typename?: 'EditCustomSetStats';
    customSet: {
      __typename?: 'CustomSet';
      id: any;
      lastModified?: any | null;
      stats: {
        __typename?: 'CustomSetStats';
        id: any;
        baseVitality: number;
        baseWisdom: number;
        baseStrength: number;
        baseIntelligence: number;
        baseChance: number;
        baseAgility: number;
        scrolledVitality: number;
        scrolledWisdom: number;
        scrolledStrength: number;
        scrolledIntelligence: number;
        scrolledChance: number;
        scrolledAgility: number;
      };
    };
  } | null;
};

export type EquipItemsMutationVariables = Exact<{
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  itemIds: Array<Scalars['UUID']['input']> | Scalars['UUID']['input'];
}>;

export type EquipItemsMutation = {
  __typename?: 'Mutation';
  equipMultipleItems?: {
    __typename?: 'EquipMultipleItems';
    customSet: { __typename?: 'CustomSet' } & {
      ' $fragmentRefs'?: { CustomSetFragment: CustomSetFragment };
    };
  } | null;
};

export type EquipSetMutationVariables = Exact<{
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  setId: Scalars['UUID']['input'];
}>;

export type EquipSetMutation = {
  __typename?: 'Mutation';
  equipSet?: {
    __typename?: 'EquipSet';
    customSet: { __typename?: 'CustomSet' } & {
      ' $fragmentRefs'?: { CustomSetFragment: CustomSetFragment };
    };
  } | null;
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  remember: Scalars['Boolean']['input'];
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  loginUser?: {
    __typename?: 'LoginUser';
    user?: {
      __typename?: 'User';
      id: any;
      username: string;
      email: string;
      verified: boolean;
      favoriteItems: Array<
        { __typename?: 'Item' } & {
          ' $fragmentRefs'?: { ItemFragment: ItemFragment };
        }
      >;
      settings: {
        __typename?: 'UserSetting';
        id: any;
        buildGender: BuildGender;
        buildClass?: {
          __typename?: 'Class';
          id: any;
          maleFaceImageUrl: string;
          femaleFaceImageUrl: string;
          maleSpriteImageUrl: string;
          femaleSpriteImageUrl: string;
          name: string;
        } | null;
      };
    } | null;
  } | null;
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = {
  __typename?: 'Mutation';
  logoutUser?: { __typename?: 'LogoutUser'; ok: boolean } | null;
};

export type MageEquippedItemMutationVariables = Exact<{
  stats: Array<CustomSetExosInput> | CustomSetExosInput;
  equippedItemId: Scalars['UUID']['input'];
  weaponElementMage?: InputMaybe<WeaponElementMage>;
}>;

export type MageEquippedItemMutation = {
  __typename?: 'Mutation';
  mageEquippedItem?: {
    __typename?: 'MageEquippedItem';
    equippedItem: {
      __typename?: 'EquippedItem';
      id: any;
      weaponElementMage?: WeaponElementMage | null;
      exos: Array<{
        __typename?: 'EquippedItemExo';
        id: any;
        stat: Stat;
        value: number;
      }>;
    };
  } | null;
};

export type RegisterMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
  gender: BuildGender;
  buildDefaultClassId?: InputMaybe<Scalars['UUID']['input']>;
}>;

export type RegisterMutation = {
  __typename?: 'Mutation';
  registerUser?: {
    __typename?: 'RegisterUser';
    user?: {
      __typename?: 'User';
      id: any;
      username: string;
      email: string;
      verified: boolean;
      favoriteItems: Array<
        { __typename?: 'Item' } & {
          ' $fragmentRefs'?: { ItemFragment: ItemFragment };
        }
      >;
      settings: {
        __typename?: 'UserSetting';
        id: any;
        buildGender: BuildGender;
        buildClass?: {
          __typename?: 'Class';
          id: any;
          maleFaceImageUrl: string;
          femaleFaceImageUrl: string;
          maleSpriteImageUrl: string;
          femaleSpriteImageUrl: string;
          name: string;
        } | null;
      };
    } | null;
  } | null;
};

export type RemoveTagFromCustomSetMutationVariables = Exact<{
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  customSetTagId: Scalars['UUID']['input'];
}>;

export type RemoveTagFromCustomSetMutation = {
  __typename?: 'Mutation';
  removeTagFromCustomSet?: {
    __typename?: 'RemoveTagFromCustomSet';
    customSet: {
      __typename?: 'CustomSet';
      id: any;
      tagAssociations: Array<{
        __typename?: 'CustomSetTagAssociation';
        id: string;
        associationDate: any;
        customSetTag: {
          __typename?: 'CustomSetTag';
          id: any;
          name: string;
          imageUrl: string;
        };
      }>;
    };
  } | null;
};

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;

export type RequestPasswordResetMutation = {
  __typename?: 'Mutation';
  requestPasswordReset?: {
    __typename?: 'RequestPasswordReset';
    ok: boolean;
  } | null;
};

export type ResendVerificationEmailMutationVariables = Exact<{
  [key: string]: never;
}>;

export type ResendVerificationEmailMutation = {
  __typename?: 'Mutation';
  resendVerificationEmail?: {
    __typename?: 'ResendVerificationEmail';
    ok: boolean;
  } | null;
};

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type ResetPasswordMutation = {
  __typename?: 'Mutation';
  resetPassword?: { __typename?: 'ResetPassword'; ok: boolean } | null;
};

export type RestartCustomSetMutationVariables = Exact<{
  customSetId: Scalars['UUID']['input'];
  shouldResetStats: Scalars['Boolean']['input'];
}>;

export type RestartCustomSetMutation = {
  __typename?: 'Mutation';
  restartCustomSet?: {
    __typename?: 'RestartCustomSet';
    customSet: { __typename?: 'CustomSet' } & {
      ' $fragmentRefs'?: { CustomSetFragment: CustomSetFragment };
    };
  } | null;
};

export type SetEquippedItemExoMutationVariables = Exact<{
  stat: Stat;
  equippedItemId: Scalars['UUID']['input'];
  hasStat: Scalars['Boolean']['input'];
}>;

export type SetEquippedItemExoMutation = {
  __typename?: 'Mutation';
  setEquippedItemExo?: {
    __typename?: 'SetEquippedItemExo';
    equippedItem: {
      __typename?: 'EquippedItem';
      id: any;
      exos: Array<{
        __typename?: 'EquippedItemExo';
        id: any;
        stat: Stat;
        value: number;
      }>;
    };
  } | null;
};

export type ToggleFavoriteItemMutationVariables = Exact<{
  itemId: Scalars['UUID']['input'];
  isFavorite: Scalars['Boolean']['input'];
}>;

export type ToggleFavoriteItemMutation = {
  __typename?: 'Mutation';
  toggleFavoriteItem?: {
    __typename?: 'ToggleFavoriteItem';
    user: {
      __typename?: 'User';
      id: any;
      favoriteItems: Array<
        { __typename?: 'Item' } & {
          ' $fragmentRefs'?: { ItemFragment: ItemFragment };
        }
      >;
    };
  } | null;
};

export type UpdateCustomSetItemMutationVariables = Exact<{
  itemSlotId: Scalars['UUID']['input'];
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  itemId?: InputMaybe<Scalars['UUID']['input']>;
}>;

export type UpdateCustomSetItemMutation = {
  __typename?: 'Mutation';
  updateCustomSetItem?: {
    __typename?: 'UpdateCustomSetItem';
    customSet: {
      __typename?: 'CustomSet';
      id: any;
      equippedItems: Array<{
        __typename?: 'EquippedItem';
        id: any;
        weaponElementMage?: WeaponElementMage | null;
        slot: { __typename?: 'ItemSlot'; id: any; name: string; order: number };
        item: { __typename?: 'Item' } & {
          ' $fragmentRefs'?: { ItemFragment: ItemFragment };
        };
        exos: Array<{
          __typename?: 'EquippedItemExo';
          id: any;
          stat: Stat;
          value: number;
        }>;
      }>;
    };
  } | null;
};

export type BuildListQueryVariables = Exact<{
  username: Scalars['String']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  filters: CustomSetFilters;
}>;

export type BuildListQuery = {
  __typename?: 'Query';
  userByName?: {
    __typename?: 'User';
    id: any;
    username: string;
    customSets: {
      __typename?: 'CustomSetConnection';
      totalCount: number;
      edges: Array<{
        __typename?: 'CustomSetEdge';
        node: { __typename?: 'CustomSet' } & {
          ' $fragmentRefs'?: {
            AbbreviatedCustomSetFragment: AbbreviatedCustomSetFragment;
          };
        };
      }>;
      pageInfo: {
        __typename?: 'PageInfo';
        hasNextPage: boolean;
        endCursor?: string | null;
      };
    };
  } | null;
};

export type ClassBuffsQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type ClassBuffsQuery = {
  __typename?: 'Query';
  classById?: {
    __typename?: 'Class';
    id: any;
    name: string;
    spellVariantPairs: Array<{
      __typename?: 'SpellVariantPair';
      id: any;
      spells: Array<{
        __typename?: 'Spell';
        id: any;
        name: string;
        description: string;
        imageUrl: string;
        spellStats: Array<{
          __typename?: 'SpellStats';
          id: any;
          level: number;
          buffs?: Array<
            { __typename?: 'Buff' } & {
              ' $fragmentRefs'?: { BuffFragment: BuffFragment };
            }
          > | null;
        }>;
      }>;
    }>;
  } | null;
};

export type ClassByIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type ClassByIdQuery = {
  __typename?: 'Query';
  classById?: {
    __typename?: 'Class';
    id: any;
    name: string;
    spellVariantPairs: Array<{
      __typename?: 'SpellVariantPair';
      id: any;
      spells: Array<{
        __typename?: 'Spell';
        id: any;
        name: string;
        description: string;
        imageUrl: string;
        isTrap: boolean;
        spellStats: Array<{
          __typename?: 'SpellStats';
          id: any;
          level: number;
          apCost: number;
          castsPerTurn?: number | null;
          castsPerTarget?: number | null;
          cooldown?: number | null;
          isLinear: boolean;
          needsLos: boolean;
          needsFreeCell: boolean;
          baseCritChance?: number | null;
          minRange?: number | null;
          maxRange?: number | null;
          hasModifiableRange: boolean;
          spellEffects: Array<{
            __typename?: 'SpellEffects';
            id: any;
            minDamage?: number | null;
            maxDamage: number;
            critMinDamage?: number | null;
            critMaxDamage?: number | null;
            effectType: SpellEffectType;
            condition?: string | null;
          }>;
          spellDamageIncrease?: {
            __typename?: 'SpellDamageIncrease';
            id: any;
            baseIncrease: number;
            critBaseIncrease?: number | null;
            maxStacks?: number | null;
          } | null;
          buffs?: Array<
            { __typename?: 'Buff' } & {
              ' $fragmentRefs'?: { BuffFragment: BuffFragment };
            }
          > | null;
        }>;
      }>;
    }>;
  } | null;
};

export type ClassesQueryVariables = Exact<{ [key: string]: never }>;

export type ClassesQuery = {
  __typename?: 'Query';
  classes: Array<{
    __typename?: 'Class';
    id: any;
    name: string;
    enName: string;
    allNames: Array<string>;
    maleFaceImageUrl: string;
    femaleFaceImageUrl: string;
    maleSpriteImageUrl: string;
    femaleSpriteImageUrl: string;
  }>;
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  __typename?: 'Query';
  currentUser?: {
    __typename?: 'User';
    id: any;
    username: string;
    email: string;
    verified: boolean;
    favoriteItems: Array<
      { __typename?: 'Item' } & {
        ' $fragmentRefs'?: { ItemFragment: ItemFragment };
      }
    >;
    settings: {
      __typename?: 'UserSetting';
      id: any;
      buildGender: BuildGender;
      buildClass?: {
        __typename?: 'Class';
        id: any;
        maleFaceImageUrl: string;
        femaleFaceImageUrl: string;
        maleSpriteImageUrl: string;
        femaleSpriteImageUrl: string;
        name: string;
      } | null;
    };
  } | null;
};

export type CustomSetQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type CustomSetQuery = {
  __typename?: 'Query';
  customSetById?:
    | ({
        __typename?: 'CustomSet';
        stats: { __typename?: 'CustomSetStats' } & {
          ' $fragmentRefs'?: { BaseStatsFragment: BaseStatsFragment };
        };
      } & { ' $fragmentRefs'?: { CustomSetFragment: CustomSetFragment } })
    | null;
};

export type CustomSetTagsQueryVariables = Exact<{ [key: string]: never }>;

export type CustomSetTagsQuery = {
  __typename?: 'Query';
  customSetTags: Array<{
    __typename?: 'CustomSetTag';
    id: any;
    name: string;
    imageUrl: string;
  }>;
};

export type ItemSlotsQueryVariables = Exact<{ [key: string]: never }>;

export type ItemSlotsQuery = {
  __typename?: 'Query';
  itemSlots: Array<{
    __typename?: 'ItemSlot';
    id: any;
    enName: string;
    name: string;
    order: number;
    imageUrl: string;
    itemTypes: Array<{ __typename?: 'ItemType'; id: any; name: string }>;
  }>;
};

export type ItemsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  filters: ItemFilters;
  equippedItemIds: Array<Scalars['UUID']['input']> | Scalars['UUID']['input'];
  eligibleItemTypeIds?: InputMaybe<
    Array<Scalars['UUID']['input']> | Scalars['UUID']['input']
  >;
  level: Scalars['Int']['input'];
}>;

export type ItemsQuery = {
  __typename?: 'Query';
  items: {
    __typename?: 'ItemConnection';
    edges: Array<{
      __typename?: 'ItemEdge';
      node: { __typename?: 'Item' } & {
        ' $fragmentRefs'?: { ItemFragment: ItemFragment };
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      endCursor?: string | null;
    };
  };
  itemSuggestions: Array<
    { __typename?: 'Item' } & {
      ' $fragmentRefs'?: { ItemFragment: ItemFragment };
    }
  >;
};

export type MyCustomSetsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  filters: CustomSetFilters;
}>;

export type MyCustomSetsQuery = {
  __typename?: 'Query';
  currentUser?: {
    __typename?: 'User';
    id: any;
    customSets: {
      __typename?: 'CustomSetConnection';
      totalCount: number;
      edges: Array<{
        __typename?: 'CustomSetEdge';
        node: { __typename?: 'CustomSet' } & {
          ' $fragmentRefs'?: {
            AbbreviatedCustomSetFragment: AbbreviatedCustomSetFragment;
          };
        };
      }>;
      pageInfo: {
        __typename?: 'PageInfo';
        hasNextPage: boolean;
        endCursor?: string | null;
      };
    };
  } | null;
};

export type SessionSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type SessionSettingsQuery = {
  __typename?: 'Query';
  locale: string;
  classic: boolean;
};

export type SetQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type SetQuery = {
  __typename?: 'Query';
  setById: {
    __typename?: 'Set';
    items: Array<
      { __typename?: 'Item' } & {
        ' $fragmentRefs'?: { ItemFragment: ItemFragment };
      }
    >;
  } & { ' $fragmentRefs'?: { SetFragment: SetFragment } };
};

export type SetsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  filters: SetFilters;
}>;

export type SetsQuery = {
  __typename?: 'Query';
  sets: {
    __typename?: 'SetConnection';
    edges: Array<{
      __typename?: 'SetEdge';
      node: {
        __typename?: 'Set';
        items: Array<
          { __typename?: 'Item' } & {
            ' $fragmentRefs'?: { ItemFragment: ItemFragment };
          }
        >;
      } & { ' $fragmentRefs'?: { SetFragment: SetFragment } };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      endCursor?: string | null;
    };
  };
};

export type UserProfileQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;

export type UserProfileQuery = {
  __typename?: 'Query';
  userByName?: {
    __typename?: 'User';
    id: any;
    username: string;
    profilePicture: string;
    creationDate?: any | null;
    customSets: { __typename?: 'CustomSetConnection'; totalCount: number };
  } | null;
};

export const AbbreviatedCustomSetFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'abbreviatedCustomSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AbbreviatedCustomSetFragment, unknown>;
export const BuffFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BuffFragment, unknown>;
export const ItemFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ItemFragment, unknown>;
export const BaseStatsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BaseStatsFragment, unknown>;
export const CustomSetFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'customSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'exos' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'baseStats' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'creationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastModified' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'hasEditPermission' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CustomSetFragment, unknown>;
export const SetFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'set' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Set' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'bonuses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'numItems' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetFragment, unknown>;
export const AddTagToCustomSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addTagToCustomSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetTagId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addTagToCustomSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetTagId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetTagId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tagAssociations' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'associationDate' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'customSetTag' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'imageUrl' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddTagToCustomSetMutation,
  AddTagToCustomSetMutationVariables
>;
export const ChangeClassicDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'changeClassic' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'classic' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Boolean' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changeClassic' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'classic' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'classic' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangeClassicMutation,
  ChangeClassicMutationVariables
>;
export const ChangeLocaleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'changeLocale' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'locale' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changeLocale' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangeLocaleMutation,
  ChangeLocaleMutationVariables
>;
export const ChangePasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'changePassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'oldPassword' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'newPassword' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changePassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'oldPassword' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'oldPassword' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'newPassword' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'newPassword' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;
export const ChangeProfilePictureDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'changeProfilePicture' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'picture' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changeProfilePicture' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'picture' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'picture' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'profilePicture' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangeProfilePictureMutation,
  ChangeProfilePictureMutationVariables
>;
export const CopyCustomSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'copyCustomSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'copyCustomSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'customSet' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'customSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'exos' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'baseStats' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'creationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastModified' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'hasEditPermission' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CopyCustomSetMutation,
  CopyCustomSetMutationVariables
>;
export const CreateCustomSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createCustomSet' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCustomSet' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'customSet' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'customSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'exos' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'baseStats' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'creationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastModified' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'hasEditPermission' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateCustomSetMutation,
  CreateCustomSetMutationVariables
>;
export const DeleteCustomSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteCustomSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCustomSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCustomSetMutation,
  DeleteCustomSetMutationVariables
>;
export const DeleteCustomSetItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteCustomSetItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'itemSlotId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCustomSetItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'itemSlotId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'itemSlotId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastModified' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'equippedItems' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCustomSetItemMutation,
  DeleteCustomSetItemMutationVariables
>;
export const EditBuildSettingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'editBuildSettings' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'gender' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'BuildGender' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'buildDefaultClassId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editBuildSettings' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'gender' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'gender' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'buildDefaultClassId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'buildDefaultClassId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'userSetting' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'buildGender' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'buildClass' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'maleFaceImageUrl' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'femaleFaceImageUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'maleSpriteImageUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'femaleSpriteImageUrl',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditBuildSettingsMutation,
  EditBuildSettingsMutationVariables
>;
export const EditCustomSetDefaultClassDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'editCustomSetDefaultClass' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'defaultClassId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'buildGender' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'BuildGender' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editCustomSetDefaultClass' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'defaultClassId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'defaultClassId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'buildGender' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'buildGender' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastModified' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'defaultClass' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'enName' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'femaleFaceImageUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'maleFaceImageUrl' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'femaleSpriteImageUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'maleSpriteImageUrl',
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'buildGender' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditCustomSetDefaultClassMutation,
  EditCustomSetDefaultClassMutationVariables
>;
export const EditCustomSetMetadataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'editCustomSetMetadata' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'level' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editCustomSetMetadata' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'name' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'name' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'level' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'level' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastModified' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditCustomSetMetadataMutation,
  EditCustomSetMetadataMutationVariables
>;
export const EditCustomSetStatsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'editCustomSetStats' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'stats' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CustomSetStatsInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editCustomSetStats' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'stats' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'stats' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastModified' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'stats' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'baseVitality' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'baseWisdom' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'baseStrength' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'baseIntelligence' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'baseChance' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'baseAgility' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scrolledVitality' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scrolledWisdom' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scrolledStrength' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'scrolledIntelligence',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scrolledChance' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scrolledAgility' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditCustomSetStatsMutation,
  EditCustomSetStatsMutationVariables
>;
export const EquipItemsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'equipItems' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'itemIds' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'UUID' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equipMultipleItems' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'itemIds' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'itemIds' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'customSet' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'customSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'exos' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'baseStats' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'creationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastModified' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'hasEditPermission' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EquipItemsMutation, EquipItemsMutationVariables>;
export const EquipSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'equipSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'setId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equipSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'setId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'setId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'customSet' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'customSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'exos' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'baseStats' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'creationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastModified' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'hasEditPermission' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EquipSetMutation, EquipSetMutationVariables>;
export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'login' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'password' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'remember' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Boolean' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'loginUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'email' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'email' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'password' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'remember' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'remember' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'favoriteItems' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'item' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'verified' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'settings' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'buildGender' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'buildClass' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'maleFaceImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'femaleFaceImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'maleSpriteImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'femaleSpriteImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'logout' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'logoutUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const MageEquippedItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'mageEquippedItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'stats' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'CustomSetExosInput' },
                },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'equippedItemId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'weaponElementMage' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'WeaponElementMage' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mageEquippedItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'equippedItemId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'equippedItemId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'stats' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'stats' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'weaponElementMage' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equippedItem' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'exos' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'stat' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'value' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'weaponElementMage' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MageEquippedItemMutation,
  MageEquippedItemMutationVariables
>;
export const RegisterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'register' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'password' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'username' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'gender' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'BuildGender' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'buildDefaultClassId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'registerUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'email' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'email' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'password' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'username' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'username' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'gender' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'gender' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'buildDefaultClassId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'buildDefaultClassId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'favoriteItems' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'item' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'verified' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'settings' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'buildGender' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'buildClass' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'maleFaceImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'femaleFaceImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'maleSpriteImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'femaleSpriteImageUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const RemoveTagFromCustomSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeTagFromCustomSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetTagId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeTagFromCustomSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetTagId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetTagId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tagAssociations' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'associationDate' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'customSetTag' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'imageUrl' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveTagFromCustomSetMutation,
  RemoveTagFromCustomSetMutationVariables
>;
export const RequestPasswordResetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'requestPasswordReset' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'requestPasswordReset' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'email' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'email' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
>;
export const ResendVerificationEmailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'resendVerificationEmail' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resendVerificationEmail' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResendVerificationEmailMutation,
  ResendVerificationEmailMutationVariables
>;
export const ResetPasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'resetPassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'token' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'password' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resetPassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'token' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'token' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'password' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'ok' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const RestartCustomSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'restartCustomSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'shouldResetStats' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Boolean' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'restartCustomSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'shouldResetStats' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'shouldResetStats' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'customSet' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'customSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'exos' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'baseStats' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'creationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastModified' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'hasEditPermission' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RestartCustomSetMutation,
  RestartCustomSetMutationVariables
>;
export const SetEquippedItemExoDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'setEquippedItemExo' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'stat' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Stat' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'equippedItemId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'hasStat' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Boolean' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setEquippedItemExo' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'stat' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'stat' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'equippedItemId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'equippedItemId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'hasStat' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'hasStat' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equippedItem' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'exos' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'stat' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'value' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetEquippedItemExoMutation,
  SetEquippedItemExoMutationVariables
>;
export const ToggleFavoriteItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'toggleFavoriteItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'itemId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'isFavorite' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Boolean' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'toggleFavoriteItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'itemId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'itemId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'isFavorite' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'isFavorite' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'favoriteItems' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'item' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ToggleFavoriteItemMutation,
  ToggleFavoriteItemMutationVariables
>;
export const UpdateCustomSetItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateCustomSetItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'itemSlotId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'customSetId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'itemId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCustomSetItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'itemSlotId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'itemSlotId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'customSetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'customSetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'itemId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'itemId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSet' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'equippedItems' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'slot' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'order' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'item' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'item' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'exos' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'stat' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'value' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'weaponElementMage',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCustomSetItemMutation,
  UpdateCustomSetItemMutationVariables
>;
export const BuildListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'buildList' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'username' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'first' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'after' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filters' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CustomSetFilters' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'userByName' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'username' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'username' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSets' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'first' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'first' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'after' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'after' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'filters' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'filters' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'edges' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'node' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'FragmentSpread',
                                    name: {
                                      kind: 'Name',
                                      value: 'abbreviatedCustomSet',
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pageInfo' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'hasNextPage' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'endCursor' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'abbreviatedCustomSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BuildListQuery, BuildListQueryVariables>;
export const ClassBuffsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'classBuffs' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'classById' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'spellVariantPairs' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'spells' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'imageUrl' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'spellStats' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'level' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'buffs' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'FragmentSpread',
                                          name: { kind: 'Name', value: 'buff' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClassBuffsQuery, ClassBuffsQueryVariables>;
export const ClassByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'classById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'classById' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'spellVariantPairs' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'spells' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'imageUrl' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'isTrap' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'spellStats' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'level' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'apCost' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'castsPerTurn',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'castsPerTarget',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'cooldown' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'isLinear' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'needsLos' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'needsFreeCell',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'baseCritChance',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'minRange' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'maxRange' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'hasModifiableRange',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'spellEffects',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'minDamage',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'maxDamage',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'critMinDamage',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'critMaxDamage',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'effectType',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'condition',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'spellDamageIncrease',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'baseIncrease',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'critBaseIncrease',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'maxStacks',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'buffs' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'FragmentSpread',
                                          name: { kind: 'Name', value: 'buff' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClassByIdQuery, ClassByIdQueryVariables>;
export const ClassesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'classes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'classes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'allNames' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClassesQuery, ClassesQueryVariables>;
export const CurrentUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'currentUser' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'verified' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'favoriteItems' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'settings' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'buildGender' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'buildClass' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'maleFaceImageUrl' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'femaleFaceImageUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'maleSpriteImageUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'femaleSpriteImageUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const CustomSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'customSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'customSetById' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'customSet' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'stats' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'baseStats' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'baseStats' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSetStats' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseStrength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseIntelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'baseAgility' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledVitality' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledWisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledStrength' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scrolledIntelligence' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledChance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scrolledAgility' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'customSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'exos' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponElementMage' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'baseStats' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleSpriteImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleSpriteImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'creationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastModified' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'hasEditPermission' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CustomSetQuery, CustomSetQueryVariables>;
export const CustomSetTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'customSetTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'customSetTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CustomSetTagsQuery, CustomSetTagsQueryVariables>;
export const ItemSlotsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'itemSlots' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemSlots' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'itemTypes' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ItemSlotsQuery, ItemSlotsQueryVariables>;
export const ItemsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'items' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'first' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'after' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filters' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ItemFilters' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'equippedItemIds' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'UUID' },
                },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'eligibleItemTypeIds' },
          },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'UUID' },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'level' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'first' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'after' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'after' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filters' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'edges' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'node' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'item' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pageInfo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hasNextPage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'endCursor' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemSuggestions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'eligibleItemTypeIds' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'eligibleItemTypeIds' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'equippedItemIds' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'equippedItemIds' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'level' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'level' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'item' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ItemsQuery, ItemsQueryVariables>;
export const MyCustomSetsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'myCustomSets' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'first' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'after' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filters' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CustomSetFilters' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'currentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSets' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'first' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'first' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'after' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'after' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'filters' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'filters' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'edges' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'node' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'FragmentSpread',
                                    name: {
                                      kind: 'Name',
                                      value: 'abbreviatedCustomSet',
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pageInfo' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'hasNextPage' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'endCursor' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'abbreviatedCustomSet' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CustomSet' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'buildGender' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'defaultClass' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maleFaceImageUrl' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'femaleFaceImageUrl' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equippedItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'slot' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'item' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagAssociations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'associationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSetTag' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyCustomSetsQuery, MyCustomSetsQueryVariables>;
export const SessionSettingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'sessionSettings' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'locale' } },
          { kind: 'Field', name: { kind: 'Name', value: 'classic' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SessionSettingsQuery,
  SessionSettingsQueryVariables
>;
export const SetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'set' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UUID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setById' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'set' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'item' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'set' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Set' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'bonuses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'numItems' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetQuery, SetQueryVariables>;
export const SetsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'sets' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'first' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'after' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filters' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SetFilters' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sets' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'first' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'after' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'after' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filters' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'edges' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'node' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'set' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'items' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'FragmentSpread',
                                    name: { kind: 'Name', value: 'item' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pageInfo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hasNextPage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'endCursor' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'buff' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Buff' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
          { kind: 'Field', name: { kind: 'Name', value: 'incrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'critIncrementBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxStacks' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'set' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Set' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'bonuses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'numItems' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'item' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Item' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customStat' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weaponStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'apCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usesPerTurn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minRange' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxRange' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseCritChance' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'critBonusDamage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weaponEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxDamage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'itemType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'enName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'eligibleItemSlots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'set' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bonuses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'numItems' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'stat' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customStat' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'buffs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'buff' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetsQuery, SetsQueryVariables>;
export const UserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'userProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'username' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'userByName' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'username' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'username' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'profilePicture' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'creationDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customSets' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'filters' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'search' },
                            value: {
                              kind: 'StringValue',
                              value: '',
                              block: false,
                            },
                          },
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'tagIds' },
                            value: { kind: 'ListValue', values: [] },
                          },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalCount' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>;
