/** @jsx jsx */

import React from 'react';
import { ClassNames, jsx } from '@emotion/core';
import { Modal, Table } from 'antd';

import { useTranslation } from 'i18n';
import { useTheme } from 'emotion-theming';
import { Theme } from 'common/types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const shortcuts = [
  { operation: 'SELECT_SEARCH_BAR', shortcuts: { keys: ['ENTER', 'SPACE'] } },
  { operation: 'DESELECT_SEARCH_BAR', shortcuts: { keys: ['ESCAPE'] } },
  { operation: 'DESELECT_ITEM_SLOT', shortcuts: { keys: ['ESCAPE'] } },
  {
    operation: 'SELECT_ITEM_SLOTS',
    shortcuts: { keys: ['ESCAPE'] },
    expandableShortcuts: [
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
    ],
  },
  {
    operation: 'NAVIGATE_ITEM_SLOTS',
    shortcuts: { keysElement: <div>1...9</div> },
  },
  {
    operation: 'EQUIP_NTH_ITEM_SET',
    shortcuts: { keysElement: <div>1...9</div> },
  },
  {
    operation: 'DELETE_SELECTED_ITEM',
    shortcuts: { keys: ['BACKSPACE', 'DELETE'] },
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
  const { t } = useTranslation('keyboard_shortcuts');

  return (
    <Modal
      visible={visible}
      title={t('KEYBOARD_SHORTCUTS')}
      onCancel={onClose}
      footer={null}
    >
      {/* <div
        css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}
      >
        {shortcuts.map(({ operation, keys, keysElement }) => (
          <React.Fragment key={operation}>
            <div>{t(`OPERATIONS.${operation}`)}</div>
            <div>
              {keysElement ||
                keys?.map((k) => (
                  <KeyboardKey key={k}>{t(`KEYS.${k}`)}</KeyboardKey>
                ))}
            </div>
          </React.Fragment>
        ))}
      </div> */}

      <Table
        dataSource={shortcuts}
        pagination={{ hideOnSinglePage: true }}
        expandable={{ rowExpandable: (record) => !!record.expandableShortcuts }}
      >
        <Table.Column
          title={t('KEYBOARD_SHORTCUT')}
          dataIndex="shortcuts"
          key="shortcut"
          render={(v) => {
            if (v.keysElement) {
              return v.keysElement;
            }

            return (
              <div css={{ display: 'flex', gap: 4 }}>
                {v.keys?.map((k) => (
                  <KeyboardKey key={k}>{t(`KEYS.${k}`)}</KeyboardKey>
                ))}
              </div>
            );
          }}
        />
        <Table.Column
          title={t('DESCRIPTION')}
          dataIndex={['operation']}
          key="description"
          render={(k) => {
            return t(`OPERATIONS.${k}`);
          }}
        />
      </Table>
    </Modal>
  );
};

export default KeyboardShortcutsModal;
