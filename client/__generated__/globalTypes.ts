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
  DateTime: { input: any; output: any };
  JSONString: { input: any; output: any };
  UUID: { input: any; output: any };
};

export type AddTagToCustomSet = {
  __typename: 'AddTagToCustomSet';
  customSet: CustomSet;
};

export type Buff = GlobalNode & {
  __typename: 'Buff';
  critIncrementBy: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  incrementBy: Maybe<Scalars['Int']['output']>;
  item: Maybe<Item>;
  itemId: Maybe<Scalars['String']['output']>;
  maxStacks: Maybe<Scalars['Int']['output']>;
  spellStatId: Maybe<Scalars['String']['output']>;
  spellStats: Maybe<SpellStats>;
  stat: Stat;
  uuid: Scalars['String']['output'];
};

/** An enumeration. */
export enum BuildGender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

export type ChangeClassic = {
  __typename: 'ChangeClassic';
  ok: Scalars['Boolean']['output'];
};

export type ChangeLocale = {
  __typename: 'ChangeLocale';
  ok: Scalars['Boolean']['output'];
};

export type ChangePassword = {
  __typename: 'ChangePassword';
  ok: Scalars['Boolean']['output'];
};

export type ChangeProfilePicture = {
  __typename: 'ChangeProfilePicture';
  user: User;
};

export type Class = GlobalNode & {
  __typename: 'Class';
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
  __typename: 'CopyCustomSet';
  customSet: CustomSet;
};

export type CreateCustomSet = {
  __typename: 'CreateCustomSet';
  customSet: CustomSet;
};

export type CustomSet = GlobalNode & {
  __typename: 'CustomSet';
  buildGender: BuildGender;
  childrenCustomSets: Maybe<Array<Maybe<CustomSet>>>;
  creationDate: Maybe<Scalars['DateTime']['output']>;
  defaultClass: Maybe<Class>;
  defaultClassId: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  equippedItems: Array<EquippedItem>;
  hasEditPermission: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  lastModified: Maybe<Scalars['DateTime']['output']>;
  level: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  owner: Maybe<User>;
  ownerId: Maybe<Scalars['String']['output']>;
  parentCustomSet: Maybe<Array<Maybe<CustomSet>>>;
  parentCustomSetId: Maybe<Scalars['String']['output']>;
  stats: CustomSetStats;
  tagAssociations: Array<CustomSetTagAssociation>;
  tags: Maybe<Array<Maybe<CustomSetTag>>>;
  uuid: Scalars['String']['output'];
};

