/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';
import { Button, Switch, Divider } from 'antd';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faShoePrints,
  // faMagic,
  // faTrashAlt,
  faStar,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'emotion-theming';

import { Theme, BuildError } from 'common/types';
import { useTranslation } from 'i18n';
import { itemCardStyle, switchStyle } from 'common/mixins';
import {
  useDeleteItemMutation,
  checkAuthentication,
  EditableContext,
} from 'common/utils';
import { Stat } from '__generated__/globalTypes';
import setEquippedItemExoMutation from 'graphql/mutations/setEquippedItemExo.graphql';
import {
  setEquippedItemExo,
  setEquippedItemExoVariables,
} from 'graphql/mutations/__generated__/setEquippedItemExo';
import { TruncatableText } from 'common/wrappers';
import Router from 'next/router';
import { Media } from 'components/common/Media';
import Link from 'next/link';

import Card from 'components/common/Card';
import { mq } from 'common/constants';
import { EquippedItem, ItemSet, CustomSet } from 'common/type-aliases';
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

// const ACTION_PADDING = 12;

// const actionWrapper = {
//   margin: -ACTION_PADDING,
//   padding: ACTION_PADDING,
//   transition: 'color 0.3s ease-in-out',
//   [':hover']: { color },
//   fontSize: '0.8rem',
// };

interface Props {
  equippedItem: EquippedItem;
  itemSlotId: string;
  customSet: CustomSet;
  openMageModal: (equippedItem: EquippedItem) => void;
  openSetModal: (set: ItemSet) => void;
  errors?: Array<BuildError>;
}

const EquippedItemCard: React.FC<Props> = ({
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
    Router.push(
      { pathname: '/index', query: { customSetId: customSet.id } },
      customSet ? `/build/${customSet.id}/` : '/',
    );
  }, [deleteItem, customSet]);

  const client = useApolloClient();

  const theme = useTheme<Theme>();

  const onQuickMage = React.useCallback(
    async (checked: boolean, stat: Stat) => {
      const ok = await checkAuthentication(client, t, customSet);
      if (!ok) return;
      quickExo({
        variables: {
          stat,
          equippedItemId: equippedItem.id,
          hasStat: checked,
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
      <div key={stat} css={{ display: 'flex', alignItems: 'center' }}>
        <Switch
          checked={hasExo}
          css={{ ...switchStyle(theme, true), marginRight: 12 }}
          checkedChildren={<FontAwesomeIcon icon={faIcon} />}
          onChange={(checked) => {
            onQuickMage(checked, stat);
          }}
        />
        {t('EXO', {
          ns: 'mage',
          stat: t(stat, { ns: 'stat' }),
        })}
      </div>
    );
  });

  const onMageClick = React.useCallback(() => {
    openMageModal(equippedItem);
  }, [openMageModal, equippedItem]);

  const isEditable = React.useContext(EditableContext);

  let asPath = '/';
  if (customSet && isEditable) {
    asPath = `/build/${customSet.id}`;
  } else if (customSet) {
    asPath = `/view/${customSet.id}`;
  }

  return (
    <div css={{ padding: '0 12px', marginTop: 12 }}>
      <Media lessThan="xs">
        <Link
          href={{
            pathname: isEditable ? '/view/[customSetId]' : '/',
            query: { customSetId: customSet.id },
          }}
          as={asPath}
          passHref
        >
          <a>
            <Button size="large" css={{ fontSize: '0.75rem' }}>
              <FontAwesomeIcon icon={faArrowLeft} css={{ marginRight: 12 }} />
              {t('BACK')}
            </Button>
          </a>
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
          '.ant-card-body': {
            flex: '1',
          },
          border: `1px solid ${theme.border?.default}`,
          borderRadius: 4,
          minWidth: 256,
          overflow: 'hidden',
          marginBottom: 40,
        })}
      >
        {isEditable && (
          <>
            <div
              css={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridGap: 8,
                [mq[0]]: {
                  gridTemplateColumns: '1fr 1fr 1fr',
                },
              }}
            >
              {quickMageMenu}
            </div>
            <div css={{ marginTop: 20 }}>
              <Button onClick={onMageClick}>
                {t('MORE_MAGING_OPTIONS', { ns: 'mage' })}
              </Button>
            </div>
            <Divider css={{ margin: '12px 0' }} />
          </>
        )}

        <ItemStatsList
          item={equippedItem.item}
          css={{ paddingLeft: 16, marginBottom: 0 }}
          exos={equippedItem.exos}
          openSetModal={openSetModal}
          showImg
          errors={errors}
        />

        {isEditable && (
          <>
            <Divider css={{ margin: '12px 0' }} />
            <Link
              href={{
                pathname: '/equip/[itemSlotId]',
                query: {
                  itemSlotId: equippedItem.slot.id,
                  customSetId: customSet?.id,
                },
              }}
              as={`/equip/${equippedItem.slot.id}/${
                customSet ? customSet.id : ''
              }`}
              passHref
            >
              <a>
                <Button>{t('REPLACE')}</Button>
              </a>
            </Link>
            <Button onClick={onDelete} css={{ marginLeft: 12 }}>
              {t('DELETE')}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default EquippedItemCard;
