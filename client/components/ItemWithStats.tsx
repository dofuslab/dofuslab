/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import Popover from 'antd/lib/popover';

import { ItemStatsList } from 'common/wrappers';
import {
  popoverTitleStyle,
  itemImageBox,
  selected as selectedBox,
  itemImageDimensions,
} from 'common/mixins';
import {
  customSet_equippedItems,
  customSet,
} from 'graphql/fragments/__generated__/customSet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useDeleteItemMutation } from 'common/utils';
import { useTranslation } from 'i18n';

const wrapperStyles = {
  position: 'absolute' as 'absolute',
  right: 6,
  top: 6,
  fontSize: '0.75rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 4,
  margin: -4,
  transition: '0.3s opacity',
  opacity: 0,
};

interface IProps {
  equippedItem: customSet_equippedItems;
  selected: boolean;
  deletable: boolean;
  customSet: customSet;
}

const ItemWithStats: React.FC<IProps> = ({
  equippedItem,
  selected,
  deletable,
  customSet,
}) => {
  const deleteItem = useDeleteItemMutation(equippedItem.slot.id, customSet);
  const onDelete = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      deleteItem && deleteItem();
    },
    [deleteItem],
  );
  const { t } = useTranslation('common');
  return (
    <ClassNames>
      {({ css }) => {
        const wrapperClass = css(wrapperStyles);
        return (
          <Popover
            placement="bottom"
            title={
              <div
                css={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}
              >
                <div>{equippedItem.item.name}</div>
                <div
                  css={{ marginLeft: 8, fontWeight: 400, fontSize: '0.75rem' }}
                >
                  {t('LEVEL_ABBREVIATION')} {equippedItem.item.level}
                </div>
              </div>
            }
            content={
              equippedItem.item.stats.length > 0 && (
                <ItemStatsList
                  item={equippedItem.item}
                  exos={equippedItem.exos}
                />
              )
            }
            overlayClassName={css(popoverTitleStyle)}
          >
            <div
              css={{
                ...itemImageBox,
                ...(selected && { ...selectedBox }),
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
              <img src={equippedItem.item.imageUrl} css={itemImageDimensions} />
              {equippedItem.exos.length > 0 && (
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
              {deletable && (
                <div className={wrapperClass} onClick={onDelete}>
                  <FontAwesomeIcon icon={faTimes} />
                </div>
              )}
            </div>
          </Popover>
        );
      }}
    </ClassNames>
  );
};

export default ItemWithStats;
