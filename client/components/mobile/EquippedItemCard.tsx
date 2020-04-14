/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';
import { Button, Tooltip } from 'antd';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faShoePrints,
  faMagic,
  faTrashAlt,
  faStar,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
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
import { TruncatableText } from 'common/wrappers';
import Router from 'next/router';
import { Media } from 'components/common/Media';
import Link from 'next/link';
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
  openSetModal: (set: item_set) => void;
  errors?: Array<IError>;
}

const EquippedItemCard: React.FC<IProps> = ({
  equippedItem,
  itemSlotId,
  customSet,
  openMageModal,
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
    Router.push(
      { pathname: '/index', query: { customSetId: customSet.id } },
      customSet ? `/build/${customSet.id}` : '/',
    );
  }, [deleteItem, customSet]);

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

  const theme = useTheme<TTheme>();

  return (
    <div css={{ padding: '0 12px', marginTop: 12 }}>
      <Media lessThan="xs">
        <Link
          href={{ pathname: '/index', query: { customSetId: customSet.id } }}
          as={customSet ? `/build/${customSet.id}` : '/'}
        >
          <Button size="large" css={{ fontSize: '0.75rem' }}>
            <FontAwesomeIcon icon={faArrowLeft} css={{ marginRight: 12 }} />
            {t('BACK')}
          </Button>
        </Link>
      </Media>
      <Card
        size="small"
        title={
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <TruncatableText css={{ marginRight: 8, fontSize: '0.8rem' }}>
              {equippedItem.item.name}
            </TruncatableText>
            <div
              css={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: 'auto' }}
            >
              {t('LEVEL_ABBREVIATION', { ns: 'common' })}{' '}
              {equippedItem.item.level}
            </div>
          </div>
        }
        css={css({
          ...itemCardStyle,
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          ['.ant-card-body']: {
            flex: '1',
          },
          border: `1px solid ${theme.border?.default}`,
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
      >
        <ItemStatsList
          item={equippedItem.item}
          css={{ paddingLeft: 16, marginBottom: 0 }}
          exos={equippedItem.exos}
          openSetModal={openSetModal}
          showImg
          errors={errors}
        />
      </Card>
    </div>
  );
};

export default EquippedItemCard;