export type CustomSetConnection = {
  __typename: 'CustomSetConnection';
  edges: Array<CustomSetEdge>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CustomSetEdge = {
  __typename: 'CustomSetEdge';
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
  __typename: 'CustomSetStats';
  baseAgility: Scalars['Int']['output'];
  baseChance: Scalars['Int']['output'];
  baseIntelligence: Scalars['Int']['output'];
  baseStrength: Scalars['Int']['output'];
  baseVitality: Scalars['Int']['output'];
  baseWisdom: Scalars['Int']['output'];
  customSet: Maybe<CustomSet>;
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
  __typename: 'CustomSetTag';
  customSets: Maybe<Array<Maybe<CustomSet>>>;
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type CustomSetTagAssociation = {
  __typename: 'CustomSetTagAssociation';
  associationDate: Scalars['DateTime']['output'];
  customSet: Maybe<CustomSet>;
  customSetId: Scalars['String']['output'];
  customSetTag: CustomSetTag;
  customSetTagId: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type DeleteCustomSet = {
  __typename: 'DeleteCustomSet';
  ok: Scalars['Boolean']['output'];
};

export type DeleteCustomSetItem = {
  __typename: 'DeleteCustomSetItem';
  customSet: CustomSet;
};

export type EditBuildSettings = {
  __typename: 'EditBuildSettings';
  userSetting: UserSetting;
};

export type EditCustomSetDefaultClass = {
  __typename: 'EditCustomSetDefaultClass';
  customSet: CustomSet;
};

export type EditCustomSetMetadata = {
  __typename: 'EditCustomSetMetadata';
  customSet: CustomSet;
};

export type EditCustomSetStats = {
  __typename: 'EditCustomSetStats';
  customSet: CustomSet;
};

export type EquipMultipleItems = {
  __typename: 'EquipMultipleItems';
  customSet: CustomSet;
};

export type EquipSet = {
  __typename: 'EquipSet';
  customSet: CustomSet;
};

export type EquippedItem = GlobalNode & {
  __typename: 'EquippedItem';
  exos: Array<EquippedItemExo>;
  id: Scalars['UUID']['output'];
  item: Item;
  slot: ItemSlot;
  weaponElementMage: Maybe<WeaponElementMage>;
};

export type EquippedItemExo = GlobalNode & {
  __typename: 'EquippedItemExo';
  equippedItemId: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  stat: Stat;
  uuid: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type GlobalNode = {
  id: Scalars['UUID']['output'];
};

export type ImportCustomSet = {
  __typename: 'ImportCustomSet';
  customSet: CustomSet;
};

export type Item = GlobalNode & {
  __typename: 'Item';
  buffs: Maybe<Array<Buff>>;
  conditions: Maybe<Scalars['JSONString']['output']>;
  dofusDbId: Maybe<Scalars['String']['output']>;
  dofusDbMountId: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  itemType: ItemType;
  itemTypeId: Scalars['String']['output'];
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  set: Maybe<Set>;
  setId: Maybe<Scalars['String']['output']>;
  stats: Array<ItemStat>;
  uuid: Scalars['String']['output'];
  weaponStats: Maybe<WeaponStat>;
};

export type ItemConnection = {
  __typename: 'ItemConnection';
  edges: Array<ItemEdge>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ItemEdge = {
  __typename: 'ItemEdge';
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
  __typename: 'ItemSlot';
  enName: Scalars['String']['output'];
  equippedItems: Maybe<Array<Maybe<EquippedItem>>>;
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  itemTypes: Array<ItemType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  uuid: Scalars['String']['output'];
};

export type ItemStat = GlobalNode & {
  __typename: 'ItemStat';
  customStat: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  item: Maybe<Item>;
  itemId: Scalars['String']['output'];
  maxValue: Maybe<Scalars['Int']['output']>;
  minValue: Maybe<Scalars['Int']['output']>;
  order: Scalars['Int']['output'];
  stat: Maybe<Stat>;
  uuid: Scalars['String']['output'];
};

export type ItemType = GlobalNode & {
  __typename: 'ItemType';
  eligibleItemSlots: Array<ItemSlot>;
  enName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  items: Maybe<Array<Maybe<Item>>>;
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type LoginUser = {
  __typename: 'LoginUser';
  ok: Scalars['Boolean']['output'];
  user: Maybe<User>;
};

export type LogoutUser = {
  __typename: 'LogoutUser';
  ok: Scalars['Boolean']['output'];
};

export type MageEquippedItem = {
  __typename: 'MageEquippedItem';
  equippedItem: EquippedItem;
};

export type Mutation = {
  __typename: 'Mutation';
  addTagToCustomSet: Maybe<AddTagToCustomSet>;
  changeClassic: Maybe<ChangeClassic>;
  changeLocale: Maybe<ChangeLocale>;
  changePassword: Maybe<ChangePassword>;
  changeProfilePicture: Maybe<ChangeProfilePicture>;
  copyCustomSet: Maybe<CopyCustomSet>;
  createCustomSet: Maybe<CreateCustomSet>;
  deleteCustomSet: Maybe<DeleteCustomSet>;
  deleteCustomSetItem: Maybe<DeleteCustomSetItem>;
  editBuildSettings: Maybe<EditBuildSettings>;
  editCustomSetDefaultClass: Maybe<EditCustomSetDefaultClass>;
  editCustomSetMetadata: Maybe<EditCustomSetMetadata>;
  editCustomSetStats: Maybe<EditCustomSetStats>;
  equipMultipleItems: Maybe<EquipMultipleItems>;
  equipSet: Maybe<EquipSet>;
  importCustomSet: Maybe<ImportCustomSet>;
  loginUser: Maybe<LoginUser>;
  logoutUser: Maybe<LogoutUser>;
  mageEquippedItem: Maybe<MageEquippedItem>;
  registerUser: Maybe<RegisterUser>;
  removeTagFromCustomSet: Maybe<RemoveTagFromCustomSet>;
  requestPasswordReset: Maybe<RequestPasswordReset>;
  resendVerificationEmail: Maybe<ResendVerificationEmail>;
  resetPassword: Maybe<ResetPassword>;
  restartCustomSet: Maybe<RestartCustomSet>;
  setEquippedItemExo: Maybe<SetEquippedItemExo>;
  toggleFavoriteItem: Maybe<ToggleFavoriteItem>;
  updateCustomSetItem: Maybe<UpdateCustomSetItem>;
};

export type MutationaddTagToCustomSetArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  customSetTagId: Scalars['UUID']['input'];
};

export type MutationchangeClassicArgs = {
  classic: Scalars['Boolean']['input'];
};

export type MutationchangeLocaleArgs = {
  locale: Scalars['String']['input'];
};

export type MutationchangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type MutationchangeProfilePictureArgs = {
  picture: Scalars['String']['input'];
};

export type MutationcopyCustomSetArgs = {
  customSetId: Scalars['UUID']['input'];
};

export type MutationdeleteCustomSetArgs = {
  customSetId: Scalars['UUID']['input'];
};

export type MutationdeleteCustomSetItemArgs = {
  customSetId: Scalars['UUID']['input'];
  itemSlotId: Scalars['UUID']['input'];
};

export type MutationeditBuildSettingsArgs = {
  buildDefaultClassId?: InputMaybe<Scalars['UUID']['input']>;
  gender: BuildGender;
};

export type MutationeditCustomSetDefaultClassArgs = {
  buildGender: BuildGender;
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  defaultClassId?: InputMaybe<Scalars['UUID']['input']>;
};

export type MutationeditCustomSetMetadataArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  level: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type MutationeditCustomSetStatsArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  stats: CustomSetStatsInput;
};

export type MutationequipMultipleItemsArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  itemIds: Array<Scalars['UUID']['input']>;
};

export type MutationequipSetArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  setId: Scalars['UUID']['input'];
};

export type MutationimportCustomSetArgs = {
  items: Array<CustomSetImportedItemInput>;
  level: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  stats: CustomSetStatsInput;
};

export type MutationloginUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  remember: Scalars['Boolean']['input'];
};

export type MutationmageEquippedItemArgs = {
  equippedItemId: Scalars['UUID']['input'];
  stats: Array<CustomSetExosInput>;
  weaponElementMage?: InputMaybe<WeaponElementMage>;
};

export type MutationregisterUserArgs = {
  buildDefaultClassId?: InputMaybe<Scalars['UUID']['input']>;
  email: Scalars['String']['input'];
  gender: BuildGender;
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MutationremoveTagFromCustomSetArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  customSetTagId: Scalars['UUID']['input'];
};

export type MutationrequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};

