/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';
import Card from 'antd/lib/card';
import Tooltip from 'antd/lib/tooltip';
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
import {
  selected,
  itemCardStyle,
  itemBoxDimensions,
  blue6,
} from 'common/mixins';
import { useDeleteItemMutation, checkAuthentication } from 'common/utils';
import { ItemStatsList, Badge, TruncatableText } from 'common/wrappers';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import { Stat } from '__generated__/globalTypes';
import setEquippedItemExoMutation from 'graphql/mutations/setEquippedItemExo.graphql';
import {
  setEquippedItemExo,
  setEquippedItemExoVariables,
} from 'graphql/mutations/__generated__/setEquippedItemExo';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import MageModal from './MageModal';

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
};

interface IProps {
  equippedItem: customSet_customSetById_equippedItems;
  selectedItemSlotId: string;
  customSet: customSet;
}

const CurrentlyEquippedItem: React.FC<IProps> = ({
  equippedItem,
  selectedItemSlotId,
  customSet,
}) => {
  const { t } = useTranslation(['common', 'mage', 'stat']);

  const deleteItem = useDeleteItemMutation(selectedItemSlotId, customSet);

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

  const [mageModalVisible, setMageModalVisible] = React.useState(false);
  const openMageModal = React.useCallback(() => {
    setMageModalVisible(true);
  }, [setMageModalVisible]);
  const closeMageModal = React.useCallback(() => {
    setMageModalVisible(false);
  }, [setMageModalVisible]);

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
        align={{ offset: [0, ACTION_PADDING] }}
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

  return (
    <>
      <Card
        size="small"
        title={
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <TruncatableText>{equippedItem.item.name}</TruncatableText>{' '}
            <Badge>{t('EQUIPPED')}</Badge>
          </div>
        }
        css={css({
          ...itemCardStyle,
          ...selected,
          display: 'flex',
          flexDirection: 'column',
          ['.ant-card-body']: {
            flex: '1',
          },
        })}
        actions={[
          ...quickMageMenu,
          <Tooltip
            title={t('MAGE', { ns: 'mage' })}
            align={{ offset: [0, ACTION_PADDING] }}
          >
            <div css={actionWrapper} onClick={openMageModal}>
              <FontAwesomeIcon icon={faMagic} />
            </div>
          </Tooltip>,
          <Tooltip title={t('DELETE')} align={{ offset: [0, ACTION_PADDING] }}>
            <div css={actionWrapper} onClick={onDelete}>
              <FontAwesomeIcon icon={faTrashAlt} onClick={onDelete} />
            </div>
          </Tooltip>,
        ]}
      >
        <img
          src={equippedItem.item.imageUrl}
          css={{ float: 'right', ...itemBoxDimensions }}
        />
        <ItemStatsList
          item={equippedItem.item}
          css={{ paddingLeft: 16, marginBottom: 0 }}
          exos={equippedItem.exos}
        />
      </Card>
      <MageModal
        visible={mageModalVisible}
        equippedItem={equippedItem}
        closeMageModal={closeMageModal}
        key={`${equippedItem.id}-${equippedItem.item.id}-${equippedItem.exos.length}`}
      />
    </>
  );
};

export default CurrentlyEquippedItem;
