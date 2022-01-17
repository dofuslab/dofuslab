/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Divider, List, Modal, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';

import { useTranslation } from 'i18n';
import { useTheme } from 'emotion-theming';
import { Theme } from 'common/types';
import { TFunction } from 'next-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const expandableShortcuts = [
  { slot: 'HAT', key: 'H' },
  { slot: 'CLOAK', key: 'C' },
  { slot: 'AMULET', key: 'A' },
  { slot: 'RING', key: 'R' },
  { slot: 'BELT', key: 'B' },
  { slot: 'BOOTS', key: 'O' },
  { slot: 'WEAPON', key: 'W' },
  { slot: 'SHIELD', key: 'S' },
  { slot: 'DOFUS', key: 'D' },
  { slot: 'PET', key: 'P' },
];

const shortcuts = [
  { operation: 'SELECT_SEARCH_BAR', shortcuts: { keys: ['ENTER', 'SPACE'] } },
  { operation: 'DESELECT_SEARCH_BAR', shortcuts: { keys: ['ESCAPE'] } },
  { operation: 'DESELECT_ITEM_SLOT', shortcuts: { keys: ['ESCAPE'] } },
  {
    operation: 'SELECT_ITEM_SLOT',
    shortcuts: { letterKeys: expandableShortcuts.map((s) => s.key) },
    expandableShortcuts,
  },
  {
    operation: 'NAVIGATE_ITEM_SLOTS',
    shortcuts: {
      keysElement: (
        <div css={{ display: 'flex', gap: 4 }}>
          <KeyboardKey>
            <FontAwesomeIcon icon={faArrowLeft} />
          </KeyboardKey>
          <KeyboardKey>
            <FontAwesomeIcon icon={faArrowRight} />
          </KeyboardKey>
        </div>
      ),
    },
  },
  { operation: 'TOGGLE_ITEM_SET_SWITCH', shortcuts: { letterKeys: ['I'] } },
  {
    operation: 'EQUIP_NTH_ITEM_SET',
    shortcuts: {
      keysElement: (
        <div>
          {Array(9)
            .fill(null)
            .map((_, idx) => (
              <KeyboardKey>{idx + 1}</KeyboardKey>
            ))}
        </div>
      ),
    },
  },
  {
    operation: 'DELETE_SELECTED_ITEM',
    shortcuts: { keys: ['BACKSPACE', 'DELETE'] },
  },
];

const getColumns: (t: TFunction) => Array<ColumnType<typeof shortcuts[0]>> = (
  t: TFunction,
) => [
  {
    dataIndex: 'shortcuts',
    render: (v) => {
      if (v.keysElement) {
        return v.keysElement;
      }

      return (
        <div css={{ display: 'flex', gap: 4 }}>
          {v.keys?.map((k: string) => (
            <KeyboardKey key={k}>{t(`KEYS.${k}`)}</KeyboardKey>
          ))}
          {v.letterKeys?.map((k: string) => (
            <KeyboardKey key={k}>{k}</KeyboardKey>
          ))}
        </div>
      );
    },
    width: 120,
  },
  Table.EXPAND_COLUMN,
  {
    dataIndex: 'operation',
    render: (k) => {
      return t(`OPERATIONS.${k}`);
    },
  },
];

function KeyboardKey({ children }: { children: React.ReactNode }) {
  const theme = useTheme<Theme>();
  return (
    <span
      css={{
        display: 'inline-block',
        border: `1px solid ${theme.border?.light}`,
        textTransform: 'uppercase',
        fontSize: '0.6rem',
        borderRadius: 4,
        padding: '1px 4px',
        boxShadow: `inset 0 -1px 0 ${theme.border?.light}`,
      }}
    >
      {children}
    </span>
  );
}

const KeyboardShortcutsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { t } = useTranslation('keyboard_shortcut');

  return (
    <Modal
      visible={visible}
      title={t('KEYBOARD_SHORTCUTS')}
      onCancel={onClose}
      footer={null}
    >
      <div>{t('ONLY_AVAILABLE_ADVANCED_MODE')}</div>
      <Divider css={{ margin: '16px 0 0' }} />
      <Table
        dataSource={shortcuts}
        pagination={{ hideOnSinglePage: true }}
        expandable={{
          defaultExpandAllRows: true,
          rowExpandable: (record) => !!record.expandableShortcuts,
          expandedRowRender: (record) => (
            <List
              grid={{ gutter: 8, column: 3 }}
              dataSource={record.expandableShortcuts}
              renderItem={(es) => (
                <List.Item
                  css={{
                    display: 'flex !important',
                    justifyContent: 'flex-start',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <KeyboardKey>{es.key}</KeyboardKey>
                  </div>
                  <div>{t(`SLOTS.${es.slot}`)}</div>
                </List.Item>
              )}
              size="small"
            />
          ),
        }}
        showHeader={false}
        columns={getColumns(t)}
      ></Table>
    </Modal>
  );
};

export default KeyboardShortcutsModal;
