/** @jsxImportSource @emotion/react */

import { Card, Skeleton } from 'antd';
import { useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';

import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { useTranslation } from 'next-i18next';
import {
  classById,
  classByIdVariables,
} from 'graphql/queries/__generated__/classById';
import classByIdQuery from 'graphql/queries/classById.graphql';
import { CustomSet, Spell } from 'common/type-aliases';
import { itemCardStyle } from 'common/mixins';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import SpellCard from './SpellCard';
import ClassSelect from './ClassSelect';

interface Props {
  customSet?: CustomSet | null;
  dofusClassId?: string;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ClassSpells = ({ customSet, dofusClassId, setDofusClassId }: Props) => {
  const { data } = useQuery<classes>(classesQuery);
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { data: currentUserData } =
    useQuery<CurrentUserQueryType>(currentUserQuery);

  const { data: classData, loading: classDataLoading } = useQuery<
    classById,
    classByIdVariables
  >(classByIdQuery, {
    variables: { id: dofusClassId },
    skip: !dofusClassId,
  });

  const spellsList = classData?.classById?.spellVariantPairs.reduce(
    (acc, curr) => [...acc, ...curr.spells],
    [] as Array<Spell>,
  );

  let content = (
    <div
      css={{
        height: 360,
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: theme.text?.light,
        fontWeight: 500,
        marginBottom: 320,
      }}
    >
      {t('SELECT_CLASS_DETAILED')}
    </div>
  );

  if (classDataLoading) {
    content = (
      <>
        {Array(22)
          .fill(null)
          .map((_, i) => (
            <Card
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              size="small"
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
    );
  } else if (spellsList) {
    content = (
      <>
        {spellsList.map((spell) => (
          <SpellCard key={spell.id} spell={spell} customSet={customSet} />
        ))}
      </>
    );
  }

  return data ? (
    <>
      <ClassSelect
        value={dofusClassId}
        onChange={setDofusClassId}
        css={{ gridColumn: '1 / -1' }}
        buildGender={
          customSet?.buildGender ||
          currentUserData?.currentUser?.settings.buildGender
        }
      />
      {content}
    </>
  ) : null;
};

export default ClassSpells;
