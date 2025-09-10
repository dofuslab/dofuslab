/** @jsxImportSource @emotion/react */

import React from 'react';
import { CardTitleWithLevel, BrokenImagePlaceholder } from 'common/wrappers';
import {
  item as Item,
  item_set as ItemSet,
} from 'graphql/fragments/__generated__/item';
import { useTranslation } from 'next-i18next';
import { useTheme } from '@emotion/react';
import {
  itemCardStyle,
  itemBoxDimensions,
  ITEM_BOX_WIDTH,
  gold5,
} from 'common/mixins';
import { WeaponElementMage } from '__generated__/globalTypes';
import Card from 'components/common/Card';
import { getImageUrl } from 'common/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';
import ItemStatsList from './ItemStatsList';
import Tooltip from './Tooltip';

interface Props {
  item: Item;
  equipped?: boolean;
  openSetModal?: (set: ItemSet) => void;
  onClick?: () => void;
  showOnlyWeaponStats: boolean;
  weaponElementMage?: WeaponElementMage | null;
  favorite?: React.ReactNode;
  isSuggestion?: boolean;
}

const BasicItemCard = ({
  item,
  equipped,
  openSetModal,
  onClick,
  showOnlyWeaponStats,
  weaponElementMage,
  favorite,
  isSuggestion,
}: Props) => {
  const { t } = useTranslation(['common', 'stat', 'weapon_spell_effect']);
  const theme = useTheme();
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
          rightAlignedContent={
            <div>
              {isSuggestion && (
                <Tooltip title={t('SUGGESTED_DOFUSLAB_DATA')}>
                  <FontAwesomeIcon
                    icon={faLightbulb}
                    css={{
                      marginRight: 8,
                      '&:hover': {
                        color: gold5,
                      },
                    }}
                  />
                </Tooltip>
              )}
              {favorite}
            </div>
          }
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
            src={getImageUrl(item.imageUrl)}
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
