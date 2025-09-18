/** @jsxImportSource @emotion/react */

import { useCallback, useContext } from 'react';
import { css, useTheme } from '@emotion/react';
import { Button, Switch, Divider } from 'antd';
import { useMutation, useApolloClient } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faShoePrints,
  faStar,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

import { BuildError } from 'common/types';
import { useTranslation } from 'next-i18next';
import { itemCardStyle, switchStyle } from 'common/mixins';
import {
  useDeleteItemMutation,
  checkAuthentication,
  EditableContext,
  slotToUrlString,
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
import {
  EquippedItem,
  ItemSet,
  CustomSet,
  EquippedItemSlot,
} from 'common/type-aliases';
import AddBuffLink from 'components/common/AddBuffLink';
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

interface Props {
  equippedItem: EquippedItem;
  itemSlot: EquippedItemSlot;
  customSet: CustomSet;
  openMageModal: (equippedItem: EquippedItem) => void;
  openSetModal: (set: ItemSet) => void;
  errors?: Array<BuildError>;
}

const EquippedItemCard = ({
  equippedItem,
  itemSlot,
  customSet,
  openMageModal,
  openSetModal,
  errors,
}: Props) => {
  const { t } = useTranslation(['common', 'mage', 'stat']);

  const deleteItem = useDeleteItemMutation(customSet);

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

  const onDelete = useCallback(() => {
    deleteItem(itemSlot.id);
    Router.push(customSet ? `/build/${customSet.id}/` : '/');
  }, [deleteItem, customSet, itemSlot]);

  const client = useApolloClient();

  const theme = useTheme();

  const onQuickMage = useCallback(
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

  const onMageClick = useCallback(() => {
    openMageModal(equippedItem);
  }, [openMageModal, equippedItem]);

  const isEditable = useContext(EditableContext);

  let path = '/';
  if (customSet && isEditable) {
    path = `/build/${customSet.id}/`;
  } else if (customSet) {
    path = `/view/${customSet.id}/`;
  }

  return (
    <div css={{ padding: '0 12px', marginTop: 12 }}>
      <Media lessThan="xs">
        <Link href={path} passHref>
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
          weaponElementMage={equippedItem.weaponElementMage}
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

        {isEditable && (
          <>
            <Divider css={{ margin: '12px 0' }} />
            <Link
              href={`/equip/${slotToUrlString(itemSlot)}/${
                customSet ? customSet.id : ''
              }`}
              passHref
            >
              <Button>{t('REPLACE')}</Button>
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
