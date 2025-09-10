/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { useQuery } from '@apollo/client';

import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import Tooltip from 'components/common/Tooltip';
import { Card } from 'antd';
import { itemCardStyle } from 'common/mixins';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'next-i18next';
import { getFaceImageUrl } from 'common/utils';
import { BuildGender } from '__generated__/globalTypes';

interface Props {
  dofusClassId?: string;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
  buildGender: BuildGender;
}

const ClassicClassSelector = ({
  dofusClassId,
  setDofusClassId,
  buildGender,
}: Props) => {
  const { data } = useQuery<classes>(classesQuery);

  const theme = useTheme();
  const { t } = useTranslation('common');

  return (
    <Card
      size="small"
      css={{
        ...itemCardStyle,
        ':hover': {
          border: `1px solid ${theme.border?.default}`,
        },
        border: `1px solid ${theme.border?.default}`,
        background: theme.layer?.background,
      }}
      title={t('SELECT_CLASS')}
    >
      {data && (
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            minHeight: 288,
            gridGap: 16,
          }}
        >
          {[...data.classes]
            .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
            .map((dofusClass) => (
              <Tooltip key={dofusClass.id} title={dofusClass.name}>
                <div
                  css={{
                    cursor: 'pointer',
                    opacity: dofusClass.id === dofusClassId ? 1 : 0.3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <a
                    onClick={() => {
                      setDofusClassId(dofusClass.id);
                    }}
                  >
                    <img
                      src={getFaceImageUrl(dofusClass, buildGender)}
                      css={{
                        width: '100%',
                      }}
                      alt={dofusClass.name}
                    />
                  </a>
                </div>
              </Tooltip>
            ))}
        </div>
      )}
    </Card>
  );
};

export default ClassicClassSelector;
