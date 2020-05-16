/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { CardTitleWithLevel, BrokenImagePlaceholder } from 'common/wrappers';
import {
  item as Item,
  item_set as ItemSet,
} from 'graphql/fragments/__generated__/item';
import { useTranslation } from 'i18n';
import { useTheme } from 'emotion-theming';
import {
  itemCardStyle,
  itemBoxDimensions,
  ITEM_BOX_WIDTH,
} from 'common/mixins';
import { WeaponElementMage } from '__generated__/globalTypes';
import { Theme } from 'common/types';
import Card from 'components/common/Card';
import ItemStatsList from './ItemStatsList';

interface Props {
  item: Item;
  equipped?: boolean;
  openSetModal?: (set: ItemSet) => void;
  onClick?: () => void;
  showOnlyWeaponStats: boolean;
  weaponElementMage?: WeaponElementMage | null;
  favorite?: React.ReactNode;
}

const BasicItemCard: React.FC<Props> = ({
  item,
  equipped,
  openSetModal,
  onClick,
  showOnlyWeaponStats,
  weaponElementMage,
  favorite,
}) => {
  const { t } = useTranslation(['common', 'stat', 'weapon_spell_effect']);
  const theme = useTheme<Theme>();
  const [brokenImage, setBrokenImage] = React.useState(false);
  return (
    <Card
      hoverable={!!onClick}
      size="small"
      title={
        <CardTitleWithLevel
          title={item.name}
          showBadge={equipped}
          badgeContent={t('EQUIPPED')}
          level={item.level}
          rightAlignedContent={favorite}
        />
      }
      css={{
        ...itemCardStyle,
        ':hover': {
          border: `1px solid ${theme.border?.default}`,
        },
        border: `1px solid ${theme.border?.default}`,
      }}
      onClick={onClick}
    >
      <div
        css={{
          float: 'right',
          marginLeft: 12,
          textAlign: 'right',
        }}
      >
        {brokenImage ? (
          <BrokenImagePlaceholder
            css={{
              ...itemBoxDimensions,
              marginBottom: 12,
              maxWidth: ITEM_BOX_WIDTH,
              fontSize: '1.2rem',
              minWidth: 60,
              minHeight: 60,
            }}
          />
        ) : (
          <img
            src={item.imageUrl}
            css={{
              ...itemBoxDimensions,
              marginBottom: 12,
              maxWidth: ITEM_BOX_WIDTH,
            }}
            onError={() => {
              setBrokenImage(true);
            }}
            alt={item.name}
          />
        )}
      </div>
      <ItemStatsList
        item={item}
        css={{ paddingLeft: 16, marginBottom: 0 }}
        openSetModal={openSetModal}
        showOnlyWeaponStats={showOnlyWeaponStats}
        weaponElementMage={weaponElementMage}
      />
    </Card>
  );
};

export default BasicItemCard;
