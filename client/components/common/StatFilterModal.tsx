/** @jsxImportSource @emotion/react */

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InputNumber, List, Modal, Select } from 'antd';
import { mq, statIcons } from 'common/constants';
import { SharedFilterAction } from 'common/types';
import { antdSelectFilterOption, getImageUrl } from 'common/utils';
import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Stat, StatFilter } from '__generated__/globalTypes';

const { Option } = Select;

type StatFilterAction =
  | {
      type: 'ADD_STAT';
      stat: Stat;
    }
  | {
      type: 'EDIT_MIN_VALUE';
      stat: Stat;
      minValue: number | null;
    }
  | {
      type: 'EDIT_MAX_VALUE';
      stat: Stat;
      maxValue: number | null;
    }
  | {
      type: 'DELETE_STAT';
      stat: Stat;
    };

const reducer = (state: Array<StatFilter>, action: StatFilterAction) => {
  switch (action.type) {
    case 'ADD_STAT': {
      const newState = [...state];
      if (newState.some(({ stat }) => stat === action.stat)) {
        return newState;
      }
      newState.push({
        stat: action.stat,
        minValue: 1,
        maxValue: null,
      });
      return newState;
    }
    case 'DELETE_STAT':
      return state.filter(({ stat }) => stat !== action.stat);
    case 'EDIT_MIN_VALUE':
      return state.map((statFilter) => ({
        ...statFilter,
        minValue:
          statFilter.stat === action.stat
            ? action.minValue
            : statFilter.minValue,
      }));
    case 'EDIT_MAX_VALUE':
      return state.map((statFilter) => ({
        ...statFilter,
        maxValue:
          statFilter.stat === action.stat
            ? action.maxValue
            : statFilter.maxValue,
      }));
    default:
      return state;
  }
};

export default function StatFilterModal({
  open,
  onClose,
  statFilters: statFiltersProp,
  dispatch: dispatchProp,
}: {
  open: boolean;
  onClose: () => void;
  statFilters: Array<StatFilter>;
  dispatch: React.Dispatch<SharedFilterAction>;
}) {
  const { t } = useTranslation(['common', 'stat']);
  const [statFilters, dispatch] = useReducer(reducer, statFiltersProp);
  const statsSet = React.useMemo(() => {
    return new Set(statFilters.map(({ stat }) => stat));
  }, [statFilters]);

  const onAddStat = React.useCallback(({ value }: { value: Stat }) => {
    dispatch({ type: 'ADD_STAT', stat: value });
  }, []);

  return (
    <Modal
      title={t('FILTER_BY_STATS')}
      open={open}
      onCancel={onClose}
      okText={t('OK')}
      onOk={() => {
        dispatchProp({
          type: 'STATS',
          stats: statFilters,
        });
        onClose();
      }}
    >
      {!!statFilters.length && (
        <List
          size="small"
          bordered
          dataSource={statFilters}
          renderItem={(statFilter) => (
            <List.Item
              css={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
            >
              <div css={{ flex: '0 0 auto', display: 'flex', gap: 6 }}>
                <a
                  onClick={() => {
                    dispatch({
                      type: 'DELETE_STAT',
                      stat: statFilter.stat,
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </a>
                <div
                  css={{
                    height: 22,
                    width: 22,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={getImageUrl(statIcons[statFilter.stat])}
                    css={{ height: '80%', width: '80%' }}
                    alt={statFilter.stat}
                  />
                </div>
                {t(statFilter.stat, { ns: 'stat' })}
              </div>
              <InputNumber
                onChange={(value) => {
                  dispatch({
                    type: 'EDIT_MIN_VALUE',
                    minValue: value,
                    stat: statFilter.stat,
                  });
                }}
                onKeyDown={(e) => {
                  // prevents triggering SetBuilderKeyboardShortcuts
                  e.nativeEvent.stopPropagation();
                }}
                css={{ display: 'inline' }}
                value={statFilter.minValue ?? undefined}
              />
            </List.Item>
          )}
        />
      )}
      <div css={{ display: 'flex' }}>
        <Select
          getPopupContainer={(node: HTMLElement) => {
            if (node.parentElement) {
              return node.parentElement;
            }
            return document && document.body;
          }}
          css={{
            minWidth: 0,
            marginTop: 12,
            fontSize: '0.9rem',
            flex: '1 1 0%',
            height: 42,
            [mq[1]]: {
              fontSize: '0.75rem',
              height: 'auto',
            },
            '.ant-select-selector': {
              height: '100%',
            },
          }}
          placeholder={t('STATS_PLACEHOLDER')}
          onChange={onAddStat}
          filterOption={antdSelectFilterOption}
          labelInValue
          onKeyDown={(e) => {
            // prevents triggering SetBuilderKeyboardShortcuts
            e.nativeEvent.stopPropagation();
          }}
          showArrow
          maxTagCount="responsive"
          size="large"
          value={null}
        >
          {Object.values(Stat)
            .sort((s1, s2) =>
              t(s1, { ns: 'stat' }).localeCompare(
                t(s2, { ns: 'stat' }),
                undefined,
                { ignorePunctuation: true },
              ),
            )
            .map((stat) => (
              <Option key={stat} value={stat} disabled={statsSet.has(stat)}>
                {t(stat, { ns: 'stat' })}
              </Option>
            ))}
        </Select>
      </div>
    </Modal>
  );
}
