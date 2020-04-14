/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';
import { Tooltip } from 'antd';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faShoePrints,
  faMagic,
  faTrashAlt,
  faStar,
} from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'i18n';
import { itemCardStyle, blue6 } from 'common/mixins';
import { useDeleteItemMutation, checkAuthentication } from 'common/utils';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import { Stat } from '__generated__/globalTypes';
import setEquippedItemExoMutation from 'graphql/mutations/setEquippedItemExo.graphql';
import {
  setEquippedItemExo,
  setEquippedItemExoVariables,
} from 'graphql/mutations/__generated__/setEquippedItemExo';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import ItemStatsList from '../common/ItemStatsList';
import { item_set } from 'graphql/fragments/__generated__/item';
import { IError } from 'common/types';
import Card from 'components/common/Card';

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

const ACTION_PADDING = 12;

const actionWrapper = {
  margin: -ACTION_PADDING,
  padding: ACTION_PADDING,
  transition: 'color 0.3s',
  [':hover']: { color: blue6 },
  fontSize: '0.8rem',
};

interface IProps {
  equippedItem: customSet_customSetById_equippedItems;
  itemSlotId: string;
  customSet: customSet;
  openMageModal: (equippedItem: customSet_customSetById_equippedItems) => void;
  stopPropagationCallback?: (e: React.MouseEvent<HTMLElement>) => void;
  openSetModal: (set: item_set) => void;
  errors?: Array<IError>;
}

const EquippedItemCard: React.FC<IProps> = ({
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
                { id: '0', stat, value: 1, __typename: 'EquippedItemExo' },
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
        align={{ offset: [0, -ACTION_PADDING] }}
        placement="bottom"
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

  return (
    <Card
      size="small"
      css={css({
        ...itemCardStyle,
        display: 'flex',
        flexDirection: 'column',
        ['.ant-card-body']: {
          flex: '1',
        },
        border: 'none',
        borderRadius: 4,
        minWidth: 256,
        overflow: 'hidden',
      })}
      actions={[
        ...quickMageMenu,
        <Tooltip
          title={t('MAGE', { ns: 'mage' })}
          align={{ offset: [0, -ACTION_PADDING] }}
          placement="bottom"
        >
          <div css={actionWrapper} onClick={onMageClick}>
            <FontAwesomeIcon icon={faMagic} />
          </div>
        </Tooltip>,
        <Tooltip
          title={t('DELETE')}
          align={{ offset: [0, -ACTION_PADDING] }}
          placement="bottom"
        >
          <div css={actionWrapper} onClick={onDelete}>
            <FontAwesomeIcon icon={faTrashAlt} onClick={onDelete} />
          </div>
        </Tooltip>,
      ]}
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
    </Card>
  );
};

export default EquippedItemCard;
