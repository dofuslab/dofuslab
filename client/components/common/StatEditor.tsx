/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
import { mq, DEBOUNCE_INTERVAL } from 'common/constants';
import { Stat } from '__generated__/globalTypes';
import { useTranslation } from 'i18n';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { InputNumber } from 'antd';
import { Button } from 'antd';
import { red6 } from 'common/mixins';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { useDebounceCallback } from '@react-hook/debounce';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import {
  editCustomSetStats,
  editCustomSetStatsVariables,
} from 'graphql/mutations/__generated__/editCustomSetStats';
import editCustomSetStatsMutation from 'graphql/mutations/editCustomSetStats.graphql';
import { checkAuthentication, calcPointCost } from 'common/utils';
import { useRouter } from 'next/router';
import { StatKey, scrolledStats, baseStats } from 'common/types';

interface IProps {
  customSet?: customSet | null;
}

type StatState = {
  [key in StatKey]: number;
};

type StatStateAction =
  | { type: 'edit'; stat: StatKey; value: number }
  | { type: 'reset' }
  | { type: 'scrollAll' };

const defaultInitialState = {
  baseVitality: 0,
  baseWisdom: 0,
  baseStrength: 0,
  baseIntelligence: 0,
  baseChance: 0,
  baseAgility: 0,
  scrolledVitality: 0,
  scrolledWisdom: 0,
  scrolledStrength: 0,
  scrolledIntelligence: 0,
  scrolledChance: 0,
  scrolledAgility: 0,
};

const statDisplayArray = [
  {
    stat: Stat.VITALITY,
    baseKey: 'baseVitality' as 'baseVitality',
    scrolledKey: 'scrolledVitality' as 'scrolledVitality',
  },
  {
    stat: Stat.WISDOM,
    baseKey: 'baseWisdom' as 'baseWisdom',
    scrolledKey: 'scrolledWisdom' as 'scrolledWisdom',
  },
  {
    stat: Stat.AGILITY,
    baseKey: 'baseAgility' as 'baseAgility',
    scrolledKey: 'scrolledAgility' as 'scrolledAgility',
  },
  {
    stat: Stat.CHANCE,
    baseKey: 'baseChance' as 'baseChance',
    scrolledKey: 'scrolledChance' as 'scrolledChance',
  },
  {
    stat: Stat.STRENGTH,
    baseKey: 'baseStrength' as 'baseStrength',
    scrolledKey: 'scrolledStrength' as 'scrolledStrength',
  },
  {
    stat: Stat.INTELLIGENCE,
    baseKey: 'baseIntelligence' as 'baseIntelligence',
    scrolledKey: 'scrolledIntelligence' as 'scrolledIntelligence',
  },
];

const reducer = (state: StatState, action: StatStateAction) => {
  switch (action.type) {
    case 'edit':
      return { ...state, [action.stat]: action.value } as StatState;
    case 'reset':
      return defaultInitialState;
    case 'scrollAll':
      return scrolledStats.reduce(
        (acc, scrolledStatKey) => ({ ...acc, [scrolledStatKey]: 100 }),
        state,
      );
    default:
      throw new Error('Invalid action type');
  }
};

const getInputNumberStyle = (
  baseKey: string,
  title: string,
  theme: TTheme,
) => ({
  fontSize: '0.75rem',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'relative' as 'relative',
  ...(baseKey === 'baseVitality' && {
    ['&::before']: {
      position: 'absolute' as 'absolute',
      content: `"${title}"`,
      left: 0,
      top: -42,
      height: 36,
      [mq[1]]: {
        top: -30,
        height: 24,
      },
      width: '100%',
      background: theme.statEditor?.categoryBackground,
      color: 'white',
      opacity: 0.8,
      borderRadius: '4px',
      padding: '0 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none' as 'none',
    },
  }),
});

