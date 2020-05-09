/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Modal, Divider, Skeleton } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { useTheme } from 'emotion-theming';
import groupBy from 'lodash/groupBy';

import { Theme } from 'common/types';
import { set, setVariables } from 'graphql/queries/__generated__/set';
import setQuery from 'graphql/queries/set.graphql';
import { useTranslation } from 'i18n';
import { SetBonuses } from 'common/wrappers';
import { itemBox } from 'common/mixins';
import { mq } from 'common/constants';
import { useEquipItemsMutation, EditableContext } from 'common/utils';
import { CustomSet, SetBonus } from 'common/type-aliases';
import BasicItemWithStats from '../desktop/BasicItemWithStats';

interface Props {
  setId: string;
  setName: string;
  visible: boolean;
  onCancel: () => void;
  customSet?: CustomSet | null;
  shouldRedirect?: boolean;
}

const SetModal: React.FC<Props> = ({
  setId,
  setName,
  visible,
  onCancel,
  customSet,
  shouldRedirect,
}) => {
  const { data, loading, error } = useQuery<set, setVariables>(setQuery, {
    variables: { id: setId },
  });

  const router = useRouter();
  const { query } = router;
  const { t } = useTranslation('common');
  const theme = useTheme<Theme>();
  const [itemIds, setItemIds] = React.useState<Array<string>>([]);

  const [mutate, { loading: mutationLoading }] = useEquipItemsMutation(
    itemIds,
    customSet,
  );

  const isEditable = React.useContext(EditableContext);

  const onOk = React.useCallback(async () => {
    if (!isEditable) {
      return;
    }
    await mutate();
    onCancel();
    if (shouldRedirect && customSet) {
      router.push(
        {
          pathname: '/',
          query: { customSetId: customSet.id, class: query.class },
        },
        customSet ? `/build/${customSet.id}/` : '/',
      );
    }
  }, [mutate, onCancel, customSet, shouldRedirect, router, isEditable]);

  React.useEffect(() => {
    if (data && !loading && isEditable) {
      setItemIds(data.setById.items.map((item) => item.id));
    }
  }, [data, loading, isEditable]);

  let bodyContent = null;

  if (loading) {
    bodyContent = <Skeleton paragraph={{ rows: 6 }} />;
  } else if (error || !data) {
    bodyContent = <div>{t('ERROR_OCCURRED')}</div>;
  } else {
    bodyContent = (
      <div>
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gridGap: 8,
          }}
        >
          {data.setById.items.map((item) => (
            <div
              key={`item-${item.id}`}
              onClick={() => {
                if (!isEditable) return;
                setItemIds((prev) => {
                  if (prev.includes(item.id)) {
                    return prev.filter((itemId) => itemId !== item.id);
                  }
                  return [...prev, item.id];
                });
              }}
            >
              <div
                css={{
                  ...itemBox(theme),
                }}
              >
                <BasicItemWithStats
                  item={item}
                  overlayCSS={{ zIndex: 1032 }}
                  selected={itemIds.includes(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
        <Divider />
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            [mq[0]]: {
              gridTemplateColumns: 'repeat(2, 1fr)',
            },
            gridGap: 20,
          }}
        >
          {Object.entries(
            groupBy(data.setById.bonuses, (bonus: SetBonus) => bonus.numItems),
          )
            .sort(([a, b]) => Number(a) - Number(b))
            .map(([numItems, bonuses]) => (
              <SetBonuses
                key={`bonuses-${numItems}`}
                t={t}
                count={Number(numItems)}
                bonuses={bonuses}
                css={{
                  flex: '0 0 144px',
                  background: theme.layer?.backgroundLight,
                  borderRadius: 4,
                  padding: 12,
                }}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <Modal
      title={setName}
      visible={visible}
      onCancel={onCancel}
      zIndex={1031}
      confirmLoading={mutationLoading}
      onOk={onOk}
      okButtonProps={{ disabled: !itemIds.length || !isEditable }}
      okText={
        <span css={{ fontSize: '0.75rem' }}>
          {t('EQUIP_ITEMS', { count: itemIds.length })}
        </span>
      }
      cancelText={<span css={{ fontSize: '0.75rem' }}>{t('CANCEL')}</span>}
    >
      {bodyContent}
    </Modal>
  );
};

export default SetModal;
