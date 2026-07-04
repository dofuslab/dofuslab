/** @jsxImportSource @emotion/react */

import type { SetStateAction, Dispatch } from 'react';

import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { mq } from 'common/constants';
import { Checkbox, Dropdown } from 'antd';
import { ItemType } from 'common/type-aliases';
import { ellipsis } from 'common/mixins';
import { getImageUrl } from 'common/utils';
import type { SlotGroup } from './Selector';

const { Group: CheckboxGroup } = Checkbox;

interface GroupTypeFilterPopupProps {
  group: SlotGroup;
  checkedIds: Array<string>;
  onChangeGroupTypes: (group: SlotGroup, newIds: Array<string>) => void;
}

const GroupTypeFilterPopup = ({
  group,
  checkedIds,
  onChangeGroupTypes,
}: GroupTypeFilterPopupProps) => {
  const theme = useTheme();

  return (
    <div
      css={{
        backgroundColor: theme.layer?.background,
        border: `1px solid ${theme.border?.default}`,
        borderRadius: 4,
        padding: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <CheckboxGroup<string>
        value={checkedIds}
        onChange={(newIds) => onChangeGroupTypes(group, newIds)}
        options={[...group.itemTypes]
          .sort((t1, t2) => t1.name.localeCompare(t2.name))
          .map((type) => ({
            label: type.name,
            value: type.id,
          }))}
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          '.ant-checkbox-group-item': {
            ...ellipsis,
            fontSize: '0.75rem',
          },
        }}
      />
    </div>
  );
};

interface SlotGroupFilterRowProps {
  group: SlotGroup;
  itemTypeIds: Set<string>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  toggleGroup: (group: SlotGroup, isChecked: boolean) => void;
  onChangeGroupTypes: (group: SlotGroup, newIds: Array<string>) => void;
}

const SlotGroupFilterRow = ({
  group,
  itemTypeIds,
  isOpen,
  onOpenChange,
  toggleGroup,
  onChangeGroupTypes,
}: SlotGroupFilterRowProps) => {
  const theme = useTheme();
  const groupIds = group.itemTypes.map((type) => type.id);
  const checkedIds = groupIds.filter((id) => itemTypeIds.has(id));
  const checked = groupIds.length > 0 && checkedIds.length === groupIds.length;
  const indeterminate =
    checkedIds.length > 0 && checkedIds.length < groupIds.length;
  const isExpandable = group.itemTypes.length > 1;

  const renderPopup = useCallback(
    () => (
      <GroupTypeFilterPopup
        group={group}
        checkedIds={checkedIds}
        onChangeGroupTypes={onChangeGroupTypes}
      />
    ),
    [group, checkedIds, onChangeGroupTypes],
  );

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        width: 144,
        minWidth: 0,
        [mq[1]]: { width: 120 },
      }}
    >
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onChange={() => toggleGroup(group, checked)}
        css={{
          flex: '1 1 auto',
          minWidth: 0,
          alignItems: 'center',
          '.ant-checkbox + span': {
            ...ellipsis,
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '0.75rem',
            maxWidth: '100%',
            paddingInlineEnd: 4,
          },
        }}
      >
        <img
          src={getImageUrl(group.imageUrl)}
          alt=""
          css={{ width: 16, height: 16, marginRight: 4, flexShrink: 0 }}
        />
        <span css={ellipsis}>{group.name}</span>
      </Checkbox>
      <div
        css={{
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isExpandable && (
          <Dropdown
            trigger={['click']}
            open={isOpen}
            onOpenChange={onOpenChange}
            popupRender={renderPopup}
          >
            <button
              type="button"
              aria-label={group.name}
              css={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <FontAwesomeIcon
                icon={isOpen ? faChevronUp : faChevronDown}
                size="xs"
                color="white"
                css={{
                  '&:hover': {
                    color: theme.text?.primary,
                  },
                }}
              />
            </button>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

interface Props {
  itemTypes: Array<ItemType>;
  slotGroups: Array<SlotGroup>;
  itemTypeIds: Set<string>;
  setItemTypeIds: Dispatch<SetStateAction<Set<string>>>;
  // group by slot (with an expandable dropdown for multi-type slots) when there's
  // no single slot in scope; when a slot is present render all checkboxes for it
  groupBySlot: boolean;
}

const ItemTypeFilter = ({
  itemTypes,
  slotGroups,
  itemTypeIds,
  setItemTypeIds,
  groupBySlot,
}: Props) => {
  const onChangeItemTypeIds = useCallback(
    (newItemTypeIds: Array<string>) => setItemTypeIds(new Set(newItemTypeIds)),
    [setItemTypeIds],
  );

  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);

  const toggleGroup = useCallback(
    (group: SlotGroup, isChecked: boolean) => {
      setItemTypeIds((prev) => {
        const next = new Set(prev);
        group.itemTypes.forEach((type) => {
          if (isChecked) {
            next.delete(type.id);
          } else {
            next.add(type.id);
          }
        });
        return next;
      });
    },
    [setItemTypeIds],
  );

  const onChangeGroupTypes = useCallback(
    (group: SlotGroup, newIds: Array<string>) => {
      setItemTypeIds((prev) => {
        const next = new Set(prev);
        group.itemTypes.forEach((type) => next.delete(type.id));
        newIds.forEach((id) => next.add(id));
        return next;
      });
    },
    [setItemTypeIds],
  );

  if (!groupBySlot && itemTypes.length <= 1) {
    return null;
  }

  if (groupBySlot) {
    return (
      <div
        css={{
          gridColumn: '1 / -1',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          marginTop: 8,
          gap: 4,
        }}
      >
        {slotGroups.map((group) => (
          <SlotGroupFilterRow
            key={group.key}
            group={group}
            itemTypeIds={itemTypeIds}
            isOpen={openGroupKey === group.key}
            onOpenChange={(open) => setOpenGroupKey(open ? group.key : null)}
            toggleGroup={toggleGroup}
            onChangeGroupTypes={onChangeGroupTypes}
          />
        ))}
      </div>
    );
  }

  return (
    <CheckboxGroup<string>
      value={Array.from(itemTypeIds)}
      onChange={onChangeItemTypeIds}
      options={[...itemTypes]
        .sort((t1, t2) => t1.name.localeCompare(t2.name))
        .map((type) => ({
          label: type.name,
          value: type.id,
        }))}
      css={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: 8,
        lineHeight: '1.4rem',
        [mq[1]]: {
          lineHeight: 'normal',
        },
        '.ant-checkbox-group-item': {
          ...ellipsis,
          flex: '0 1 144px',
          [mq[1]]: {
            flexBasis: '120px',
          },
          minWidth: 0,
          marginTop: 4,
          fontSize: '0.75rem',
          '&:last-of-type': {
            marginRight: 8,
          },
        },
      }}
    />
  );
};

export default ItemTypeFilter;
