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
import {
  customSet_equippedItems,
  customSet,
} from 'graphql/fragments/__generated__/customSet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagic,
  faTimes,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useDeleteItemMutation } from 'common/utils';
import { useTranslation } from 'i18n';
import EquippedItemCard from '../desktop/EquippedItemCard';
import { mq } from 'common/constants';
import { item_set } from 'graphql/fragments/__generated__/item';
import { Media } from 'components/common/Media';
import { IError } from 'common/types';
import { TTheme } from 'common/themes';
import { BrokenImagePlaceholder } from 'common/wrappers';

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

interface IProps {
  equippedItem: customSet_equippedItems;
  selected: boolean;
  customSet: customSet;
  itemSlotId: string;
  openMageModal: (equippedItem: customSet_equippedItems) => void;
  openSetModal: (set: item_set) => void;
  errors?: Array<IError>;
}

const EquippedItemWithStats: React.FC<IProps> = ({
  equippedItem,
  selected,
  customSet,
  itemSlotId,
  openMageModal,
  openSetModal,
  errors,
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
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      deleteItem && deleteItem();
    },
    [deleteItem],
  );
  const { t } = useTranslation('common');
  const theme = useTheme<TTheme>();
  const [brokenImage, setBrokenImage] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const content = (
    <ClassNames>
      {({ css }) => {
        const wrapperClass = css(wrapperStyles);
        return (
          <div
            ref={contentRef}
            css={{
              ...itemImageBox(theme),
              ...(selected && { ...selectedBox(theme) }),
              ['&:hover']: {
                [`.${wrapperClass}`]: {
                  opacity: 0.3,
                  ['&:hover']: {
                    opacity: 1,
                  },
                },
              },
            }}
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
            <div className={wrapperClass} onClick={onDelete}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
        );
      }}
    </ClassNames>
  );

  return (
    <>
      <Media greaterThanOrEqual="xs">
        <ClassNames>
          {({ css }) => {
            return (
              <Popover
                placement="bottomLeft"
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
                      ? `calc(100vh - ${contentRef.current.offsetTop +
                          contentRef.current.offsetHeight +
                          20}px)`
                      : undefined,
                    overflow: 'auto',
                  },
                  '.ant-popover-inner-content': { padding: 0 },
                  boxShadow: popoverShadow,
                  maxWidth: 288,
                })}
                autoAdjustOverflow={false}
              >
                <div>{content}</div>
              </Popover>
            );
          }}
        </ClassNames>
      </Media>
      <Media lessThan="xs">{content}</Media>
    </>
  );
};

export default EquippedItemWithStats;
