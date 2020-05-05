/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import { Select, Spin } from 'antd';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';
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
import SpellCard from './SpellCard';

const { Option } = Select;

interface Props {
  customSet?: CustomSet | null;
}

const ClassSpells: React.FC<Props> = ({ customSet }) => {
  const router = useRouter();
  const { query } = router;
  const { data, loading } = useQuery<classes>(classesQuery);
  const { t } = useTranslation('common');
  const theme = useTheme<Theme>();

  const nameToId = data?.classes.reduce((acc, { id, allNames }) => {
    const obj = { ...acc };
    allNames.forEach((className) => {
      obj[className] = id;
    });
    return obj;
  }, {} as { [key: string]: string });

  const idToName = data?.classes.reduce(
    (acc, { id, name }) => ({ ...acc, [id]: name }),
    {} as { [key: string]: string },
  );

  const selectedClassName = Array.isArray(query.class)
    ? query.class[0]
    : query.class;
  const selectedClassId = nameToId?.[selectedClassName] || undefined;

  const { data: classData, loading: classDataLoading } = useQuery<
    classById,
    classByIdVariables
  >(classByIdQuery, {
    variables: { id: selectedClassId },
    skip: !selectedClassId,
  });

  const spellsList = classData?.classById?.spellVariantPairs.reduce(
    (acc, curr) => [...acc, ...curr.spells],
    [] as Array<Spell>,
  );

  return data ? (
    <>
      <Select<string>
        getPopupContainer={(node: HTMLElement) => {
          if (node.parentElement) {
            return node.parentElement;
          }
          return document && document.body;
        }}
        css={{ gridColumn: '1 / -1' }}
        showSearch
        filterOption={(input, option) =>
          (option?.children as string)
            .toLocaleUpperCase()
            .includes(input.toLocaleUpperCase())
        }
        value={selectedClassId}
        onChange={(value: string) => {
          const newQuery: { [key: string]: string | string[] } = {
            ...query,
            ...(idToName && { class: idToName?.[value] }),
          };
          const { customSetId, ...restNewQuery } = newQuery;
          router.replace(
            { pathname: router.pathname, query: newQuery },
            {
              pathname: router.asPath.substring(0, router.asPath.indexOf('?')),
              query: restNewQuery,
            },
          );
        }}
        placeholder={t('SELECT_CLASS')}
      >
        {[...data.classes]
          .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
          .map((dofusClass) => (
            <Option key={dofusClass.id} value={dofusClass.id}>
              {dofusClass.name}
            </Option>
          ))}
      </Select>
      {!classDataLoading && spellsList ? (
        spellsList.map((spell) => (
          <SpellCard key={spell.id} spell={spell} customSet={customSet} />
        ))
      ) : (
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
          {classDataLoading ? <Spin /> : t('SELECT_CLASS_DETAILED')}
        </div>
      )}
    </>
  ) : (
    <div
      css={{
        gridColumn: '1 / -1',
        height: 360,
        marginBottom: 320,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {loading && <Spin />}
    </div>
  );
};

export default ClassSpells;
