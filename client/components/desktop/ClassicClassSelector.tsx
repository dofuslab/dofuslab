/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';

import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import Tooltip from 'components/common/Tooltip';
import Link from 'next/link';
import { Card } from 'antd';
import { itemCardStyle } from 'common/mixins';
import { useTheme } from 'emotion-theming';
import { TTheme } from 'common/themes';

const ClassicClassSelector: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  const { data } = useQuery<classes>(classesQuery);
  const selectedClassName = Array.isArray(query.class)
    ? query.class[0]
    : query.class;

  const theme = useTheme<TTheme>();

  return (
    <Card
      size="small"
      css={{
        ...itemCardStyle,
        [':hover']: {
          border: `1px solid ${theme.border?.default}`,
        },
        border: `1px solid ${theme.border?.default}`,
        background: theme.layer?.background,
      }}
    >
      {data ? (
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            minHeight: 288,
          }}
        >
          {[...data.classes]
            .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
            .map(dofusClass => (
              <Tooltip
                key={dofusClass.id}
                title={dofusClass.name}
                align={{ offset: [0, 12] }}
              >
                <div
                  css={{
                    cursor: 'pointer',
                    opacity: dofusClass.allNames.includes(selectedClassName)
                      ? 1
                      : 0.3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <Link
                    href={{
                      pathname: '/',
                      query: { ...query, class: dofusClass.name },
                    }}
                    as={`/build/${
                      query.customSetId ? `${query.customSetId}` : ''
                    }?class=${dofusClass.name}`}
                    shallow
                  >
                    <img
                      src={dofusClass.imageUrl}
                      css={{
                        width: '100%',
                      }}
                    />
                  </Link>
                </div>
              </Tooltip>
            ))}
        </div>
      ) : (
        <div />
      )}
    </Card>
  );
};

export default ClassicClassSelector;
