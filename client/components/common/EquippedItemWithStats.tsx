/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Popover } from 'antd';
import { useTheme } from 'emotion-theming';

import {
  popoverTitleStyle,
  itemImageBox,
  selected as selectedBox,
  itemImageDimensions,
  gold5,
  popoverShadow,
} from 'common/mixins';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagic,
  faTimes,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useDeleteItemMutation, EditableContext } from 'common/utils';
import { useTranslation } from 'i18n';
import { mq } from 'common/constants';
import { Media } from 'components/common/Media';
import { BuildError, Theme } from 'common/types';

import { BrokenImagePlaceholder } from 'common/wrappers';
import { EquippedItem, CustomSet, ItemSet } from 'common/type-aliases';
import { TooltipPlacement } from 'antd/lib/tooltip';
import EquippedItemCard from '../desktop/EquippedItemCard';

const wrapperStyles = {
  position: 'absolute' as 'absolute',
  right: 6,
  top: 6,
  fontSize: '1rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 4,
  margin: -4,
  transition: 'opacity 0.3s ease-in-out',
  opacity: 0.3,
  [mq[1]]: {
    fontSize: '0.75rem',
    opacity: 0,
  },
};

interface Props {
  equippedItem: EquippedItem;
  selected: boolean;
  customSet: CustomSet;
  itemSlotId: string;
  openMageModal: (equippedItem: EquippedItem) => void;
  openSetModal: (set: ItemSet) => void;
  errors?: Array<BuildError>;
  className?: string;
  popoverPlacement?: TooltipPlacement;
}

const EquippedItemWithStats: React.FC<Props> = ({
  equippedItem,
  selected,
  customSet,
  itemSlotId,
  openMageModal,
  openSetModal,
  errors,
  className,
  popoverPlacement,
}) => {
  const deleteItem = useDeleteItemMutation(equippedItem.slot.id, customSet);
  const stopPropagationCallback = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // prevent selection of item slot
      e.stopPropagation();
    },
    [],
  );
  const onDelete = React.useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      e.stopPropagation();
      if (deleteItem) {
        deleteItem();
      }
    },
    [deleteItem],
  );

  const { t } = useTranslation('common');
  const theme = useTheme<Theme>();
  const [brokenImage, setBrokenImage] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const isEditable = React.useContext(EditableContext);

  const content = (
    <ClassNames>
      {({ css, cx }) => {
        const wrapperClass = css(wrapperStyles);
        return (
          <div
            ref={contentRef}
            className={cx(
              css(
                itemImageBox(theme, isEditable),
                css(selected ? selectedBox(theme) : {}),
                css({
                  '&:hover': {
                    [`.${wrapperClass}`]: {
                      opacity: 0.3,
                      '&:hover': {
                        opacity: 1,
                      },
                    },
                  },
                }),
              ),
              className,
            )}
          >
            {brokenImage ? (
              <BrokenImagePlaceholder
                css={{ ...itemImageDimensions, fontSize: '1.2rem' }}
              />
            ) : (
              <img
                src={equippedItem.item.imageUrl}
                css={itemImageDimensions}
                onError={() => setBrokenImage(true)}
                alt={equippedItem.item.name}
              />
            )}
            {(equippedItem.exos.length > 0 ||
              equippedItem.weaponElementMage) && (
              <FontAwesomeIcon
                icon={faMagic}
                css={{
                  position: 'absolute',
                  left: 6,
                  bottom: 6,
                  fontSize: '0.75rem',
                  opacity: 0.3,
                }}
              />
            )}
            {errors?.length && (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                css={{
                  position: 'absolute',
                  left: 6,
                  top: 6,
                  fontSize: '0.75rem',
                  color: gold5,
                }}
              />
            )}
            {isEditable && (
              <div className={wrapperClass} onClick={onDelete}>
                <FontAwesomeIcon icon={faTimes} />
              </div>
            )}
          </div>
        );
      }}
    </ClassNames>
  );

  return (
    <>
      <Media greaterThanOrEqual="xs">
        <ClassNames>
          {({ css }) => (
            <Popover
              placement={popoverPlacement || 'bottomLeft'}
              title={
                <div
                  css={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                  }}
                  onClick={stopPropagationCallback}
                >
                  <div>{equippedItem.item.name}</div>
                  <div
                    css={{
                      marginLeft: 16,
                      [mq[1]]: { marginLeft: 8 },
                      fontWeight: 400,
                      fontSize: '0.75rem',
                    }}
                  >
                    {t('LEVEL_ABBREVIATION')} {equippedItem.item.level}
                  </div>
                </div>
              }
              content={
                <EquippedItemCard
                  equippedItem={equippedItem}
                  itemSlotId={itemSlotId}
                  customSet={customSet}
                  openMageModal={openMageModal}
                  openSetModal={openSetModal}
                  stopPropagationCallback={stopPropagationCallback}
                  errors={errors}
                />
              }
              overlayClassName={css({
                ...popoverTitleStyle,
                '.ant-popover-content': {
                  maxHeight: contentRef.current
                    ? `calc(100vh - ${
                        contentRef.current.offsetTop +
                        contentRef.current.offsetHeight +
                        20
                      }px)`
                    : undefined,
                  overflow: 'auto',
                },
                '.ant-popover-inner-content': { padding: 0 },
                boxShadow: popoverShadow,
                maxWidth: 288,
              })}
              autoAdjustOverflow={{ adjustX: 1, adjustY: 0 }}
            >
              <div>{content}</div>
            </Popover>
          )}
        </ClassNames>
      </Media>
      <Media lessThan="xs">{content}</Media>
    </>
  );
};

export default EquippedItemWithStats;
