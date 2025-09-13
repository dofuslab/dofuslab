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
  '\n  fragment abbreviatedCustomSet on CustomSet {\n    id\n    buildGender\n    defaultClass {\n      id\n      name\n      maleFaceImageUrl\n      femaleFaceImageUrl\n    }\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        order\n      }\n      item {\n        id\n        imageUrl\n      }\n    }\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n  }\n': typeof types.AbbreviatedCustomSetFragmentDoc;
  '\n  fragment baseStats on CustomSetStats {\n    id\n    baseVitality\n    baseWisdom\n    baseStrength\n    baseIntelligence\n    baseChance\n    baseAgility\n    scrolledVitality\n    scrolledWisdom\n    scrolledStrength\n    scrolledIntelligence\n    scrolledChance\n    scrolledAgility\n  }\n': typeof types.BaseStatsFragmentDoc;
  '\n  fragment buff on Buff {\n    id\n    stat\n    incrementBy\n    critIncrementBy\n    maxStacks\n  }\n': typeof types.BuffFragmentDoc;
  '\n  fragment customSet on CustomSet {\n    id\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        enName\n        name\n        order\n      }\n      item {\n        ...item\n      }\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n    stats {\n      ...baseStats\n    }\n    owner {\n      id\n      username\n    }\n    defaultClass {\n      id\n      name\n      enName\n      femaleFaceImageUrl\n      maleFaceImageUrl\n      femaleSpriteImageUrl\n      maleSpriteImageUrl\n    }\n    creationDate\n    lastModified\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n    hasEditPermission\n    buildGender\n  }\n': typeof types.CustomSetFragmentDoc;
  '\n  fragment item on Item {\n    id\n    name\n    level\n    imageUrl\n    stats {\n      id\n      order\n      maxValue\n      stat\n      customStat\n    }\n    weaponStats {\n      id\n      apCost\n      usesPerTurn\n      minRange\n      maxRange\n      baseCritChance\n      critBonusDamage\n      weaponEffects {\n        id\n        minDamage\n        maxDamage\n        effectType\n      }\n    }\n    conditions\n    itemType {\n      id\n      name\n      enName\n      eligibleItemSlots {\n        id\n        enName\n        order\n      }\n    }\n    set {\n      id\n      name\n      bonuses {\n        id\n        numItems\n        stat\n        value\n        customStat\n      }\n    }\n    buffs {\n      ...buff\n    }\n  }\n': typeof types.ItemFragmentDoc;
  '\n  fragment set on Set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n': typeof types.SetFragmentDoc;
  '\n  mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    addTagToCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n': typeof types.AddTagToCustomSetDocument;
  '\n  mutation changeClassic($classic: Boolean!) {\n    changeClassic(classic: $classic) {\n      ok\n    }\n  }\n': typeof types.ChangeClassicDocument;
  '\n  mutation changeLocale($locale: String!) {\n    changeLocale(locale: $locale) {\n      ok\n    }\n  }\n': typeof types.ChangeLocaleDocument;
  '\n  mutation changePassword($oldPassword: String!, $newPassword: String!) {\n    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n      ok\n    }\n  }\n': typeof types.ChangePasswordDocument;
  '\n  mutation changeProfilePicture($picture: String!) {\n    changeProfilePicture(picture: $picture) {\n      user {\n        id\n        profilePicture\n      }\n    }\n  }\n': typeof types.ChangeProfilePictureDocument;
  '\n  mutation copyCustomSet($customSetId: UUID!) {\n    copyCustomSet(customSetId: $customSetId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n': typeof types.CopyCustomSetDocument;
  '\n  mutation createCustomSet {\n    createCustomSet {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n': typeof types.CreateCustomSetDocument;
  '\n  mutation deleteCustomSet($customSetId: UUID!) {\n    deleteCustomSet(customSetId: $customSetId) {\n      ok\n    }\n  }\n': typeof types.DeleteCustomSetDocument;
  '\n  mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n    deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n      customSet {\n        id\n        lastModified\n        equippedItems {\n          id\n        }\n      }\n    }\n  }\n': typeof types.DeleteCustomSetItemDocument;
  '\n  mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n    editBuildSettings(\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      userSetting {\n        id\n        buildGender\n        buildClass {\n          id\n          name\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n        }\n      }\n    }\n  }\n': typeof types.EditBuildSettingsDocument;
  '\n  mutation editCustomSetDefaultClass(\n    $customSetId: UUID\n    $defaultClassId: UUID\n    $buildGender: BuildGender!\n  ) {\n    editCustomSetDefaultClass(\n      customSetId: $customSetId\n      defaultClassId: $defaultClassId\n      buildGender: $buildGender\n    ) {\n      customSet {\n        id\n        lastModified\n        defaultClass {\n          id\n          name\n          enName\n          femaleFaceImageUrl\n          maleFaceImageUrl\n          femaleSpriteImageUrl\n          maleSpriteImageUrl\n        }\n        buildGender\n      }\n    }\n  }\n': typeof types.EditCustomSetDefaultClassDocument;
  '\n  mutation editCustomSetMetadata(\n    $customSetId: UUID\n    $name: String\n    $level: Int!\n  ) {\n    editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n      customSet {\n        id\n        name\n        level\n        lastModified\n      }\n    }\n  }\n': typeof types.EditCustomSetMetadataDocument;
  '\n  mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n    editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n      customSet {\n        id\n        lastModified\n        stats {\n          id\n          baseVitality\n          baseWisdom\n          baseStrength\n          baseIntelligence\n          baseChance\n          baseAgility\n          scrolledVitality\n          scrolledWisdom\n          scrolledStrength\n          scrolledIntelligence\n          scrolledChance\n          scrolledAgility\n        }\n      }\n    }\n  }\n': typeof types.EditCustomSetStatsDocument;
  '\n  mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n    equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n': typeof types.EquipItemsDocument;
  '\n  mutation equipSet($customSetId: UUID, $setId: UUID!) {\n    equipSet(customSetId: $customSetId, setId: $setId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n': typeof types.EquipSetDocument;
  '\n  mutation login($email: String!, $password: String!, $remember: Boolean!) {\n    loginUser(email: $email, password: $password, remember: $remember) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n': typeof types.LoginDocument;
  '\n  mutation logout {\n    logoutUser {\n      ok\n    }\n  }\n': typeof types.LogoutDocument;
  '\n  mutation mageEquippedItem(\n    $stats: [CustomSetExosInput!]!\n    $equippedItemId: UUID!\n    $weaponElementMage: WeaponElementMage\n  ) {\n    mageEquippedItem(\n      equippedItemId: $equippedItemId\n      stats: $stats\n      weaponElementMage: $weaponElementMage\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n': typeof types.MageEquippedItemDocument;
  '\n  mutation register(\n    $email: String!\n    $password: String!\n    $username: String!\n    $gender: BuildGender!\n    $buildDefaultClassId: UUID\n  ) {\n    registerUser(\n      email: $email\n      password: $password\n      username: $username\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n': typeof types.RegisterDocument;
  '\n  mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    removeTagFromCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n': typeof types.RemoveTagFromCustomSetDocument;
  '\n  mutation requestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email) {\n      ok\n    }\n  }\n': typeof types.RequestPasswordResetDocument;
  '\n  mutation resendVerificationEmail {\n    resendVerificationEmail {\n      ok\n    }\n  }\n': typeof types.ResendVerificationEmailDocument;
  '\n  mutation resetPassword($token: String!, $password: String!) {\n    resetPassword(token: $token, password: $password) {\n      ok\n    }\n  }\n': typeof types.ResetPasswordDocument;
  '\n  mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n    restartCustomSet(\n      customSetId: $customSetId\n      shouldResetStats: $shouldResetStats\n    ) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n': typeof types.RestartCustomSetDocument;
  '\n  mutation setEquippedItemExo(\n    $stat: Stat!\n    $equippedItemId: UUID!\n    $hasStat: Boolean!\n  ) {\n    setEquippedItemExo(\n      stat: $stat\n      equippedItemId: $equippedItemId\n      hasStat: $hasStat\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n      }\n    }\n  }\n': typeof types.SetEquippedItemExoDocument;
  '\n  mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n    toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n      }\n    }\n  }\n': typeof types.ToggleFavoriteItemDocument;
  '\n  mutation updateCustomSetItem(\n    $itemSlotId: UUID!\n    $customSetId: UUID\n    $itemId: UUID\n  ) {\n    updateCustomSetItem(\n      itemSlotId: $itemSlotId\n      customSetId: $customSetId\n      itemId: $itemId\n    ) {\n      customSet {\n        id\n        equippedItems {\n          id\n          slot {\n            id\n            name\n            order\n          }\n          item {\n            ...item\n          }\n          exos {\n            id\n            stat\n            value\n          }\n          weaponElementMage\n        }\n      }\n    }\n  }\n': typeof types.UpdateCustomSetItemDocument;
  '\n  query buildList(\n    $username: String!\n    $first: Int!\n    $after: String\n    $filters: CustomSetFilters!\n  ) {\n    userByName(username: $username) {\n      id\n      username\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n': typeof types.BuildListDocument;
  '\n  query classBuffs($id: UUID!) {\n    classById(id: $id) {\n      id\n      name\n      spellVariantPairs {\n        id\n        spells {\n          id\n          name\n          description\n          imageUrl\n          spellStats {\n            id\n            level\n            buffs {\n              ...buff\n            }\n          }\n        }\n      }\n    }\n  }\n': typeof types.ClassBuffsDocument;
  '\n  query classes {\n    classes {\n      id\n      name\n      enName\n      allNames\n      maleFaceImageUrl\n      femaleFaceImageUrl\n      maleSpriteImageUrl\n      femaleSpriteImageUrl\n    }\n  }\n': typeof types.ClassesDocument;
  '\n  query currentUser {\n    currentUser {\n      id\n      username\n      email\n      verified\n      favoriteItems {\n        ...item\n      }\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n': typeof types.CurrentUserDocument;
  '\n  query customSet($id: UUID!) {\n    customSetById(id: $id) {\n      ...customSet\n      stats {\n        ...baseStats\n      }\n    }\n  }\n': typeof types.CustomSetDocument;
  '\n  query customSetTags {\n    customSetTags {\n      id\n      name\n      imageUrl\n    }\n  }\n': typeof types.CustomSetTagsDocument;
  '\n  query itemSlots {\n    itemSlots {\n      id\n      enName\n      name\n      order\n      itemTypes {\n        id\n        name\n      }\n      imageUrl\n    }\n  }\n': typeof types.ItemSlotsDocument;
  '\n  query items(\n    $first: Int!\n    $after: String\n    $filters: ItemFilters!\n    $equippedItemIds: [UUID!]!\n    $eligibleItemTypeIds: [UUID!]\n    $level: Int!\n  ) {\n    items(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...item\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n\n    itemSuggestions(\n      eligibleItemTypeIds: $eligibleItemTypeIds\n      equippedItemIds: $equippedItemIds\n      level: $level\n    ) {\n      ...item\n    }\n  }\n': typeof types.ItemsDocument;
  '\n  query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n    currentUser {\n      id\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n': typeof types.MyCustomSetsDocument;
  '\n  query sessionSettings {\n    locale\n    classic\n  }\n': typeof types.SessionSettingsDocument;
  '\n  query set($id: UUID!) {\n    setById(id: $id) {\n      ...set\n      items {\n        ...item\n      }\n    }\n  }\n': typeof types.SetDocument;
  '\n  query sets($first: Int!, $after: String, $filters: SetFilters!) {\n    sets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...set\n          items {\n            ...item\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n': typeof types.SetsDocument;
  '\n  query userProfile($username: String!) {\n    userByName(username: $username) {\n      id\n      username\n      profilePicture\n      creationDate\n      customSets(filters: { search: "", tagIds: [] }) {\n        totalCount\n      }\n    }\n  }\n': typeof types.UserProfileDocument;
};
const documents: Documents = {
  '\n  fragment abbreviatedCustomSet on CustomSet {\n    id\n    buildGender\n    defaultClass {\n      id\n      name\n      maleFaceImageUrl\n      femaleFaceImageUrl\n    }\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        order\n      }\n      item {\n        id\n        imageUrl\n      }\n    }\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n  }\n':
    types.AbbreviatedCustomSetFragmentDoc,
  '\n  fragment baseStats on CustomSetStats {\n    id\n    baseVitality\n    baseWisdom\n    baseStrength\n    baseIntelligence\n    baseChance\n    baseAgility\n    scrolledVitality\n    scrolledWisdom\n    scrolledStrength\n    scrolledIntelligence\n    scrolledChance\n    scrolledAgility\n  }\n':
    types.BaseStatsFragmentDoc,
  '\n  fragment buff on Buff {\n    id\n    stat\n    incrementBy\n    critIncrementBy\n    maxStacks\n  }\n':
    types.BuffFragmentDoc,
  '\n  fragment customSet on CustomSet {\n    id\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        enName\n        name\n        order\n      }\n      item {\n        ...item\n      }\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n    stats {\n      ...baseStats\n    }\n    owner {\n      id\n      username\n    }\n    defaultClass {\n      id\n      name\n      enName\n      femaleFaceImageUrl\n      maleFaceImageUrl\n      femaleSpriteImageUrl\n      maleSpriteImageUrl\n    }\n    creationDate\n    lastModified\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n    hasEditPermission\n    buildGender\n  }\n':
    types.CustomSetFragmentDoc,
  '\n  fragment item on Item {\n    id\n    name\n    level\n    imageUrl\n    stats {\n      id\n      order\n      maxValue\n      stat\n      customStat\n    }\n    weaponStats {\n      id\n      apCost\n      usesPerTurn\n      minRange\n      maxRange\n      baseCritChance\n      critBonusDamage\n      weaponEffects {\n        id\n        minDamage\n        maxDamage\n        effectType\n      }\n    }\n    conditions\n    itemType {\n      id\n      name\n      enName\n      eligibleItemSlots {\n        id\n        enName\n        order\n      }\n    }\n    set {\n      id\n      name\n      bonuses {\n        id\n        numItems\n        stat\n        value\n        customStat\n      }\n    }\n    buffs {\n      ...buff\n    }\n  }\n':
    types.ItemFragmentDoc,
  '\n  fragment set on Set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n':
    types.SetFragmentDoc,
  '\n  mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    addTagToCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n':
    types.AddTagToCustomSetDocument,
  '\n  mutation changeClassic($classic: Boolean!) {\n    changeClassic(classic: $classic) {\n      ok\n    }\n  }\n':
    types.ChangeClassicDocument,
  '\n  mutation changeLocale($locale: String!) {\n    changeLocale(locale: $locale) {\n      ok\n    }\n  }\n':
    types.ChangeLocaleDocument,
  '\n  mutation changePassword($oldPassword: String!, $newPassword: String!) {\n    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n      ok\n    }\n  }\n':
    types.ChangePasswordDocument,
  '\n  mutation changeProfilePicture($picture: String!) {\n    changeProfilePicture(picture: $picture) {\n      user {\n        id\n        profilePicture\n      }\n    }\n  }\n':
    types.ChangeProfilePictureDocument,
  '\n  mutation copyCustomSet($customSetId: UUID!) {\n    copyCustomSet(customSetId: $customSetId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n':
    types.CopyCustomSetDocument,
  '\n  mutation createCustomSet {\n    createCustomSet {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n':
    types.CreateCustomSetDocument,
  '\n  mutation deleteCustomSet($customSetId: UUID!) {\n    deleteCustomSet(customSetId: $customSetId) {\n      ok\n    }\n  }\n':
    types.DeleteCustomSetDocument,
  '\n  mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n    deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n      customSet {\n        id\n        lastModified\n        equippedItems {\n          id\n        }\n      }\n    }\n  }\n':
    types.DeleteCustomSetItemDocument,
  '\n  mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n    editBuildSettings(\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      userSetting {\n        id\n        buildGender\n        buildClass {\n          id\n          name\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n        }\n      }\n    }\n  }\n':
    types.EditBuildSettingsDocument,
  '\n  mutation editCustomSetDefaultClass(\n    $customSetId: UUID\n    $defaultClassId: UUID\n    $buildGender: BuildGender!\n  ) {\n    editCustomSetDefaultClass(\n      customSetId: $customSetId\n      defaultClassId: $defaultClassId\n      buildGender: $buildGender\n    ) {\n      customSet {\n        id\n        lastModified\n        defaultClass {\n          id\n          name\n          enName\n          femaleFaceImageUrl\n          maleFaceImageUrl\n          femaleSpriteImageUrl\n          maleSpriteImageUrl\n        }\n        buildGender\n      }\n    }\n  }\n':
    types.EditCustomSetDefaultClassDocument,
  '\n  mutation editCustomSetMetadata(\n    $customSetId: UUID\n    $name: String\n    $level: Int!\n  ) {\n    editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n      customSet {\n        id\n        name\n        level\n        lastModified\n      }\n    }\n  }\n':
    types.EditCustomSetMetadataDocument,
  '\n  mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n    editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n      customSet {\n        id\n        lastModified\n        stats {\n          id\n          baseVitality\n          baseWisdom\n          baseStrength\n          baseIntelligence\n          baseChance\n          baseAgility\n          scrolledVitality\n          scrolledWisdom\n          scrolledStrength\n          scrolledIntelligence\n          scrolledChance\n          scrolledAgility\n        }\n      }\n    }\n  }\n':
    types.EditCustomSetStatsDocument,
  '\n  mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n    equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n':
    types.EquipItemsDocument,
  '\n  mutation equipSet($customSetId: UUID, $setId: UUID!) {\n    equipSet(customSetId: $customSetId, setId: $setId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n':
    types.EquipSetDocument,
  '\n  mutation login($email: String!, $password: String!, $remember: Boolean!) {\n    loginUser(email: $email, password: $password, remember: $remember) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n':
    types.LoginDocument,
  '\n  mutation logout {\n    logoutUser {\n      ok\n    }\n  }\n':
    types.LogoutDocument,
  '\n  mutation mageEquippedItem(\n    $stats: [CustomSetExosInput!]!\n    $equippedItemId: UUID!\n    $weaponElementMage: WeaponElementMage\n  ) {\n    mageEquippedItem(\n      equippedItemId: $equippedItemId\n      stats: $stats\n      weaponElementMage: $weaponElementMage\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n':
    types.MageEquippedItemDocument,
  '\n  mutation register(\n    $email: String!\n    $password: String!\n    $username: String!\n    $gender: BuildGender!\n    $buildDefaultClassId: UUID\n  ) {\n    registerUser(\n      email: $email\n      password: $password\n      username: $username\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n':
    types.RegisterDocument,
  '\n  mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    removeTagFromCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n':
    types.RemoveTagFromCustomSetDocument,
  '\n  mutation requestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email) {\n      ok\n    }\n  }\n':
    types.RequestPasswordResetDocument,
  '\n  mutation resendVerificationEmail {\n    resendVerificationEmail {\n      ok\n    }\n  }\n':
    types.ResendVerificationEmailDocument,
  '\n  mutation resetPassword($token: String!, $password: String!) {\n    resetPassword(token: $token, password: $password) {\n      ok\n    }\n  }\n':
    types.ResetPasswordDocument,
  '\n  mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n    restartCustomSet(\n      customSetId: $customSetId\n      shouldResetStats: $shouldResetStats\n    ) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n':
    types.RestartCustomSetDocument,
  '\n  mutation setEquippedItemExo(\n    $stat: Stat!\n    $equippedItemId: UUID!\n    $hasStat: Boolean!\n  ) {\n    setEquippedItemExo(\n      stat: $stat\n      equippedItemId: $equippedItemId\n      hasStat: $hasStat\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n      }\n    }\n  }\n':
    types.SetEquippedItemExoDocument,
  '\n  mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n    toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n      }\n    }\n  }\n':
    types.ToggleFavoriteItemDocument,
  '\n  mutation updateCustomSetItem(\n    $itemSlotId: UUID!\n    $customSetId: UUID\n    $itemId: UUID\n  ) {\n    updateCustomSetItem(\n      itemSlotId: $itemSlotId\n      customSetId: $customSetId\n      itemId: $itemId\n    ) {\n      customSet {\n        id\n        equippedItems {\n          id\n          slot {\n            id\n            name\n            order\n          }\n          item {\n            ...item\n          }\n          exos {\n            id\n            stat\n            value\n          }\n          weaponElementMage\n        }\n      }\n    }\n  }\n':
    types.UpdateCustomSetItemDocument,
  '\n  query buildList(\n    $username: String!\n    $first: Int!\n    $after: String\n    $filters: CustomSetFilters!\n  ) {\n    userByName(username: $username) {\n      id\n      username\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n':
    types.BuildListDocument,
  '\n  query classBuffs($id: UUID!) {\n    classById(id: $id) {\n      id\n      name\n      spellVariantPairs {\n        id\n        spells {\n          id\n          name\n          description\n          imageUrl\n          spellStats {\n            id\n            level\n            buffs {\n              ...buff\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.ClassBuffsDocument,
  '\n  query classes {\n    classes {\n      id\n      name\n      enName\n      allNames\n      maleFaceImageUrl\n      femaleFaceImageUrl\n      maleSpriteImageUrl\n      femaleSpriteImageUrl\n    }\n  }\n':
    types.ClassesDocument,
  '\n  query currentUser {\n    currentUser {\n      id\n      username\n      email\n      verified\n      favoriteItems {\n        ...item\n      }\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n':
    types.CurrentUserDocument,
  '\n  query customSet($id: UUID!) {\n    customSetById(id: $id) {\n      ...customSet\n      stats {\n        ...baseStats\n      }\n    }\n  }\n':
    types.CustomSetDocument,
  '\n  query customSetTags {\n    customSetTags {\n      id\n      name\n      imageUrl\n    }\n  }\n':
    types.CustomSetTagsDocument,
  '\n  query itemSlots {\n    itemSlots {\n      id\n      enName\n      name\n      order\n      itemTypes {\n        id\n        name\n      }\n      imageUrl\n    }\n  }\n':
    types.ItemSlotsDocument,
  '\n  query items(\n    $first: Int!\n    $after: String\n    $filters: ItemFilters!\n    $equippedItemIds: [UUID!]!\n    $eligibleItemTypeIds: [UUID!]\n    $level: Int!\n  ) {\n    items(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...item\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n\n    itemSuggestions(\n      eligibleItemTypeIds: $eligibleItemTypeIds\n      equippedItemIds: $equippedItemIds\n      level: $level\n    ) {\n      ...item\n    }\n  }\n':
    types.ItemsDocument,
  '\n  query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n    currentUser {\n      id\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n':
    types.MyCustomSetsDocument,
  '\n  query sessionSettings {\n    locale\n    classic\n  }\n':
    types.SessionSettingsDocument,
  '\n  query set($id: UUID!) {\n    setById(id: $id) {\n      ...set\n      items {\n        ...item\n      }\n    }\n  }\n':
    types.SetDocument,
  '\n  query sets($first: Int!, $after: String, $filters: SetFilters!) {\n    sets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...set\n          items {\n            ...item\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n':
    types.SetsDocument,
  '\n  query userProfile($username: String!) {\n    userByName(username: $username) {\n      id\n      username\n      profilePicture\n      creationDate\n      customSets(filters: { search: "", tagIds: [] }) {\n        totalCount\n      }\n    }\n  }\n':
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
  source: '\n  fragment abbreviatedCustomSet on CustomSet {\n    id\n    buildGender\n    defaultClass {\n      id\n      name\n      maleFaceImageUrl\n      femaleFaceImageUrl\n    }\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        order\n      }\n      item {\n        id\n        imageUrl\n      }\n    }\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n  }\n',
): typeof documents['\n  fragment abbreviatedCustomSet on CustomSet {\n    id\n    buildGender\n    defaultClass {\n      id\n      name\n      maleFaceImageUrl\n      femaleFaceImageUrl\n    }\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        order\n      }\n      item {\n        id\n        imageUrl\n      }\n    }\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment baseStats on CustomSetStats {\n    id\n    baseVitality\n    baseWisdom\n    baseStrength\n    baseIntelligence\n    baseChance\n    baseAgility\n    scrolledVitality\n    scrolledWisdom\n    scrolledStrength\n    scrolledIntelligence\n    scrolledChance\n    scrolledAgility\n  }\n',
): typeof documents['\n  fragment baseStats on CustomSetStats {\n    id\n    baseVitality\n    baseWisdom\n    baseStrength\n    baseIntelligence\n    baseChance\n    baseAgility\n    scrolledVitality\n    scrolledWisdom\n    scrolledStrength\n    scrolledIntelligence\n    scrolledChance\n    scrolledAgility\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment buff on Buff {\n    id\n    stat\n    incrementBy\n    critIncrementBy\n    maxStacks\n  }\n',
): typeof documents['\n  fragment buff on Buff {\n    id\n    stat\n    incrementBy\n    critIncrementBy\n    maxStacks\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment customSet on CustomSet {\n    id\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        enName\n        name\n        order\n      }\n      item {\n        ...item\n      }\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n    stats {\n      ...baseStats\n    }\n    owner {\n      id\n      username\n    }\n    defaultClass {\n      id\n      name\n      enName\n      femaleFaceImageUrl\n      maleFaceImageUrl\n      femaleSpriteImageUrl\n      maleSpriteImageUrl\n    }\n    creationDate\n    lastModified\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n    hasEditPermission\n    buildGender\n  }\n',
): typeof documents['\n  fragment customSet on CustomSet {\n    id\n    name\n    level\n    equippedItems {\n      id\n      slot {\n        id\n        enName\n        name\n        order\n      }\n      item {\n        ...item\n      }\n      exos {\n        id\n        stat\n        value\n      }\n      weaponElementMage\n    }\n    stats {\n      ...baseStats\n    }\n    owner {\n      id\n      username\n    }\n    defaultClass {\n      id\n      name\n      enName\n      femaleFaceImageUrl\n      maleFaceImageUrl\n      femaleSpriteImageUrl\n      maleSpriteImageUrl\n    }\n    creationDate\n    lastModified\n    tagAssociations {\n      id\n      associationDate\n      customSetTag {\n        id\n        name\n        imageUrl\n      }\n    }\n    hasEditPermission\n    buildGender\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment item on Item {\n    id\n    name\n    level\n    imageUrl\n    stats {\n      id\n      order\n      maxValue\n      stat\n      customStat\n    }\n    weaponStats {\n      id\n      apCost\n      usesPerTurn\n      minRange\n      maxRange\n      baseCritChance\n      critBonusDamage\n      weaponEffects {\n        id\n        minDamage\n        maxDamage\n        effectType\n      }\n    }\n    conditions\n    itemType {\n      id\n      name\n      enName\n      eligibleItemSlots {\n        id\n        enName\n        order\n      }\n    }\n    set {\n      id\n      name\n      bonuses {\n        id\n        numItems\n        stat\n        value\n        customStat\n      }\n    }\n    buffs {\n      ...buff\n    }\n  }\n',
): typeof documents['\n  fragment item on Item {\n    id\n    name\n    level\n    imageUrl\n    stats {\n      id\n      order\n      maxValue\n      stat\n      customStat\n    }\n    weaponStats {\n      id\n      apCost\n      usesPerTurn\n      minRange\n      maxRange\n      baseCritChance\n      critBonusDamage\n      weaponEffects {\n        id\n        minDamage\n        maxDamage\n        effectType\n      }\n    }\n    conditions\n    itemType {\n      id\n      name\n      enName\n      eligibleItemSlots {\n        id\n        enName\n        order\n      }\n    }\n    set {\n      id\n      name\n      bonuses {\n        id\n        numItems\n        stat\n        value\n        customStat\n      }\n    }\n    buffs {\n      ...buff\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment set on Set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n',
): typeof documents['\n  fragment set on Set {\n    id\n    name\n    bonuses {\n      id\n      numItems\n      stat\n      value\n      customStat\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    addTagToCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    addTagToCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changeClassic($classic: Boolean!) {\n    changeClassic(classic: $classic) {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation changeClassic($classic: Boolean!) {\n    changeClassic(classic: $classic) {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changeLocale($locale: String!) {\n    changeLocale(locale: $locale) {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation changeLocale($locale: String!) {\n    changeLocale(locale: $locale) {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changePassword($oldPassword: String!, $newPassword: String!) {\n    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation changePassword($oldPassword: String!, $newPassword: String!) {\n    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation changeProfilePicture($picture: String!) {\n    changeProfilePicture(picture: $picture) {\n      user {\n        id\n        profilePicture\n      }\n    }\n  }\n',
): typeof documents['\n  mutation changeProfilePicture($picture: String!) {\n    changeProfilePicture(picture: $picture) {\n      user {\n        id\n        profilePicture\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation copyCustomSet($customSetId: UUID!) {\n    copyCustomSet(customSetId: $customSetId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n',
): typeof documents['\n  mutation copyCustomSet($customSetId: UUID!) {\n    copyCustomSet(customSetId: $customSetId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createCustomSet {\n    createCustomSet {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n',
): typeof documents['\n  mutation createCustomSet {\n    createCustomSet {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteCustomSet($customSetId: UUID!) {\n    deleteCustomSet(customSetId: $customSetId) {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation deleteCustomSet($customSetId: UUID!) {\n    deleteCustomSet(customSetId: $customSetId) {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n    deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n      customSet {\n        id\n        lastModified\n        equippedItems {\n          id\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {\n    deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {\n      customSet {\n        id\n        lastModified\n        equippedItems {\n          id\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n    editBuildSettings(\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      userSetting {\n        id\n        buildGender\n        buildClass {\n          id\n          name\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {\n    editBuildSettings(\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      userSetting {\n        id\n        buildGender\n        buildClass {\n          id\n          name\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation editCustomSetDefaultClass(\n    $customSetId: UUID\n    $defaultClassId: UUID\n    $buildGender: BuildGender!\n  ) {\n    editCustomSetDefaultClass(\n      customSetId: $customSetId\n      defaultClassId: $defaultClassId\n      buildGender: $buildGender\n    ) {\n      customSet {\n        id\n        lastModified\n        defaultClass {\n          id\n          name\n          enName\n          femaleFaceImageUrl\n          maleFaceImageUrl\n          femaleSpriteImageUrl\n          maleSpriteImageUrl\n        }\n        buildGender\n      }\n    }\n  }\n',
): typeof documents['\n  mutation editCustomSetDefaultClass(\n    $customSetId: UUID\n    $defaultClassId: UUID\n    $buildGender: BuildGender!\n  ) {\n    editCustomSetDefaultClass(\n      customSetId: $customSetId\n      defaultClassId: $defaultClassId\n      buildGender: $buildGender\n    ) {\n      customSet {\n        id\n        lastModified\n        defaultClass {\n          id\n          name\n          enName\n          femaleFaceImageUrl\n          maleFaceImageUrl\n          femaleSpriteImageUrl\n          maleSpriteImageUrl\n        }\n        buildGender\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation editCustomSetMetadata(\n    $customSetId: UUID\n    $name: String\n    $level: Int!\n  ) {\n    editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n      customSet {\n        id\n        name\n        level\n        lastModified\n      }\n    }\n  }\n',
): typeof documents['\n  mutation editCustomSetMetadata(\n    $customSetId: UUID\n    $name: String\n    $level: Int!\n  ) {\n    editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {\n      customSet {\n        id\n        name\n        level\n        lastModified\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n    editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n      customSet {\n        id\n        lastModified\n        stats {\n          id\n          baseVitality\n          baseWisdom\n          baseStrength\n          baseIntelligence\n          baseChance\n          baseAgility\n          scrolledVitality\n          scrolledWisdom\n          scrolledStrength\n          scrolledIntelligence\n          scrolledChance\n          scrolledAgility\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {\n    editCustomSetStats(customSetId: $customSetId, stats: $stats) {\n      customSet {\n        id\n        lastModified\n        stats {\n          id\n          baseVitality\n          baseWisdom\n          baseStrength\n          baseIntelligence\n          baseChance\n          baseAgility\n          scrolledVitality\n          scrolledWisdom\n          scrolledStrength\n          scrolledIntelligence\n          scrolledChance\n          scrolledAgility\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n    equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n',
): typeof documents['\n  mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {\n    equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation equipSet($customSetId: UUID, $setId: UUID!) {\n    equipSet(customSetId: $customSetId, setId: $setId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n',
): typeof documents['\n  mutation equipSet($customSetId: UUID, $setId: UUID!) {\n    equipSet(customSetId: $customSetId, setId: $setId) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation login($email: String!, $password: String!, $remember: Boolean!) {\n    loginUser(email: $email, password: $password, remember: $remember) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation login($email: String!, $password: String!, $remember: Boolean!) {\n    loginUser(email: $email, password: $password, remember: $remember) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation logout {\n    logoutUser {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation logout {\n    logoutUser {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation mageEquippedItem(\n    $stats: [CustomSetExosInput!]!\n    $equippedItemId: UUID!\n    $weaponElementMage: WeaponElementMage\n  ) {\n    mageEquippedItem(\n      equippedItemId: $equippedItemId\n      stats: $stats\n      weaponElementMage: $weaponElementMage\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n',
): typeof documents['\n  mutation mageEquippedItem(\n    $stats: [CustomSetExosInput!]!\n    $equippedItemId: UUID!\n    $weaponElementMage: WeaponElementMage\n  ) {\n    mageEquippedItem(\n      equippedItemId: $equippedItemId\n      stats: $stats\n      weaponElementMage: $weaponElementMage\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n        weaponElementMage\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation register(\n    $email: String!\n    $password: String!\n    $username: String!\n    $gender: BuildGender!\n    $buildDefaultClassId: UUID\n  ) {\n    registerUser(\n      email: $email\n      password: $password\n      username: $username\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation register(\n    $email: String!\n    $password: String!\n    $username: String!\n    $gender: BuildGender!\n    $buildDefaultClassId: UUID\n  ) {\n    registerUser(\n      email: $email\n      password: $password\n      username: $username\n      gender: $gender\n      buildDefaultClassId: $buildDefaultClassId\n    ) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n        username\n        email\n        verified\n        settings {\n          id\n          buildGender\n          buildClass {\n            id\n            maleFaceImageUrl\n            femaleFaceImageUrl\n            maleSpriteImageUrl\n            femaleSpriteImageUrl\n            name\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    removeTagFromCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {\n    removeTagFromCustomSet(\n      customSetId: $customSetId\n      customSetTagId: $customSetTagId\n    ) {\n      customSet {\n        id\n        tagAssociations {\n          id\n          associationDate\n          customSetTag {\n            id\n            name\n            imageUrl\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation requestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email) {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation requestPasswordReset($email: String!) {\n    requestPasswordReset(email: $email) {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation resendVerificationEmail {\n    resendVerificationEmail {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation resendVerificationEmail {\n    resendVerificationEmail {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation resetPassword($token: String!, $password: String!) {\n    resetPassword(token: $token, password: $password) {\n      ok\n    }\n  }\n',
): typeof documents['\n  mutation resetPassword($token: String!, $password: String!) {\n    resetPassword(token: $token, password: $password) {\n      ok\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n    restartCustomSet(\n      customSetId: $customSetId\n      shouldResetStats: $shouldResetStats\n    ) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n',
): typeof documents['\n  mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {\n    restartCustomSet(\n      customSetId: $customSetId\n      shouldResetStats: $shouldResetStats\n    ) {\n      customSet {\n        ...customSet\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation setEquippedItemExo(\n    $stat: Stat!\n    $equippedItemId: UUID!\n    $hasStat: Boolean!\n  ) {\n    setEquippedItemExo(\n      stat: $stat\n      equippedItemId: $equippedItemId\n      hasStat: $hasStat\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation setEquippedItemExo(\n    $stat: Stat!\n    $equippedItemId: UUID!\n    $hasStat: Boolean!\n  ) {\n    setEquippedItemExo(\n      stat: $stat\n      equippedItemId: $equippedItemId\n      hasStat: $hasStat\n    ) {\n      equippedItem {\n        id\n        exos {\n          id\n          stat\n          value\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n    toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {\n    toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {\n      user {\n        id\n        favoriteItems {\n          ...item\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateCustomSetItem(\n    $itemSlotId: UUID!\n    $customSetId: UUID\n    $itemId: UUID\n  ) {\n    updateCustomSetItem(\n      itemSlotId: $itemSlotId\n      customSetId: $customSetId\n      itemId: $itemId\n    ) {\n      customSet {\n        id\n        equippedItems {\n          id\n          slot {\n            id\n            name\n            order\n          }\n          item {\n            ...item\n          }\n          exos {\n            id\n            stat\n            value\n          }\n          weaponElementMage\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  mutation updateCustomSetItem(\n    $itemSlotId: UUID!\n    $customSetId: UUID\n    $itemId: UUID\n  ) {\n    updateCustomSetItem(\n      itemSlotId: $itemSlotId\n      customSetId: $customSetId\n      itemId: $itemId\n    ) {\n      customSet {\n        id\n        equippedItems {\n          id\n          slot {\n            id\n            name\n            order\n          }\n          item {\n            ...item\n          }\n          exos {\n            id\n            stat\n            value\n          }\n          weaponElementMage\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query buildList(\n    $username: String!\n    $first: Int!\n    $after: String\n    $filters: CustomSetFilters!\n  ) {\n    userByName(username: $username) {\n      id\n      username\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  query buildList(\n    $username: String!\n    $first: Int!\n    $after: String\n    $filters: CustomSetFilters!\n  ) {\n    userByName(username: $username) {\n      id\n      username\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query classBuffs($id: UUID!) {\n    classById(id: $id) {\n      id\n      name\n      spellVariantPairs {\n        id\n        spells {\n          id\n          name\n          description\n          imageUrl\n          spellStats {\n            id\n            level\n            buffs {\n              ...buff\n            }\n          }\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  query classBuffs($id: UUID!) {\n    classById(id: $id) {\n      id\n      name\n      spellVariantPairs {\n        id\n        spells {\n          id\n          name\n          description\n          imageUrl\n          spellStats {\n            id\n            level\n            buffs {\n              ...buff\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query classes {\n    classes {\n      id\n      name\n      enName\n      allNames\n      maleFaceImageUrl\n      femaleFaceImageUrl\n      maleSpriteImageUrl\n      femaleSpriteImageUrl\n    }\n  }\n',
): typeof documents['\n  query classes {\n    classes {\n      id\n      name\n      enName\n      allNames\n      maleFaceImageUrl\n      femaleFaceImageUrl\n      maleSpriteImageUrl\n      femaleSpriteImageUrl\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query currentUser {\n    currentUser {\n      id\n      username\n      email\n      verified\n      favoriteItems {\n        ...item\n      }\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  query currentUser {\n    currentUser {\n      id\n      username\n      email\n      verified\n      favoriteItems {\n        ...item\n      }\n      settings {\n        id\n        buildGender\n        buildClass {\n          id\n          maleFaceImageUrl\n          femaleFaceImageUrl\n          maleSpriteImageUrl\n          femaleSpriteImageUrl\n          name\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query customSet($id: UUID!) {\n    customSetById(id: $id) {\n      ...customSet\n      stats {\n        ...baseStats\n      }\n    }\n  }\n',
): typeof documents['\n  query customSet($id: UUID!) {\n    customSetById(id: $id) {\n      ...customSet\n      stats {\n        ...baseStats\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query customSetTags {\n    customSetTags {\n      id\n      name\n      imageUrl\n    }\n  }\n',
): typeof documents['\n  query customSetTags {\n    customSetTags {\n      id\n      name\n      imageUrl\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query itemSlots {\n    itemSlots {\n      id\n      enName\n      name\n      order\n      itemTypes {\n        id\n        name\n      }\n      imageUrl\n    }\n  }\n',
): typeof documents['\n  query itemSlots {\n    itemSlots {\n      id\n      enName\n      name\n      order\n      itemTypes {\n        id\n        name\n      }\n      imageUrl\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query items(\n    $first: Int!\n    $after: String\n    $filters: ItemFilters!\n    $equippedItemIds: [UUID!]!\n    $eligibleItemTypeIds: [UUID!]\n    $level: Int!\n  ) {\n    items(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...item\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n\n    itemSuggestions(\n      eligibleItemTypeIds: $eligibleItemTypeIds\n      equippedItemIds: $equippedItemIds\n      level: $level\n    ) {\n      ...item\n    }\n  }\n',
): typeof documents['\n  query items(\n    $first: Int!\n    $after: String\n    $filters: ItemFilters!\n    $equippedItemIds: [UUID!]!\n    $eligibleItemTypeIds: [UUID!]\n    $level: Int!\n  ) {\n    items(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...item\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n\n    itemSuggestions(\n      eligibleItemTypeIds: $eligibleItemTypeIds\n      equippedItemIds: $equippedItemIds\n      level: $level\n    ) {\n      ...item\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n    currentUser {\n      id\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n',
): typeof documents['\n  query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {\n    currentUser {\n      id\n      customSets(first: $first, after: $after, filters: $filters) {\n        edges {\n          node {\n            ...abbreviatedCustomSet\n          }\n        }\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query sessionSettings {\n    locale\n    classic\n  }\n',
): typeof documents['\n  query sessionSettings {\n    locale\n    classic\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query set($id: UUID!) {\n    setById(id: $id) {\n      ...set\n      items {\n        ...item\n      }\n    }\n  }\n',
): typeof documents['\n  query set($id: UUID!) {\n    setById(id: $id) {\n      ...set\n      items {\n        ...item\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query sets($first: Int!, $after: String, $filters: SetFilters!) {\n    sets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...set\n          items {\n            ...item\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n',
): typeof documents['\n  query sets($first: Int!, $after: String, $filters: SetFilters!) {\n    sets(first: $first, after: $after, filters: $filters) {\n      edges {\n        node {\n          ...set\n          items {\n            ...item\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query userProfile($username: String!) {\n    userByName(username: $username) {\n      id\n      username\n      profilePicture\n      creationDate\n      customSets(filters: { search: "", tagIds: [] }) {\n        totalCount\n      }\n    }\n  }\n',
): typeof documents['\n  query userProfile($username: String!) {\n    userByName(username: $username) {\n      id\n      username\n      profilePicture\n      creationDate\n      customSets(filters: { search: "", tagIds: [] }) {\n        totalCount\n      }\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
