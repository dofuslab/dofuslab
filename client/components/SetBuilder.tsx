/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

import { STAT_GROUPS, mq } from 'common/constants';
import ItemSelector from './ItemSelector';
import Layout from './Layout';
import StatTable from './StatTable';
import { ResponsiveGrid } from 'common/wrappers';

import {
  customSet,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import { getStatsFromCustomSet } from 'common/utils';
import SetHeader from './SetHeader';
import EquipmentSlots from './EquipmentSlots';

const SetBuilder: React.FC = () => {
  const router = useRouter();
  const { id: setId } = router.query;

  const { data: customSetData } = useQuery<customSet, customSetVariables>(
    CustomSetQuery,
    { variables: { id: setId }, skip: !setId },
  );

  const [selectedItemSlotId, selectItemSlot] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    const onClickBody = () => {
      selectItemSlot(null);
    };
    window.addEventListener('click', onClickBody);
    return () => {
      window.removeEventListener('click', onClickBody);
    };
  }, []);

  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSetData?.customSetById),
    [customSetData],
  );

  return (
    <Layout>
      <SetHeader customSet={customSetData?.customSetById} />
      <EquipmentSlots
        customSet={customSetData?.customSetById}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlotId}
      />
      <div
        css={{
          flex: '1 1 auto',
          overflowX: 'hidden',
          paddingLeft: 20,
          display: 'flex',
        }}
      >
        <div css={{ flex: '0 1 600px', overflow: 'auto' }}>
          <ResponsiveGrid
            numColumns={[2, 2, 2, 2, 2, 2]}
            css={{ margin: '12px 0 20px' }}
          >
            {STAT_GROUPS.map((group, idx) => (
              <StatTable
                key={idx}
                group={group}
                statsFromCustomSet={statsFromCustomSet}
                customSet={customSetData?.customSetById}
              />
            ))}
          </ResponsiveGrid>
        </div>
        <div
          css={{
            display: 'none',
            marginTop: 12,
            padding: '0 20px',
            [mq[1]]: {
              display: 'block',
              flex: 1,
            },
            overflow: 'auto',
          }}
        >
          <ItemSelector
            selectedItemSlotId={selectedItemSlotId}
            customSet={customSetData?.customSetById}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SetBuilder;