const StatEditor: React.FC<IProps> = ({ customSet }) => {
  const initialState = customSet?.stats
    ? {
        baseVitality: customSet.stats.baseVitality,
        baseWisdom: customSet.stats.baseWisdom,
        baseStrength: customSet.stats.baseStrength,
        baseIntelligence: customSet.stats.baseIntelligence,
        baseChance: customSet.stats.baseChance,
        baseAgility: customSet.stats.baseAgility,
        scrolledVitality: customSet.stats.scrolledVitality,
        scrolledWisdom: customSet.stats.scrolledWisdom,
        scrolledStrength: customSet.stats.scrolledStrength,
        scrolledIntelligence: customSet.stats.scrolledIntelligence,
        scrolledChance: customSet.stats.scrolledChance,
        scrolledAgility: customSet.stats.scrolledAgility,
      }
    : defaultInitialState;
  const [statState, dispatch] = React.useReducer(reducer, initialState);

  const [mutate] = useMutation<editCustomSetStats, editCustomSetStatsVariables>(
    editCustomSetStatsMutation,
    { variables: { customSetId: customSet?.id, stats: statState } },
  );

  const remainingPoints = baseStats.reduce(
    (acc, statKey) => (acc -= calcPointCost(statState[statKey], statKey)),
    ((customSet?.level ?? 200) - 1) * 5,
  );

  const { t } = useTranslation(['common', 'stat']);

  const scrollAll = React.useCallback(() => {
    dispatch({ type: 'scrollAll' });
    checkAndMutate();
  }, [dispatch]);

  const reset = React.useCallback(() => {
    dispatch({ type: 'reset' });
    checkAndMutate();
  }, [dispatch]);

  const client = useApolloClient();

  const router = useRouter();

  const checkAndMutate = React.useCallback(async () => {
    const ok = await checkAuthentication(client, t, customSet);
    if (!ok) return;
    const { data } = await mutate();
    if (data?.editCustomSetStats?.customSet.id !== customSet?.id) {
      router.replace(
        {
          pathname: '/',
          query: { customSetId: data?.editCustomSetStats?.customSet.id },
        },
        `/build/${data?.editCustomSetStats?.customSet.id}`,
        {
          shallow: true,
        },
      );
    }
  }, [mutate, router]);

  const debouncedCheckAndMutate = useDebounceCallback(
    checkAndMutate,
    DEBOUNCE_INTERVAL,
  );

  const theme = useTheme<TTheme>();

  return (
    <div
      css={{
        gridArea: '3 / 1 / 4 / 2',
        marginTop: 24,
        display: 'grid',
        gridAutoRows: 42,
        gridTemplateColumns: '1fr 80px 80px',
        [mq[0]]: {
          gridAutoRows: 36,
          gridArea: '2 / 1 / 3 / 2',
          marginTop: 0,
        },
        [mq[1]]: {
          gridAutoRows: 30,
          gridArea: '3 / 1 / 4 / 2',
          marginTop: 16,
        },
        [mq[2]]: {
          gridArea: '2 / 1 / 3 / 2',
          marginTop: 0,
        },
        gridGap: 4,

        fontSize: '0.75rem',
        justifySelf: 'stretch',
        background: theme.layer?.background,
        borderRadius: 4,
        padding: 4,
        border: `1px solid ${theme.border?.default}`,
      }}
    >
      {statDisplayArray.map(({ stat, baseKey, scrolledKey }) => (
        <React.Fragment key={`stat-editor-${stat}`}>
          <div
            css={{
              fontSize: '0.75rem',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            {t(stat, { ns: 'stat' })}
          </div>
          <InputNumber
            value={statState[baseKey]}
            max={999}
            min={0}
            size="small"
            css={getInputNumberStyle(baseKey, t('BASE'), theme)}
            onFocus={e => {
              e.currentTarget.setSelectionRange(
                0,
                String(statState[baseKey]).length,
              );
            }}
            onChange={(value?: number) => {
              if (typeof value !== 'number') return;
              dispatch({ type: 'edit', stat: baseKey, value });
              debouncedCheckAndMutate();
            }}
          />
          <InputNumber
            value={statState[scrolledKey]}
            max={100}
            min={0}
            size="small"
            css={getInputNumberStyle(baseKey, t('SCROLLED'), theme)}
            onFocus={e => {
              e.currentTarget.setSelectionRange(
                0,
                String(statState[baseKey]).length,
              );
            }}
            onChange={(value?: number) => {
              if (typeof value !== 'number') return;
              dispatch({ type: 'edit', stat: scrolledKey, value });
              debouncedCheckAndMutate();
            }}
          />
        </React.Fragment>
      ))}
      <Button
        css={{
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifySelf: 'end',
          padding: '4px 8px',
          height: '100%',
        }}
        onClick={reset}
      >
        <FontAwesomeIcon icon={faRedo} css={{ marginRight: 8 }} />
        {t('RESET_ALL')}
      </Button>
      <div
        css={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 500,
          background: theme.statEditor?.remainingPointsBackground,
          borderRadius: 4,
          color: remainingPoints < 0 ? red6 : 'inherit',
        }}
      >
        {remainingPoints}
      </div>
      <Button css={{ fontSize: '0.75rem', height: '100%' }} onClick={scrollAll}>
        100
      </Button>
    </div>
  );
};

export default StatEditor;
