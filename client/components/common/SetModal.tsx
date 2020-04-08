/** @jsx jsx */

import React from 'react';
import { groupBy } from 'lodash';
import { jsx } from '@emotion/core';
import { Modal, Divider, Skeleton } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import Router from 'next/router';

import {
  set,
  setVariables,
  set_setById_bonuses,
} from 'graphql/queries/__generated__/set';
import setQuery from 'graphql/queries/set.graphql';
import { useTranslation } from 'i18n';
import BasicItemWithStats from '../desktop/BasicItemWithStats';
import { SetBonuses } from 'common/wrappers';
import { gray2, itemBox } from 'common/mixins';
import { mq } from 'common/constants';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { useEquipSetMutation } from 'common/utils';

interface IProps {
  setId: string;
  setName: string;
  visible: boolean;
  onCancel: () => void;
  customSet?: customSet | null;
  isMobile?: boolean;
}

const SetModal: React.FC<IProps> = ({
  setId,
  setName,
  visible,
  onCancel,
  customSet,
  isMobile,
}) => {
  const { data, loading, error } = useQuery<set, setVariables>(setQuery, {
    variables: { id: setId },
  });

  const [mutate, { loading: mutationLoading }] = useEquipSetMutation(
    setId,
    customSet,
  );

  const { t } = useTranslation('common');

  const onOk = React.useCallback(async () => {
    await mutate();
    onCancel();
    if (isMobile && customSet) {
      Router.push(
        { pathname: '/index', query: { customSetId: customSet.id } },
        customSet ? `/build/${customSet.id}` : '/',
      );
    }
  }, [mutate, onCancel, customSet, isMobile]);

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
            gridTemplateColumns: 'repeat(3, 1fr)',
            [mq[0]]: {
              gridTemplateColumns: 'repeat(5, 1fr)',
            },
            gridGap: 12,
          }}
        >
          {data.setById.items.map(item => (
            <div
              key={`item-${item.id}`}
              css={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div css={{ ...itemBox }}>
                <BasicItemWithStats item={item} overlayCSS={{ zIndex: 1032 }} />
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
            groupBy(
              data.setById.bonuses,
              (bonus: set_setById_bonuses) => bonus.numItems,
            ),
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
                  background: gray2,
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
      title={<div css={{ fontSize: '0.8rem' }}>{setName}</div>}
      visible={visible}
      onCancel={onCancel}
      zIndex={1031}
      confirmLoading={mutationLoading}
      onOk={onOk}
      okText={<span css={{ fontSize: '0.75rem' }}>{t('EQUIP_SET')}</span>}
      cancelText={<span css={{ fontSize: '0.75rem' }}>{t('CANCEL')}</span>}
    >
      {bodyContent}
    </Modal>
  );
};

export default SetModal;
