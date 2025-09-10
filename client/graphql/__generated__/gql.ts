/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  'fragment abbreviatedCustomSet on CustomSet {\n  id\n  buildGender\n  defaultClass {\n    id\n    name\n    maleFaceImageUrl\n    femaleFaceImageUrl\n  }\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      order\n    }\n    item {\n      id\n      imageUrl\n    }\n  }\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n}': typeof types.AbbreviatedCustomSetFragmentDoc;
  'fragment baseStats on CustomSetStats {\n  id\n  baseVitality\n  baseWisdom\n  baseStrength\n  baseIntelligence\n  baseChance\n  baseAgility\n  scrolledVitality\n  scrolledWisdom\n  scrolledStrength\n  scrolledIntelligence\n  scrolledChance\n  scrolledAgility\n}': typeof types.BaseStatsFragmentDoc;
  'fragment buff on Buff {\n  id\n  stat\n  incrementBy\n  critIncrementBy\n  maxStacks\n}': typeof types.BuffFragmentDoc;
  'fragment customSet on CustomSet {\n  id\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      enName\n      name\n      order\n    }\n    item {\n      ...item\n    }\n    exos {\n      id\n      stat\n      value\n    }\n    weaponElementMage\n  }\n  stats {\n    ...baseStats\n  }\n  owner {\n    id\n    username\n  }\n  defaultClass {\n    id\n    name\n    enName\n    femaleFaceImageUrl\n    maleFaceImageUrl\n    femaleSpriteImageUrl\n    maleSpriteImageUrl\n  }\n  creationDate\n  lastModified\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n  hasEditPermission\n  buildGender\n}': typeof types.CustomSetFragmentDoc;
  'fragment item on Item {\n  id\n  name\n  level\n  imageUrl\n  stats {\n    id\n    order\n    maxValue\n    stat\n    customStat\n  }\n  weaponStats {\n    id\n    apCost\n    usesPerTurn\n    minRange\n    maxRange\n    baseCritChance\n    critBonusDamage\n    weaponEffects {\n      id\n      minDamage\n      maxDamage\n      effectType\n    }\n  }\n  conditions\n  itemType {\n    id\n    name\n    enName\n    eligibleItemSlots {\n      id\n      enName\n      order\n    }\n  }\n  set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n  buffs {\n    ...buff\n  }\n}': typeof types.ItemFragmentDoc;
  'fragment set on Set {\n  id\n  name\n  bonuses {\n    id\n    numItems\n    stat\n    value\n    customStat\n  }\n}': typeof types.SetFragmentDoc;
  'mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  addTagToCustomSet(customSetId: $customSetId, customSetTagId: $customSetTagId) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}': typeof types.AddTagToCustomSetDocument;
  'mutation changeClassic($classic: Boolean!) {\n  changeClassic(classic: $classic) {\n    ok\n  }\n}': typeof types.ChangeClassicDocument;
  'mutation changeLocale($locale: String!) {\n  changeLocale(locale: $locale) {\n    ok\n  }\n}': typeof types.ChangeLocaleDocument;
  'mutation changePassword($oldPassword: String!, $newPassword: String!) {\n  changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n    ok\n  }\n}': typeof types.ChangePasswordDocument;
  'mutation changeProfilePicture($picture: String!) {\n  changeProfilePicture(picture: $picture) {\n    user {\n      id\n      profilePicture\n    }\n  }\n}': typeof types.ChangeProfilePictureDocument;
  'mutation copyCustomSet($customSetId: UUID!) {\n  copyCustomSet(customSetId: $customSetId) {\n    customSet {\n      ...customSet\n    }\n  }\n}': typeof types.CopyCustomSetDocument;
  'mutation createCustomSet {\n  createCustomSet {\n    customSet {\n      ...customSet\n    }\n  }\n}': typeof types.CreateCustomSetDocument;
  'mutation deleteCustomSet($customSetId: UUID!) {\n  deleteCustomSet(customSetId: $customSetId) {\n    ok\n  }\n}': typeof types.DeleteCustomSetDocument;
  'mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n  deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n    customSet {\n      id\n      lastModified\n      equippedItems {\n        id\n      }\n    }\n  }\n}': typeof types.DeleteCustomSetItemDocument;
  'mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n  editBuildSettings(gender: $gender, buildDefaultClassId: $buildDefaultClassId) {\n    userSetting {\n      id\n      buildGender\n      buildClass {\n        id\n        name\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n      }\n    }\n  }\n}': typeof types.EditBuildSettingsDocument;
  'mutation editCustomSetDefaultClass($customSetId: UUID, $defaultClassId: UUID, $buildGender: BuildGender!) {\n  editCustomSetDefaultClass(\n    customSetId: $customSetId\n    defaultClassId: $defaultClassId\n    buildGender: $buildGender\n  ) {\n    customSet {\n      id\n      lastModified\n      defaultClass {\n        id\n        name\n        enName\n        femaleFaceImageUrl\n        maleFaceImageUrl\n        femaleSpriteImageUrl\n        maleSpriteImageUrl\n      }\n      buildGender\n    }\n  }\n}': typeof types.EditCustomSetDefaultClassDocument;
  'mutation editCustomSetMetadata($customSetId: UUID, $name: String, $level: Int!) {\n  editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n    customSet {\n      id\n      name\n      level\n      lastModified\n    }\n  }\n}': typeof types.EditCustomSetMetadataDocument;
  'mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n  editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n    customSet {\n      id\n      lastModified\n      stats {\n        id\n        baseVitality\n        baseWisdom\n        baseStrength\n        baseIntelligence\n        baseChance\n        baseAgility\n        scrolledVitality\n        scrolledWisdom\n        scrolledStrength\n        scrolledIntelligence\n        scrolledChance\n        scrolledAgility\n      }\n    }\n  }\n}': typeof types.EditCustomSetStatsDocument;
  'mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n  equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n    customSet {\n      ...customSet\n    }\n  }\n}': typeof types.EquipItemsDocument;
  'mutation equipSet($customSetId: UUID, $setId: UUID!) {\n  equipSet(customSetId: $customSetId, setId: $setId) {\n    customSet {\n      ...customSet\n    }\n  }\n}': typeof types.EquipSetDocument;
  'mutation login($email: String!, $password: String!, $remember: Boolean!) {\n  loginUser(email: $email, password: $password, remember: $remember) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}': typeof types.LoginDocument;
  'mutation logout {\n  logoutUser {\n    ok\n  }\n}': typeof types.LogoutDocument;
  'mutation mageEquippedItem($stats: [CustomSetExosInput!]!, $equippedItemId: UUID!, $weaponElementMage: WeaponElementMage) {\n  mageEquippedItem(\n    equippedItemId: $equippedItemId\n    stats: $stats\n    weaponElementMage: $weaponElementMage\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n  }\n}': typeof types.MageEquippedItemDocument;
  'mutation register($email: String!, $password: String!, $username: String!, $gender: BuildGender!, $buildDefaultClassId: UUID) {\n  registerUser(\n    email: $email\n    password: $password\n    username: $username\n    gender: $gender\n    buildDefaultClassId: $buildDefaultClassId\n  ) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}': typeof types.RegisterDocument;
  'mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  removeTagFromCustomSet(\n    customSetId: $customSetId\n    customSetTagId: $customSetTagId\n  ) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}': typeof types.RemoveTagFromCustomSetDocument;
  'mutation requestPasswordReset($email: String!) {\n  requestPasswordReset(email: $email) {\n    ok\n  }\n}': typeof types.RequestPasswordResetDocument;
  'mutation resendVerificationEmail {\n  resendVerificationEmail {\n    ok\n  }\n}': typeof types.ResendVerificationEmailDocument;
  'mutation resetPassword($token: String!, $password: String!) {\n  resetPassword(token: $token, password: $password) {\n    ok\n  }\n}': typeof types.ResetPasswordDocument;
  'mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n  restartCustomSet(customSetId: $customSetId, shouldResetStats: $shouldResetStats) {\n    customSet {\n      ...customSet\n    }\n  }\n}': typeof types.RestartCustomSetDocument;
  'mutation setEquippedItemExo($stat: Stat!, $equippedItemId: UUID!, $hasStat: Boolean!) {\n  setEquippedItemExo(\n    stat: $stat\n    equippedItemId: $equippedItemId\n    hasStat: $hasStat\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n    }\n  }\n}': typeof types.SetEquippedItemExoDocument;
  'mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n  toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n    }\n  }\n}': typeof types.ToggleFavoriteItemDocument;
  'mutation updateCustomSetItem($itemSlotId: UUID!, $customSetId: UUID, $itemId: UUID) {\n  updateCustomSetItem(\n    itemSlotId: $itemSlotId\n    customSetId: $customSetId\n    itemId: $itemId\n  ) {\n    customSet {\n      id\n      equippedItems {\n        id\n        slot {\n          id\n          name\n          order\n        }\n        item {\n          ...item\n        }\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n}': typeof types.UpdateCustomSetItemDocument;
  'query buildList($username: String!, $first: Int!, $after: String, $filters: CustomSetFilters!) {\n  userByName(username: $username) {\n    id\n    username\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}': typeof types.BuildListDocument;
  'query classBuffs($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        spellStats {\n          id\n          level\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}': typeof types.ClassBuffsDocument;
  'query classById($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        isTrap\n        spellStats {\n          id\n          level\n          apCost\n          castsPerTurn\n          castsPerTarget\n          cooldown\n          isLinear\n          needsLos\n          needsFreeCell\n          baseCritChance\n          minRange\n          maxRange\n          hasModifiableRange\n          spellEffects {\n            id\n            minDamage\n            maxDamage\n            critMinDamage\n            critMaxDamage\n            effectType\n            condition\n          }\n          spellDamageIncrease {\n            id\n            baseIncrease\n            critBaseIncrease\n            maxStacks\n          }\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}': typeof types.ClassByIdDocument;
  'query classes {\n  classes {\n    id\n    name\n    enName\n    allNames\n    maleFaceImageUrl\n    femaleFaceImageUrl\n    maleSpriteImageUrl\n    femaleSpriteImageUrl\n  }\n}': typeof types.ClassesDocument;
  'query currentUser {\n  currentUser {\n    id\n    username\n    email\n    verified\n    favoriteItems {\n      ...item\n    }\n    settings {\n      id\n      buildGender\n      buildClass {\n        id\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n        name\n      }\n    }\n  }\n}': typeof types.CurrentUserDocument;
  'query customSet($id: UUID!) {\n  customSetById(id: $id) {\n    ...customSet\n    stats {\n      ...baseStats\n    }\n  }\n}': typeof types.CustomSetDocument;
  'query customSetTags {\n  customSetTags {\n    id\n    name\n    imageUrl\n  }\n}': typeof types.CustomSetTagsDocument;
  'query itemSlots {\n  itemSlots {\n    id\n    enName\n    name\n    order\n    itemTypes {\n      id\n      name\n    }\n    imageUrl\n  }\n}': typeof types.ItemSlotsDocument;
  'query items($first: Int!, $after: String, $filters: ItemFilters!, $equippedItemIds: [UUID!]!, $eligibleItemTypeIds: [UUID!], $level: Int!) {\n  items(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...item\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  itemSuggestions(\n    eligibleItemTypeIds: $eligibleItemTypeIds\n    equippedItemIds: $equippedItemIds\n    level: $level\n  ) {\n    ...item\n  }\n}': typeof types.ItemsDocument;
  'query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n  currentUser {\n    id\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}': typeof types.MyCustomSetsDocument;
  'query sessionSettings {\n  locale\n  classic\n}': typeof types.SessionSettingsDocument;
  'query set($id: UUID!) {\n  setById(id: $id) {\n    ...set\n    items {\n      ...item\n    }\n  }\n}': typeof types.SetDocument;
  'query sets($first: Int!, $after: String, $filters: SetFilters!) {\n  sets(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...set\n        items {\n          ...item\n        }\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}': typeof types.SetsDocument;
  'query userProfile($username: String!) {\n  userByName(username: $username) {\n    id\n    username\n    profilePicture\n    creationDate\n    customSets(filters: {search: "", tagIds: []}) {\n      totalCount\n    }\n  }\n}': typeof types.UserProfileDocument;
};
const documents: Documents = {
  'fragment abbreviatedCustomSet on CustomSet {\n  id\n  buildGender\n  defaultClass {\n    id\n    name\n    maleFaceImageUrl\n    femaleFaceImageUrl\n  }\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      order\n    }\n    item {\n      id\n      imageUrl\n    }\n  }\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n}':
    types.AbbreviatedCustomSetFragmentDoc,
  'fragment baseStats on CustomSetStats {\n  id\n  baseVitality\n  baseWisdom\n  baseStrength\n  baseIntelligence\n  baseChance\n  baseAgility\n  scrolledVitality\n  scrolledWisdom\n  scrolledStrength\n  scrolledIntelligence\n  scrolledChance\n  scrolledAgility\n}':
    types.BaseStatsFragmentDoc,
  'fragment buff on Buff {\n  id\n  stat\n  incrementBy\n  critIncrementBy\n  maxStacks\n}':
    types.BuffFragmentDoc,
  'fragment customSet on CustomSet {\n  id\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      enName\n      name\n      order\n    }\n    item {\n      ...item\n    }\n    exos {\n      id\n      stat\n      value\n    }\n    weaponElementMage\n  }\n  stats {\n    ...baseStats\n  }\n  owner {\n    id\n    username\n  }\n  defaultClass {\n    id\n    name\n    enName\n    femaleFaceImageUrl\n    maleFaceImageUrl\n    femaleSpriteImageUrl\n    maleSpriteImageUrl\n  }\n  creationDate\n  lastModified\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n  hasEditPermission\n  buildGender\n}':
    types.CustomSetFragmentDoc,
  'fragment item on Item {\n  id\n  name\n  level\n  imageUrl\n  stats {\n    id\n    order\n    maxValue\n    stat\n    customStat\n  }\n  weaponStats {\n    id\n    apCost\n    usesPerTurn\n    minRange\n    maxRange\n    baseCritChance\n    critBonusDamage\n    weaponEffects {\n      id\n      minDamage\n      maxDamage\n      effectType\n    }\n  }\n  conditions\n  itemType {\n    id\n    name\n    enName\n    eligibleItemSlots {\n      id\n      enName\n      order\n    }\n  }\n  set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n  buffs {\n    ...buff\n  }\n}':
    types.ItemFragmentDoc,
  'fragment set on Set {\n  id\n  name\n  bonuses {\n    id\n    numItems\n    stat\n    value\n    customStat\n  }\n}':
    types.SetFragmentDoc,
  'mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  addTagToCustomSet(customSetId: $customSetId, customSetTagId: $customSetTagId) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}':
    types.AddTagToCustomSetDocument,
  'mutation changeClassic($classic: Boolean!) {\n  changeClassic(classic: $classic) {\n    ok\n  }\n}':
    types.ChangeClassicDocument,
  'mutation changeLocale($locale: String!) {\n  changeLocale(locale: $locale) {\n    ok\n  }\n}':
    types.ChangeLocaleDocument,
  'mutation changePassword($oldPassword: String!, $newPassword: String!) {\n  changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n    ok\n  }\n}':
    types.ChangePasswordDocument,
  'mutation changeProfilePicture($picture: String!) {\n  changeProfilePicture(picture: $picture) {\n    user {\n      id\n      profilePicture\n    }\n  }\n}':
    types.ChangeProfilePictureDocument,
  'mutation copyCustomSet($customSetId: UUID!) {\n  copyCustomSet(customSetId: $customSetId) {\n    customSet {\n      ...customSet\n    }\n  }\n}':
    types.CopyCustomSetDocument,
  'mutation createCustomSet {\n  createCustomSet {\n    customSet {\n      ...customSet\n    }\n  }\n}':
    types.CreateCustomSetDocument,
  'mutation deleteCustomSet($customSetId: UUID!) {\n  deleteCustomSet(customSetId: $customSetId) {\n    ok\n  }\n}':
    types.DeleteCustomSetDocument,
  'mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n  deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n    customSet {\n      id\n      lastModified\n      equippedItems {\n        id\n      }\n    }\n  }\n}':
    types.DeleteCustomSetItemDocument,
  'mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n  editBuildSettings(gender: $gender, buildDefaultClassId: $buildDefaultClassId) {\n    userSetting {\n      id\n      buildGender\n      buildClass {\n        id\n        name\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n      }\n    }\n  }\n}':
    types.EditBuildSettingsDocument,
  'mutation editCustomSetDefaultClass($customSetId: UUID, $defaultClassId: UUID, $buildGender: BuildGender!) {\n  editCustomSetDefaultClass(\n    customSetId: $customSetId\n    defaultClassId: $defaultClassId\n    buildGender: $buildGender\n  ) {\n    customSet {\n      id\n      lastModified\n      defaultClass {\n        id\n        name\n        enName\n        femaleFaceImageUrl\n        maleFaceImageUrl\n        femaleSpriteImageUrl\n        maleSpriteImageUrl\n      }\n      buildGender\n    }\n  }\n}':
    types.EditCustomSetDefaultClassDocument,
  'mutation editCustomSetMetadata($customSetId: UUID, $name: String, $level: Int!) {\n  editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n    customSet {\n      id\n      name\n      level\n      lastModified\n    }\n  }\n}':
    types.EditCustomSetMetadataDocument,
  'mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n  editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n    customSet {\n      id\n      lastModified\n      stats {\n        id\n        baseVitality\n        baseWisdom\n        baseStrength\n        baseIntelligence\n        baseChance\n        baseAgility\n        scrolledVitality\n        scrolledWisdom\n        scrolledStrength\n        scrolledIntelligence\n        scrolledChance\n        scrolledAgility\n      }\n    }\n  }\n}':
    types.EditCustomSetStatsDocument,
  'mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n  equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n    customSet {\n      ...customSet\n    }\n  }\n}':
    types.EquipItemsDocument,
  'mutation equipSet($customSetId: UUID, $setId: UUID!) {\n  equipSet(customSetId: $customSetId, setId: $setId) {\n    customSet {\n      ...customSet\n    }\n  }\n}':
    types.EquipSetDocument,
  'mutation login($email: String!, $password: String!, $remember: Boolean!) {\n  loginUser(email: $email, password: $password, remember: $remember) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}':
    types.LoginDocument,
  'mutation logout {\n  logoutUser {\n    ok\n  }\n}': types.LogoutDocument,
  'mutation mageEquippedItem($stats: [CustomSetExosInput!]!, $equippedItemId: UUID!, $weaponElementMage: WeaponElementMage) {\n  mageEquippedItem(\n    equippedItemId: $equippedItemId\n    stats: $stats\n    weaponElementMage: $weaponElementMage\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n  }\n}':
    types.MageEquippedItemDocument,
  'mutation register($email: String!, $password: String!, $username: String!, $gender: BuildGender!, $buildDefaultClassId: UUID) {\n  registerUser(\n    email: $email\n    password: $password\n    username: $username\n    gender: $gender\n    buildDefaultClassId: $buildDefaultClassId\n  ) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}':
    types.RegisterDocument,
  'mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  removeTagFromCustomSet(\n    customSetId: $customSetId\n    customSetTagId: $customSetTagId\n  ) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}':
    types.RemoveTagFromCustomSetDocument,
  'mutation requestPasswordReset($email: String!) {\n  requestPasswordReset(email: $email) {\n    ok\n  }\n}':
    types.RequestPasswordResetDocument,
  'mutation resendVerificationEmail {\n  resendVerificationEmail {\n    ok\n  }\n}':
    types.ResendVerificationEmailDocument,
  'mutation resetPassword($token: String!, $password: String!) {\n  resetPassword(token: $token, password: $password) {\n    ok\n  }\n}':
    types.ResetPasswordDocument,
  'mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n  restartCustomSet(customSetId: $customSetId, shouldResetStats: $shouldResetStats) {\n    customSet {\n      ...customSet\n    }\n  }\n}':
    types.RestartCustomSetDocument,
  'mutation setEquippedItemExo($stat: Stat!, $equippedItemId: UUID!, $hasStat: Boolean!) {\n  setEquippedItemExo(\n    stat: $stat\n    equippedItemId: $equippedItemId\n    hasStat: $hasStat\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n    }\n  }\n}':
    types.SetEquippedItemExoDocument,
  'mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n  toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n    }\n  }\n}':
    types.ToggleFavoriteItemDocument,
  'mutation updateCustomSetItem($itemSlotId: UUID!, $customSetId: UUID, $itemId: UUID) {\n  updateCustomSetItem(\n    itemSlotId: $itemSlotId\n    customSetId: $customSetId\n    itemId: $itemId\n  ) {\n    customSet {\n      id\n      equippedItems {\n        id\n        slot {\n          id\n          name\n          order\n        }\n        item {\n          ...item\n        }\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n}':
    types.UpdateCustomSetItemDocument,
  'query buildList($username: String!, $first: Int!, $after: String, $filters: CustomSetFilters!) {\n  userByName(username: $username) {\n    id\n    username\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}':
    types.BuildListDocument,
  'query classBuffs($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        spellStats {\n          id\n          level\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}':
    types.ClassBuffsDocument,
  'query classById($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        isTrap\n        spellStats {\n          id\n          level\n          apCost\n          castsPerTurn\n          castsPerTarget\n          cooldown\n          isLinear\n          needsLos\n          needsFreeCell\n          baseCritChance\n          minRange\n          maxRange\n          hasModifiableRange\n          spellEffects {\n            id\n            minDamage\n            maxDamage\n            critMinDamage\n            critMaxDamage\n            effectType\n            condition\n          }\n          spellDamageIncrease {\n            id\n            baseIncrease\n            critBaseIncrease\n            maxStacks\n          }\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}':
    types.ClassByIdDocument,
  'query classes {\n  classes {\n    id\n    name\n    enName\n    allNames\n    maleFaceImageUrl\n    femaleFaceImageUrl\n    maleSpriteImageUrl\n    femaleSpriteImageUrl\n  }\n}':
    types.ClassesDocument,
  'query currentUser {\n  currentUser {\n    id\n    username\n    email\n    verified\n    favoriteItems {\n      ...item\n    }\n    settings {\n      id\n      buildGender\n      buildClass {\n        id\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n        name\n      }\n    }\n  }\n}':
    types.CurrentUserDocument,
  'query customSet($id: UUID!) {\n  customSetById(id: $id) {\n    ...customSet\n    stats {\n      ...baseStats\n    }\n  }\n}':
    types.CustomSetDocument,
  'query customSetTags {\n  customSetTags {\n    id\n    name\n    imageUrl\n  }\n}':
    types.CustomSetTagsDocument,
  'query itemSlots {\n  itemSlots {\n    id\n    enName\n    name\n    order\n    itemTypes {\n      id\n      name\n    }\n    imageUrl\n  }\n}':
    types.ItemSlotsDocument,
  'query items($first: Int!, $after: String, $filters: ItemFilters!, $equippedItemIds: [UUID!]!, $eligibleItemTypeIds: [UUID!], $level: Int!) {\n  items(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...item\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  itemSuggestions(\n    eligibleItemTypeIds: $eligibleItemTypeIds\n    equippedItemIds: $equippedItemIds\n    level: $level\n  ) {\n    ...item\n  }\n}':
    types.ItemsDocument,
  'query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n  currentUser {\n    id\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}':
    types.MyCustomSetsDocument,
  'query sessionSettings {\n  locale\n  classic\n}':
    types.SessionSettingsDocument,
  'query set($id: UUID!) {\n  setById(id: $id) {\n    ...set\n    items {\n      ...item\n    }\n  }\n}':
    types.SetDocument,
  'query sets($first: Int!, $after: String, $filters: SetFilters!) {\n  sets(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...set\n        items {\n          ...item\n        }\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}':
    types.SetsDocument,
  'query userProfile($username: String!) {\n  userByName(username: $username) {\n    id\n    username\n    profilePicture\n    creationDate\n    customSets(filters: {search: "", tagIds: []}) {\n      totalCount\n    }\n  }\n}':
    types.UserProfileDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'fragment abbreviatedCustomSet on CustomSet {\n  id\n  buildGender\n  defaultClass {\n    id\n    name\n    maleFaceImageUrl\n    femaleFaceImageUrl\n  }\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      order\n    }\n    item {\n      id\n      imageUrl\n    }\n  }\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n}',
): typeof documents['fragment abbreviatedCustomSet on CustomSet {\n  id\n  buildGender\n  defaultClass {\n    id\n    name\n    maleFaceImageUrl\n    femaleFaceImageUrl\n  }\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      order\n    }\n    item {\n      id\n      imageUrl\n    }\n  }\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'fragment baseStats on CustomSetStats {\n  id\n  baseVitality\n  baseWisdom\n  baseStrength\n  baseIntelligence\n  baseChance\n  baseAgility\n  scrolledVitality\n  scrolledWisdom\n  scrolledStrength\n  scrolledIntelligence\n  scrolledChance\n  scrolledAgility\n}',
): typeof documents['fragment baseStats on CustomSetStats {\n  id\n  baseVitality\n  baseWisdom\n  baseStrength\n  baseIntelligence\n  baseChance\n  baseAgility\n  scrolledVitality\n  scrolledWisdom\n  scrolledStrength\n  scrolledIntelligence\n  scrolledChance\n  scrolledAgility\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'fragment buff on Buff {\n  id\n  stat\n  incrementBy\n  critIncrementBy\n  maxStacks\n}',
): typeof documents['fragment buff on Buff {\n  id\n  stat\n  incrementBy\n  critIncrementBy\n  maxStacks\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'fragment customSet on CustomSet {\n  id\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      enName\n      name\n      order\n    }\n    item {\n      ...item\n    }\n    exos {\n      id\n      stat\n      value\n    }\n    weaponElementMage\n  }\n  stats {\n    ...baseStats\n  }\n  owner {\n    id\n    username\n  }\n  defaultClass {\n    id\n    name\n    enName\n    femaleFaceImageUrl\n    maleFaceImageUrl\n    femaleSpriteImageUrl\n    maleSpriteImageUrl\n  }\n  creationDate\n  lastModified\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n  hasEditPermission\n  buildGender\n}',
): typeof documents['fragment customSet on CustomSet {\n  id\n  name\n  level\n  equippedItems {\n    id\n    slot {\n      id\n      enName\n      name\n      order\n    }\n    item {\n      ...item\n    }\n    exos {\n      id\n      stat\n      value\n    }\n    weaponElementMage\n  }\n  stats {\n    ...baseStats\n  }\n  owner {\n    id\n    username\n  }\n  defaultClass {\n    id\n    name\n    enName\n    femaleFaceImageUrl\n    maleFaceImageUrl\n    femaleSpriteImageUrl\n    maleSpriteImageUrl\n  }\n  creationDate\n  lastModified\n  tagAssociations {\n    id\n    associationDate\n    customSetTag {\n      id\n      name\n      imageUrl\n    }\n  }\n  hasEditPermission\n  buildGender\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'fragment item on Item {\n  id\n  name\n  level\n  imageUrl\n  stats {\n    id\n    order\n    maxValue\n    stat\n    customStat\n  }\n  weaponStats {\n    id\n    apCost\n    usesPerTurn\n    minRange\n    maxRange\n    baseCritChance\n    critBonusDamage\n    weaponEffects {\n      id\n      minDamage\n      maxDamage\n      effectType\n    }\n  }\n  conditions\n  itemType {\n    id\n    name\n    enName\n    eligibleItemSlots {\n      id\n      enName\n      order\n    }\n  }\n  set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n  buffs {\n    ...buff\n  }\n}',
): typeof documents['fragment item on Item {\n  id\n  name\n  level\n  imageUrl\n  stats {\n    id\n    order\n    maxValue\n    stat\n    customStat\n  }\n  weaponStats {\n    id\n    apCost\n    usesPerTurn\n    minRange\n    maxRange\n    baseCritChance\n    critBonusDamage\n    weaponEffects {\n      id\n      minDamage\n      maxDamage\n      effectType\n    }\n  }\n  conditions\n  itemType {\n    id\n    name\n    enName\n    eligibleItemSlots {\n      id\n      enName\n      order\n    }\n  }\n  set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n  buffs {\n    ...buff\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'fragment set on Set {\n  id\n  name\n  bonuses {\n    id\n    numItems\n    stat\n    value\n    customStat\n  }\n}',
): typeof documents['fragment set on Set {\n  id\n  name\n  bonuses {\n    id\n    numItems\n    stat\n    value\n    customStat\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  addTagToCustomSet(customSetId: $customSetId, customSetTagId: $customSetTagId) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}',
): typeof documents['mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  addTagToCustomSet(customSetId: $customSetId, customSetTagId: $customSetTagId) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation changeClassic($classic: Boolean!) {\n  changeClassic(classic: $classic) {\n    ok\n  }\n}',
): typeof documents['mutation changeClassic($classic: Boolean!) {\n  changeClassic(classic: $classic) {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation changeLocale($locale: String!) {\n  changeLocale(locale: $locale) {\n    ok\n  }\n}',
): typeof documents['mutation changeLocale($locale: String!) {\n  changeLocale(locale: $locale) {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation changePassword($oldPassword: String!, $newPassword: String!) {\n  changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n    ok\n  }\n}',
): typeof documents['mutation changePassword($oldPassword: String!, $newPassword: String!) {\n  changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation changeProfilePicture($picture: String!) {\n  changeProfilePicture(picture: $picture) {\n    user {\n      id\n      profilePicture\n    }\n  }\n}',
): typeof documents['mutation changeProfilePicture($picture: String!) {\n  changeProfilePicture(picture: $picture) {\n    user {\n      id\n      profilePicture\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation copyCustomSet($customSetId: UUID!) {\n  copyCustomSet(customSetId: $customSetId) {\n    customSet {\n      ...customSet\n    }\n  }\n}',
): typeof documents['mutation copyCustomSet($customSetId: UUID!) {\n  copyCustomSet(customSetId: $customSetId) {\n    customSet {\n      ...customSet\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation createCustomSet {\n  createCustomSet {\n    customSet {\n      ...customSet\n    }\n  }\n}',
): typeof documents['mutation createCustomSet {\n  createCustomSet {\n    customSet {\n      ...customSet\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation deleteCustomSet($customSetId: UUID!) {\n  deleteCustomSet(customSetId: $customSetId) {\n    ok\n  }\n}',
): typeof documents['mutation deleteCustomSet($customSetId: UUID!) {\n  deleteCustomSet(customSetId: $customSetId) {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n  deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n    customSet {\n      id\n      lastModified\n      equippedItems {\n        id\n      }\n    }\n  }\n}',
): typeof documents['mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n  deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n    customSet {\n      id\n      lastModified\n      equippedItems {\n        id\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n  editBuildSettings(gender: $gender, buildDefaultClassId: $buildDefaultClassId) {\n    userSetting {\n      id\n      buildGender\n      buildClass {\n        id\n        name\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n      }\n    }\n  }\n}',
): typeof documents['mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n  editBuildSettings(gender: $gender, buildDefaultClassId: $buildDefaultClassId) {\n    userSetting {\n      id\n      buildGender\n      buildClass {\n        id\n        name\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation editCustomSetDefaultClass($customSetId: UUID, $defaultClassId: UUID, $buildGender: BuildGender!) {\n  editCustomSetDefaultClass(\n    customSetId: $customSetId\n    defaultClassId: $defaultClassId\n    buildGender: $buildGender\n  ) {\n    customSet {\n      id\n      lastModified\n      defaultClass {\n        id\n        name\n        enName\n        femaleFaceImageUrl\n        maleFaceImageUrl\n        femaleSpriteImageUrl\n        maleSpriteImageUrl\n      }\n      buildGender\n    }\n  }\n}',
): typeof documents['mutation editCustomSetDefaultClass($customSetId: UUID, $defaultClassId: UUID, $buildGender: BuildGender!) {\n  editCustomSetDefaultClass(\n    customSetId: $customSetId\n    defaultClassId: $defaultClassId\n    buildGender: $buildGender\n  ) {\n    customSet {\n      id\n      lastModified\n      defaultClass {\n        id\n        name\n        enName\n        femaleFaceImageUrl\n        maleFaceImageUrl\n        femaleSpriteImageUrl\n        maleSpriteImageUrl\n      }\n      buildGender\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation editCustomSetMetadata($customSetId: UUID, $name: String, $level: Int!) {\n  editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n    customSet {\n      id\n      name\n      level\n      lastModified\n    }\n  }\n}',
): typeof documents['mutation editCustomSetMetadata($customSetId: UUID, $name: String, $level: Int!) {\n  editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n    customSet {\n      id\n      name\n      level\n      lastModified\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n  editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n    customSet {\n      id\n      lastModified\n      stats {\n        id\n        baseVitality\n        baseWisdom\n        baseStrength\n        baseIntelligence\n        baseChance\n        baseAgility\n        scrolledVitality\n        scrolledWisdom\n        scrolledStrength\n        scrolledIntelligence\n        scrolledChance\n        scrolledAgility\n      }\n    }\n  }\n}',
): typeof documents['mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n  editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n    customSet {\n      id\n      lastModified\n      stats {\n        id\n        baseVitality\n        baseWisdom\n        baseStrength\n        baseIntelligence\n        baseChance\n        baseAgility\n        scrolledVitality\n        scrolledWisdom\n        scrolledStrength\n        scrolledIntelligence\n        scrolledChance\n        scrolledAgility\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n  equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n    customSet {\n      ...customSet\n    }\n  }\n}',
): typeof documents['mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n  equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n    customSet {\n      ...customSet\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation equipSet($customSetId: UUID, $setId: UUID!) {\n  equipSet(customSetId: $customSetId, setId: $setId) {\n    customSet {\n      ...customSet\n    }\n  }\n}',
): typeof documents['mutation equipSet($customSetId: UUID, $setId: UUID!) {\n  equipSet(customSetId: $customSetId, setId: $setId) {\n    customSet {\n      ...customSet\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation login($email: String!, $password: String!, $remember: Boolean!) {\n  loginUser(email: $email, password: $password, remember: $remember) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}',
): typeof documents['mutation login($email: String!, $password: String!, $remember: Boolean!) {\n  loginUser(email: $email, password: $password, remember: $remember) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation logout {\n  logoutUser {\n    ok\n  }\n}',
): typeof documents['mutation logout {\n  logoutUser {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation mageEquippedItem($stats: [CustomSetExosInput!]!, $equippedItemId: UUID!, $weaponElementMage: WeaponElementMage) {\n  mageEquippedItem(\n    equippedItemId: $equippedItemId\n    stats: $stats\n    weaponElementMage: $weaponElementMage\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n  }\n}',
): typeof documents['mutation mageEquippedItem($stats: [CustomSetExosInput!]!, $equippedItemId: UUID!, $weaponElementMage: WeaponElementMage) {\n  mageEquippedItem(\n    equippedItemId: $equippedItemId\n    stats: $stats\n    weaponElementMage: $weaponElementMage\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation register($email: String!, $password: String!, $username: String!, $gender: BuildGender!, $buildDefaultClassId: UUID) {\n  registerUser(\n    email: $email\n    password: $password\n    username: $username\n    gender: $gender\n    buildDefaultClassId: $buildDefaultClassId\n  ) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}',
): typeof documents['mutation register($email: String!, $password: String!, $username: String!, $gender: BuildGender!, $buildDefaultClassId: UUID) {\n  registerUser(\n    email: $email\n    password: $password\n    username: $username\n    gender: $gender\n    buildDefaultClassId: $buildDefaultClassId\n  ) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n      username\n      email\n      verified\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  removeTagFromCustomSet(\n    customSetId: $customSetId\n    customSetTagId: $customSetTagId\n  ) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}',
): typeof documents['mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n  removeTagFromCustomSet(\n    customSetId: $customSetId\n    customSetTagId: $customSetTagId\n  ) {\n    customSet {\n      id\n      tagAssociations {\n        id\n        associationDate\n        customSetTag {\n          id\n          name\n          imageUrl\n        }\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation requestPasswordReset($email: String!) {\n  requestPasswordReset(email: $email) {\n    ok\n  }\n}',
): typeof documents['mutation requestPasswordReset($email: String!) {\n  requestPasswordReset(email: $email) {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation resendVerificationEmail {\n  resendVerificationEmail {\n    ok\n  }\n}',
): typeof documents['mutation resendVerificationEmail {\n  resendVerificationEmail {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation resetPassword($token: String!, $password: String!) {\n  resetPassword(token: $token, password: $password) {\n    ok\n  }\n}',
): typeof documents['mutation resetPassword($token: String!, $password: String!) {\n  resetPassword(token: $token, password: $password) {\n    ok\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n  restartCustomSet(customSetId: $customSetId, shouldResetStats: $shouldResetStats) {\n    customSet {\n      ...customSet\n    }\n  }\n}',
): typeof documents['mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n  restartCustomSet(customSetId: $customSetId, shouldResetStats: $shouldResetStats) {\n    customSet {\n      ...customSet\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation setEquippedItemExo($stat: Stat!, $equippedItemId: UUID!, $hasStat: Boolean!) {\n  setEquippedItemExo(\n    stat: $stat\n    equippedItemId: $equippedItemId\n    hasStat: $hasStat\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n    }\n  }\n}',
): typeof documents['mutation setEquippedItemExo($stat: Stat!, $equippedItemId: UUID!, $hasStat: Boolean!) {\n  setEquippedItemExo(\n    stat: $stat\n    equippedItemId: $equippedItemId\n    hasStat: $hasStat\n  ) {\n    equippedItem {\n      id\n      exos {\n        id\n        stat\n        value\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n  toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n    }\n  }\n}',
): typeof documents['mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n  toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n    user {\n      id\n      favoriteItems {\n        ...item\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation updateCustomSetItem($itemSlotId: UUID!, $customSetId: UUID, $itemId: UUID) {\n  updateCustomSetItem(\n    itemSlotId: $itemSlotId\n    customSetId: $customSetId\n    itemId: $itemId\n  ) {\n    customSet {\n      id\n      equippedItems {\n        id\n        slot {\n          id\n          name\n          order\n        }\n        item {\n          ...item\n        }\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n}',
): typeof documents['mutation updateCustomSetItem($itemSlotId: UUID!, $customSetId: UUID, $itemId: UUID) {\n  updateCustomSetItem(\n    itemSlotId: $itemSlotId\n    customSetId: $customSetId\n    itemId: $itemId\n  ) {\n    customSet {\n      id\n      equippedItems {\n        id\n        slot {\n          id\n          name\n          order\n        }\n        item {\n          ...item\n        }\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query buildList($username: String!, $first: Int!, $after: String, $filters: CustomSetFilters!) {\n  userByName(username: $username) {\n    id\n    username\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}',
): typeof documents['query buildList($username: String!, $first: Int!, $after: String, $filters: CustomSetFilters!) {\n  userByName(username: $username) {\n    id\n    username\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query classBuffs($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        spellStats {\n          id\n          level\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}',
): typeof documents['query classBuffs($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        spellStats {\n          id\n          level\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query classById($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        isTrap\n        spellStats {\n          id\n          level\n          apCost\n          castsPerTurn\n          castsPerTarget\n          cooldown\n          isLinear\n          needsLos\n          needsFreeCell\n          baseCritChance\n          minRange\n          maxRange\n          hasModifiableRange\n          spellEffects {\n            id\n            minDamage\n            maxDamage\n            critMinDamage\n            critMaxDamage\n            effectType\n            condition\n          }\n          spellDamageIncrease {\n            id\n            baseIncrease\n            critBaseIncrease\n            maxStacks\n          }\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}',
): typeof documents['query classById($id: UUID!) {\n  classById(id: $id) {\n    id\n    name\n    spellVariantPairs {\n      id\n      spells {\n        id\n        name\n        description\n        imageUrl\n        isTrap\n        spellStats {\n          id\n          level\n          apCost\n          castsPerTurn\n          castsPerTarget\n          cooldown\n          isLinear\n          needsLos\n          needsFreeCell\n          baseCritChance\n          minRange\n          maxRange\n          hasModifiableRange\n          spellEffects {\n            id\n            minDamage\n            maxDamage\n            critMinDamage\n            critMaxDamage\n            effectType\n            condition\n          }\n          spellDamageIncrease {\n            id\n            baseIncrease\n            critBaseIncrease\n            maxStacks\n          }\n          buffs {\n            ...buff\n          }\n        }\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query classes {\n  classes {\n    id\n    name\n    enName\n    allNames\n    maleFaceImageUrl\n    femaleFaceImageUrl\n    maleSpriteImageUrl\n    femaleSpriteImageUrl\n  }\n}',
): typeof documents['query classes {\n  classes {\n    id\n    name\n    enName\n    allNames\n    maleFaceImageUrl\n    femaleFaceImageUrl\n    maleSpriteImageUrl\n    femaleSpriteImageUrl\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query currentUser {\n  currentUser {\n    id\n    username\n    email\n    verified\n    favoriteItems {\n      ...item\n    }\n    settings {\n      id\n      buildGender\n      buildClass {\n        id\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n        name\n      }\n    }\n  }\n}',
): typeof documents['query currentUser {\n  currentUser {\n    id\n    username\n    email\n    verified\n    favoriteItems {\n      ...item\n    }\n    settings {\n      id\n      buildGender\n      buildClass {\n        id\n        maleFaceImageUrl\n        femaleFaceImageUrl\n        maleSpriteImageUrl\n        femaleSpriteImageUrl\n        name\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query customSet($id: UUID!) {\n  customSetById(id: $id) {\n    ...customSet\n    stats {\n      ...baseStats\n    }\n  }\n}',
): typeof documents['query customSet($id: UUID!) {\n  customSetById(id: $id) {\n    ...customSet\n    stats {\n      ...baseStats\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query customSetTags {\n  customSetTags {\n    id\n    name\n    imageUrl\n  }\n}',
): typeof documents['query customSetTags {\n  customSetTags {\n    id\n    name\n    imageUrl\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query itemSlots {\n  itemSlots {\n    id\n    enName\n    name\n    order\n    itemTypes {\n      id\n      name\n    }\n    imageUrl\n  }\n}',
): typeof documents['query itemSlots {\n  itemSlots {\n    id\n    enName\n    name\n    order\n    itemTypes {\n      id\n      name\n    }\n    imageUrl\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query items($first: Int!, $after: String, $filters: ItemFilters!, $equippedItemIds: [UUID!]!, $eligibleItemTypeIds: [UUID!], $level: Int!) {\n  items(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...item\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  itemSuggestions(\n    eligibleItemTypeIds: $eligibleItemTypeIds\n    equippedItemIds: $equippedItemIds\n    level: $level\n  ) {\n    ...item\n  }\n}',
): typeof documents['query items($first: Int!, $after: String, $filters: ItemFilters!, $equippedItemIds: [UUID!]!, $eligibleItemTypeIds: [UUID!], $level: Int!) {\n  items(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...item\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  itemSuggestions(\n    eligibleItemTypeIds: $eligibleItemTypeIds\n    equippedItemIds: $equippedItemIds\n    level: $level\n  ) {\n    ...item\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n  currentUser {\n    id\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}',
): typeof documents['query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n  currentUser {\n    id\n    customSets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...abbreviatedCustomSet\n        }\n      }\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query sessionSettings {\n  locale\n  classic\n}',
): typeof documents['query sessionSettings {\n  locale\n  classic\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query set($id: UUID!) {\n  setById(id: $id) {\n    ...set\n    items {\n      ...item\n    }\n  }\n}',
): typeof documents['query set($id: UUID!) {\n  setById(id: $id) {\n    ...set\n    items {\n      ...item\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query sets($first: Int!, $after: String, $filters: SetFilters!) {\n  sets(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...set\n        items {\n          ...item\n        }\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}',
): typeof documents['query sets($first: Int!, $after: String, $filters: SetFilters!) {\n  sets(first: $first, after: $after, filters: $filters) {\n    edges {\n      node {\n        ...set\n        items {\n          ...item\n        }\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'query userProfile($username: String!) {\n  userByName(username: $username) {\n    id\n    username\n    profilePicture\n    creationDate\n    customSets(filters: {search: "", tagIds: []}) {\n      totalCount\n    }\n  }\n}',
): typeof documents['query userProfile($username: String!) {\n  userByName(username: $username) {\n    id\n    username\n    profilePicture\n    creationDate\n    customSets(filters: {search: "", tagIds: []}) {\n      totalCount\n    }\n  }\n}'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