export type MutationresetPasswordArgs = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationrestartCustomSetArgs = {
  customSetId: Scalars['UUID']['input'];
  shouldResetStats: Scalars['Boolean']['input'];
};

export type MutationsetEquippedItemExoArgs = {
  equippedItemId: Scalars['UUID']['input'];
  hasStat: Scalars['Boolean']['input'];
  stat: Stat;
};

export type MutationtoggleFavoriteItemArgs = {
  isFavorite: Scalars['Boolean']['input'];
  itemId: Scalars['UUID']['input'];
};

export type MutationupdateCustomSetItemArgs = {
  customSetId?: InputMaybe<Scalars['UUID']['input']>;
  itemId?: InputMaybe<Scalars['UUID']['input']>;
  itemSlotId: Scalars['UUID']['input'];
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename: 'Query';
  classById: Maybe<Class>;
  classes: Array<Class>;
  classic: Scalars['Boolean']['output'];
  currentUser: Maybe<User>;
  customSetById: Maybe<CustomSet>;
  customSetTags: Array<CustomSetTag>;
  customSets: CustomSetConnection;
  itemById: Maybe<Item>;
  itemSlots: Array<ItemSlot>;
  itemSuggestions: Array<Item>;
  items: ItemConnection;
  itemsByName: Array<Item>;
  locale: Scalars['String']['output'];
  setById: Set;
  sets: SetConnection;
  userById: Maybe<User>;
  userByName: Maybe<User>;
};

