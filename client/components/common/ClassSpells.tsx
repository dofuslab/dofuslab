/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Select, Card, Skeleton } from 'antd';
import { useQuery } from '@apollo/client';
import { useTheme } from 'emotion-theming';

import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { useTranslation } from 'i18n';
import {
  classById,
  classByIdVariables,
} from 'graphql/queries/__generated__/classById';
import classByIdQuery from 'graphql/queries/classById.graphql';
import { Theme } from 'common/types';
import { CustomSet, Spell } from 'common/type-aliases';
import { itemCardStyle } from 'common/mixins';
import SpellCard from './SpellCard';

const { Option } = Select;

interface Props {
  customSet?: CustomSet | null;
  dofusClassId?: string;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ClassSpells: React.FC<Props> = ({
  customSet,
  dofusClassId,
  setDofusClassId,
}) => {
  const { data } = useQuery<classes>(classesQuery);
  const { t } = useTranslation('common');
  const theme = useTheme<Theme>();

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
      <Select<string>
        getPopupContainer={(node: HTMLElement) => {
          if (node.parentElement) {
            return node.parentElement;
          }
          return document && document.body;
        }}
        size="large"
        css={{ gridColumn: '1 / -1' }}
        showSearch
        filterOption={(input, option) => {
          return (option?.children[1] as string)
            .toLocaleUpperCase()
            .includes(input.toLocaleUpperCase());
        }}
        value={dofusClassId}
        onChange={(value: string) => {
          setDofusClassId(value);
        }}
        placeholder={t('SELECT_CLASS')}
      >
        {[...data.classes]
          .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
          .map((dofusClass) => (
            <Option key={dofusClass.id} value={dofusClass.id}>
              <img
                src={dofusClass.faceImageUrl}
                alt={dofusClass.name}
                css={{ width: 20, marginRight: 8 }}
              />
              {dofusClass.name}
            </Option>
          ))}
      </Select>
      {content}
    </>
  ) : null;
};

export default ClassSpells;
