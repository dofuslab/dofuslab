/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import { Card, Skeleton } from 'antd';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';
import { useTheme } from 'emotion-theming';

import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import {
  classById,
  classByIdVariables,
} from 'graphql/queries/__generated__/classById';
import classByIdQuery from 'graphql/queries/classById.graphql';
import { itemCardStyle } from 'common/mixins';
import { Theme } from 'common/types';
import { CustomSet } from 'common/type-aliases';
import SpellVariantPairCard from './SpellVariantPairCard';

interface Props {
  customSet?: CustomSet | null;
}

const ClassicClassSpells: React.FC<Props> = ({ customSet }) => {
  const router = useRouter();
  const { query } = router;
  const { data } = useQuery<classes>(classesQuery);
  const theme = useTheme<Theme>();

  const nameToId = data?.classes.reduce((acc, { id, allNames }) => {
    const obj = { ...acc };
    allNames.forEach((className) => {
      obj[className] = id;
    });
    return obj;
  }, {} as { [key: string]: string });

  const selectedClassName = Array.isArray(query.class)
    ? query.class[0]
    : query.class;
  const selectedClassId = selectedClassName && nameToId?.[selectedClassName];

  const { data: classData, loading: classDataLoading } = useQuery<
    classById,
    classByIdVariables
  >(classByIdQuery, {
    variables: { id: selectedClassId },
    skip: !selectedClassId,
  });

  const spellVariantPairs = classData?.classById?.spellVariantPairs;

  return data ? (
    <>
      {!classDataLoading && spellVariantPairs
        ? spellVariantPairs.map((pair) => (
            <SpellVariantPairCard
              key={pair.id}
              spellVariantPair={pair}
              customSet={customSet}
            />
          ))
        : classDataLoading &&
          Array(22)
            .fill(null)
            .map((_, idx) => (
              <Card
                size="small"
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                css={{
                  ...itemCardStyle,
                  border: `1px solid ${theme.border?.default}`,
                  background: theme.layer?.background,
                }}
              >
                <Skeleton loading title active paragraph={{ rows: 6 }} />
              </Card>
            ))}
    </>
  ) : null;
};

export default ClassicClassSpells;