export type QueryclassByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QuerycustomSetByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QuerycustomSetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryitemByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryitemSuggestionsArgs = {
  eligibleItemTypeIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
  equippedItemIds: Array<Scalars['UUID']['input']>;
  level: Scalars['Int']['input'];
  numSuggestions?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryitemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<ItemFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryitemsByNameArgs = {
  itemNameObjs: Array<ItemNameObject>;
};

export type QuerysetByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QuerysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<SetFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryuserByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryuserByNameArgs = {
  username: Scalars['String']['input'];
};

export type RegisterUser = {
  __typename: 'RegisterUser';
  ok: Scalars['Boolean']['output'];
  user: Maybe<User>;
};

export type RemoveTagFromCustomSet = {
  __typename: 'RemoveTagFromCustomSet';
  customSet: CustomSet;
};

export type RequestPasswordReset = {
  __typename: 'RequestPasswordReset';
  ok: Scalars['Boolean']['output'];
};

export type ResendVerificationEmail = {
  __typename: 'ResendVerificationEmail';
  ok: Scalars['Boolean']['output'];
};

export type ResetPassword = {
  __typename: 'ResetPassword';
  ok: Scalars['Boolean']['output'];
};

export type RestartCustomSet = {
  __typename: 'RestartCustomSet';
  customSet: CustomSet;
};

export type Set = GlobalNode & {
  __typename: 'Set';
  bonuses: Array<SetBonus>;
  dofusDbId: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  items: Array<Item>;
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type SetBonus = GlobalNode & {
  __typename: 'SetBonus';
  customStat: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  numItems: Scalars['Int']['output'];
  setId: Scalars['String']['output'];
  stat: Maybe<Stat>;
  uuid: Scalars['String']['output'];
  value: Maybe<Scalars['Int']['output']>;
};

export type SetConnection = {
  __typename: 'SetConnection';
  edges: Array<SetEdge>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SetEdge = {
  __typename: 'SetEdge';
  cursor: Scalars['String']['output'];
  node: Set;
};

export type SetEquippedItemExo = {
  __typename: 'SetEquippedItemExo';
  equippedItem: EquippedItem;
};

export type SetFilters = {
  itemTypeIds: Array<Scalars['UUID']['input']>;
  maxLevel: Scalars['Int']['input'];
  search: Scalars['String']['input'];
  stats: Array<StatFilter>;
};

export type Spell = GlobalNode & {
  __typename: 'Spell';
  description: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  isTrap: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  spellStats: Array<SpellStats>;
  spellVariantPair: Maybe<SpellVariantPair>;
  spellVariantPairId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type SpellDamageIncrease = GlobalNode & {
  __typename: 'SpellDamageIncrease';
  baseIncrease: Scalars['Int']['output'];
  critBaseIncrease: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  maxStacks: Maybe<Scalars['Int']['output']>;
  spellStatId: Scalars['String']['output'];
  spellStats: Maybe<SpellStats>;
  uuid: Scalars['String']['output'];
};

/** An enumeration. */
export enum SpellEffectType {
  AIR_DAMAGE = 'AIR_DAMAGE',
  AIR_HEALING = 'AIR_HEALING',
  AIR_STEAL = 'AIR_STEAL',
  AP = 'AP',
  BEST_ELEMENT_DAMAGE = 'BEST_ELEMENT_DAMAGE',
  BEST_ELEMENT_HEALING = 'BEST_ELEMENT_HEALING',
  BEST_ELEMENT_STEAL = 'BEST_ELEMENT_STEAL',
  EARTH_DAMAGE = 'EARTH_DAMAGE',
  EARTH_HEALING = 'EARTH_HEALING',
  EARTH_STEAL = 'EARTH_STEAL',
  FIRE_DAMAGE = 'FIRE_DAMAGE',
  FIRE_HEALING = 'FIRE_HEALING',
  FIRE_STEAL = 'FIRE_STEAL',
  HP_RESTORED = 'HP_RESTORED',
  MP = 'MP',
  NEUTRAL_DAMAGE = 'NEUTRAL_DAMAGE',
  NEUTRAL_HEALING = 'NEUTRAL_HEALING',
  NEUTRAL_STEAL = 'NEUTRAL_STEAL',
  PUSHBACK_DAMAGE = 'PUSHBACK_DAMAGE',
  SHIELD = 'SHIELD',
  WATER_DAMAGE = 'WATER_DAMAGE',
  WATER_HEALING = 'WATER_HEALING',
  WATER_STEAL = 'WATER_STEAL',
}

export type SpellEffects = GlobalNode & {
  __typename: 'SpellEffects';
  condition: Maybe<Scalars['String']['output']>;
  critMaxDamage: Maybe<Scalars['Int']['output']>;
  critMinDamage: Maybe<Scalars['Int']['output']>;
  effectType: SpellEffectType;
  id: Scalars['UUID']['output'];
  maxDamage: Scalars['Int']['output'];
  minDamage: Maybe<Scalars['Int']['output']>;
  order: Maybe<Scalars['Int']['output']>;
  spellStatId: Scalars['String']['output'];
  spellStats: Maybe<SpellStats>;
  uuid: Scalars['String']['output'];
};

export type SpellStats = GlobalNode & {
  __typename: 'SpellStats';
  aoe: Maybe<Scalars['String']['output']>;
  apCost: Scalars['Int']['output'];
  baseCritChance: Maybe<Scalars['Int']['output']>;
  buffs: Maybe<Array<Buff>>;
  castsPerTarget: Maybe<Scalars['Int']['output']>;
  castsPerTurn: Maybe<Scalars['Int']['output']>;
  cooldown: Maybe<Scalars['Int']['output']>;
  hasModifiableRange: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  isLinear: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  maxRange: Maybe<Scalars['Int']['output']>;
  minRange: Maybe<Scalars['Int']['output']>;
  needsFreeCell: Scalars['Boolean']['output'];
  needsLos: Scalars['Boolean']['output'];
  spell: Maybe<Spell>;
  spellDamageIncrease: Maybe<SpellDamageIncrease>;
  spellEffects: Array<SpellEffects>;
  spellId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type SpellVariantPair = GlobalNode & {
  __typename: 'SpellVariantPair';
  class: Maybe<Class>;
  classId: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  spells: Array<Spell>;
  uuid: Scalars['String']['output'];
};

/** An enumeration. */
export enum Stat {
  AGILITY = 'AGILITY',
  AIR_DAMAGE = 'AIR_DAMAGE',
  AIR_RES = 'AIR_RES',
  AP = 'AP',
  AP_PARRY = 'AP_PARRY',
  AP_REDUCTION = 'AP_REDUCTION',
  CHANCE = 'CHANCE',
  CRITICAL = 'CRITICAL',
  CRITICAL_DAMAGE = 'CRITICAL_DAMAGE',
  CRITICAL_RES = 'CRITICAL_RES',
  DAMAGE = 'DAMAGE',
  DODGE = 'DODGE',
  EARTH_DAMAGE = 'EARTH_DAMAGE',
  EARTH_RES = 'EARTH_RES',
  FIRE_DAMAGE = 'FIRE_DAMAGE',
  FIRE_RES = 'FIRE_RES',
  HEALS = 'HEALS',
  INITIATIVE = 'INITIATIVE',
  INTELLIGENCE = 'INTELLIGENCE',
  LOCK = 'LOCK',
  MP = 'MP',
  MP_PARRY = 'MP_PARRY',
  MP_REDUCTION = 'MP_REDUCTION',
  NEUTRAL_DAMAGE = 'NEUTRAL_DAMAGE',
  NEUTRAL_RES = 'NEUTRAL_RES',
  PCT_AIR_RES = 'PCT_AIR_RES',
  PCT_EARTH_RES = 'PCT_EARTH_RES',
  PCT_FINAL_DAMAGE = 'PCT_FINAL_DAMAGE',
  PCT_FIRE_RES = 'PCT_FIRE_RES',
  PCT_MELEE_DAMAGE = 'PCT_MELEE_DAMAGE',
  PCT_MELEE_RES = 'PCT_MELEE_RES',
  PCT_NEUTRAL_RES = 'PCT_NEUTRAL_RES',
  PCT_RANGED_DAMAGE = 'PCT_RANGED_DAMAGE',
  PCT_RANGED_RES = 'PCT_RANGED_RES',
  PCT_SPELL_DAMAGE = 'PCT_SPELL_DAMAGE',
  PCT_WATER_RES = 'PCT_WATER_RES',
  PCT_WEAPON_DAMAGE = 'PCT_WEAPON_DAMAGE',
  PODS = 'PODS',
  POWER = 'POWER',
  PROSPECTING = 'PROSPECTING',
  PUSHBACK_DAMAGE = 'PUSHBACK_DAMAGE',
  PUSHBACK_RES = 'PUSHBACK_RES',
  RANGE = 'RANGE',
  REFLECT = 'REFLECT',
  STRENGTH = 'STRENGTH',
  SUMMON = 'SUMMON',
  TRAP_DAMAGE = 'TRAP_DAMAGE',
  TRAP_POWER = 'TRAP_POWER',
  VITALITY = 'VITALITY',
  WATER_DAMAGE = 'WATER_DAMAGE',
  WATER_RES = 'WATER_RES',
  WISDOM = 'WISDOM',
}

export type StatFilter = {
  maxValue?: InputMaybe<Scalars['Int']['input']>;
  minValue?: InputMaybe<Scalars['Int']['input']>;
  stat: Stat;
};

export type ToggleFavoriteItem = {
  __typename: 'ToggleFavoriteItem';
  user: User;
};

export type UpdateCustomSetItem = {
  __typename: 'UpdateCustomSetItem';
  customSet: CustomSet;
};

export type User = GlobalNode & {
  __typename: 'User';
  creationDate: Maybe<Scalars['DateTime']['output']>;
  customSets: CustomSetConnection;
  email: Scalars['String']['output'];
  favoriteItems: Array<Item>;
  id: Scalars['UUID']['output'];
  profilePicture: Scalars['String']['output'];
  settings: UserSetting;
  username: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};

export type UsercustomSetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<CustomSetFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type UserSetting = GlobalNode & {
  __typename: 'UserSetting';
  buildClass: Maybe<Class>;
  buildClassId: Maybe<Scalars['String']['output']>;
  buildGender: BuildGender;
  classic: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  locale: Scalars['String']['output'];
  user: Maybe<User>;
  userId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
};

export type WeaponEffect = GlobalNode & {
  __typename: 'WeaponEffect';
  effectType: WeaponEffectType;
  id: Scalars['UUID']['output'];
  maxDamage: Scalars['Int']['output'];
  minDamage: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
  weaponStat: Maybe<WeaponStat>;
  weaponStatId: Scalars['String']['output'];
};

/** An enumeration. */
export enum WeaponEffectType {
  AIR_DAMAGE = 'AIR_DAMAGE',
  AIR_HEALING = 'AIR_HEALING',
  AIR_STEAL = 'AIR_STEAL',
  AP = 'AP',
  ATTRACT_CELLS = 'ATTRACT_CELLS',
  BEST_ELEMENT_DAMAGE = 'BEST_ELEMENT_DAMAGE',
  BEST_ELEMENT_STEAL = 'BEST_ELEMENT_STEAL',
  EARTH_DAMAGE = 'EARTH_DAMAGE',
  EARTH_HEALING = 'EARTH_HEALING',
  EARTH_STEAL = 'EARTH_STEAL',
  FIRE_DAMAGE = 'FIRE_DAMAGE',
  FIRE_HEALING = 'FIRE_HEALING',
  FIRE_STEAL = 'FIRE_STEAL',
  HP_RESTORED = 'HP_RESTORED',
  MP = 'MP',
  NEUTRAL_DAMAGE = 'NEUTRAL_DAMAGE',
  NEUTRAL_HEALING = 'NEUTRAL_HEALING',
  NEUTRAL_STEAL = 'NEUTRAL_STEAL',
  PUSHBACK_DAMAGE = 'PUSHBACK_DAMAGE',
  STEALS_MP = 'STEALS_MP',
  WATER_DAMAGE = 'WATER_DAMAGE',
  WATER_HEALING = 'WATER_HEALING',
  WATER_STEAL = 'WATER_STEAL',
}

/** An enumeration. */
export enum WeaponElementMage {
  AIR_50 = 'AIR_50',
  AIR_68 = 'AIR_68',
  AIR_85 = 'AIR_85',
  EARTH_50 = 'EARTH_50',
  EARTH_68 = 'EARTH_68',
  EARTH_85 = 'EARTH_85',
  FIRE_50 = 'FIRE_50',
  FIRE_68 = 'FIRE_68',
  FIRE_85 = 'FIRE_85',
  WATER_50 = 'WATER_50',
  WATER_68 = 'WATER_68',
  WATER_85 = 'WATER_85',
}

export type WeaponStat = GlobalNode & {
  __typename: 'WeaponStat';
  apCost: Scalars['Int']['output'];
  baseCritChance: Maybe<Scalars['Int']['output']>;
  critBonusDamage: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  item: Maybe<Item>;
  itemId: Scalars['String']['output'];
  maxRange: Scalars['Int']['output'];
  minRange: Maybe<Scalars['Int']['output']>;
  usesPerTurn: Scalars['Int']['output'];
  uuid: Scalars['String']['output'];
  weaponEffects: Array<WeaponEffect>;
};
