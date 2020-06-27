/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faShoePrints,
  faMagic,
  faTrashAlt,
  faStar,
  faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

import { useTranslation } from 'i18n';
import { itemCardStyle, blue6 } from 'common/mixins';
import {
  useDeleteItemMutation,
  checkAuthentication,
  EditableContext,
  useToggleFavoriteMutation,
} from 'common/utils';
import { Stat } from '__generated__/globalTypes';
import setEquippedItemExoMutation from 'graphql/mutations/setEquippedItemExo.graphql';
import {
  setEquippedItemExo,
  setEquippedItemExoVariables,
} from 'graphql/mutations/__generated__/setEquippedItemExo';
import { BuildError } from 'common/types';
import Card from 'components/common/Card';
import Tooltip from 'components/common/Tooltip';
import { EquippedItem, CustomSet, ItemSet } from 'common/type-aliases';
import AddBuffLink from 'components/common/AddBuffLink';
import { Divider } from 'antd';
import ItemStatsList from '../common/ItemStatsList';

const quickMageStats = [
  {
    stat: Stat.AP,
    faIcon: faStar,
  },
  {
    stat: Stat.MP,
    faIcon: faShoePrints,
  },
  {
    stat: Stat.RANGE,
    faIcon: faBullseye,
  },
];

const TOOLTIP_Z_INDEX = 1062; // greater than item popover

const actionWrapper = {
  transition: 'color 0.3s ease-in-out',
  ':hover': { color: blue6 },
  fontSize: '0.8rem',
};

interface Props {
  equippedItem: EquippedItem;
  itemSlotId: string;
  customSet: CustomSet;
  openMageModal: (equippedItem: EquippedItem) => void;
  stopPropagationCallback?: (e: React.MouseEvent<HTMLElement>) => void;
  openSetModal: (set: ItemSet) => void;
  errors?: Array<BuildError>;
}

const EquippedItemCard: React.FC<Props> = ({
  equippedItem,
  itemSlotId,
  customSet,
  openMageModal,
  stopPropagationCallback,
  openSetModal,
  errors,
}) => {
  const { t } = useTranslation(['common', 'mage', 'stat']);

  const deleteItem = useDeleteItemMutation(itemSlotId, customSet);

  const [quickExo] = useMutation<
    setEquippedItemExo,
    setEquippedItemExoVariables
  >(setEquippedItemExoMutation, {
    optimisticResponse: ({ stat, hasStat }) => ({
      setEquippedItemExo: {
        equippedItem: {
          ...equippedItem,
          exos: hasStat
            ? [
                ...equippedItem.exos,
                {
                  id: '0',
                  stat,
                  value: 1,
                  __typename: 'EquippedItemExo',
                },
              ]
            : equippedItem.exos.filter(({ stat: exoStat }) => stat !== exoStat),
        },
        __typename: 'SetEquippedItemExo',
      },
    }),
  });

  const onDelete = React.useCallback(() => {
    deleteItem();
  }, [deleteItem]);

  const client = useApolloClient();

  const onQuickMage = React.useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      const { stat: statToExo } = e.currentTarget.dataset;
      const ok = await checkAuthentication(client, t, customSet);
      if (!ok) return;
      quickExo({
        variables: {
          stat: statToExo as Stat,
          equippedItemId: equippedItem.id,
          hasStat: !equippedItem.exos.some(({ stat }) => stat === statToExo),
        },
      });
    },
    [quickExo, equippedItem, client, customSet, t],
  );

  const quickMageMenu = quickMageStats.map(({ stat, faIcon }) => {
    const hasExo = equippedItem.exos.some(
      ({ stat: exoStat }) => stat === exoStat,
    );
    return (
      <Tooltip
        key={`quick-mage-${stat}`}
        title={t(hasExo ? 'REMOVE_EXO' : 'EXO', {
          ns: 'mage',
          stat: t(stat, { ns: 'stat' }),
        })}
        placement="bottom"
        overlayStyle={{ zIndex: TOOLTIP_Z_INDEX }}
      >
        <div
          css={{ color: hasExo ? blue6 : 'inherit', ...actionWrapper }}
          onClick={onQuickMage}
          data-stat={stat}
        >
          <FontAwesomeIcon icon={faIcon} data-stat={stat} />
        </div>
      </Tooltip>
    );
  });

  const onMageClick = React.useCallback(() => {
    openMageModal(equippedItem);
  }, [openMageModal, equippedItem]);

  const {
    isFavorite,
    mutationResult: [toggleFavorite],
  } = useToggleFavoriteMutation(equippedItem.item);

  const onFavoriteClick = React.useCallback(() => {
    toggleFavorite();
  }, [toggleFavorite]);

  const isEditable = React.useContext(EditableContext);

  return (
    <Card
      size="small"
      css={css({
        ...itemCardStyle,
        display: 'flex',
        flexDirection: 'column',
        '.ant-card-body': {
          flex: '1',
        },
        border: 'none',
        borderRadius: 4,
        minWidth: 288,
        overflow: 'hidden',
      })}
      actions={
        isEditable
          ? [
              ...quickMageMenu,
              <Tooltip
                title={t('MAGE', { ns: 'mage' })}
                placement="bottom"
                overlayStyle={{ zIndex: TOOLTIP_Z_INDEX }}
              >
                <div css={actionWrapper} onClick={onMageClick}>
                  <FontAwesomeIcon icon={faMagic} />
                </div>
              </Tooltip>,
              <Tooltip
                title={t('FAVORITE')}
                placement="bottom"
                overlayStyle={{ zIndex: TOOLTIP_Z_INDEX }}
              >
                <div css={actionWrapper} onClick={onFavoriteClick}>
                  <FontAwesomeIcon
                    icon={isFavorite ? faHeartSolid : faHeartRegular}
                  />
                </div>
              </Tooltip>,
              <Tooltip
                title={t('DELETE')}
                placement="bottom"
                overlayStyle={{ zIndex: TOOLTIP_Z_INDEX }}
              >
                <div css={actionWrapper} onClick={onDelete}>
                  <FontAwesomeIcon icon={faTrashAlt} onClick={onDelete} />
                </div>
              </Tooltip>,
            ]
          : undefined
      }
      onClick={stopPropagationCallback}
    >
      <ItemStatsList
        item={equippedItem.item}
        css={{ paddingLeft: 16, marginBottom: 0 }}
        exos={equippedItem.exos}
        openSetModal={openSetModal}
        showImg={false}
        weaponElementMage={equippedItem.weaponElementMage}
        errors={errors}
      />
      {(equippedItem.item.buffs?.length ?? 0) > 0 && (
        <Divider css={{ margin: '12px 0' }} />
      )}
      {equippedItem.item.buffs?.map((b) => (
        <AddBuffLink
          key={b.id}
          buff={b}
          isCrit={false}
          shouldNotify
          item={equippedItem.item}
        />
      ))}
    </Card>
  );
};

export default EquippedItemCard;
