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
  popoverShadow,
} from 'common/mixins';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Theme } from 'common/types';
import { CardTitleWithLevel, BrokenImagePlaceholder } from 'common/wrappers';
import { Exo, Item } from 'common/type-aliases';
import { getImageUrl } from 'common/utils';
import ItemStatsList from '../common/ItemStatsList';

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

interface Props {
  item: Item;
  exos?: Array<Exo>;
  deletable?: boolean;
  selected?: boolean;
  onDelete?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  overlayCSS?: React.CSSProperties;
}

const BasicItemWithStats: React.FC<Props> = ({
  item,
  exos,
  deletable,
  onDelete,
  selected,
  overlayCSS,
}) => {
  const theme = useTheme<Theme>();
  const [brokenImage, setBrokenImage] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <ClassNames>
      {({ css }) => {
        const wrapperClass = css(wrapperStyles);
        return (
          <Popover
            placement="bottom"
            getPopupContainer={(triggerNode) => {
              if (triggerNode.parentElement) {
                return triggerNode.parentElement;
              }
              return document && document.body;
            }}
            title={<CardTitleWithLevel title={item.name} level={item.level} />}
            content={
              item.stats.length > 0 && <ItemStatsList item={item} exos={exos} />
            }
            overlayClassName={css({
              ...popoverTitleStyle,
              ...overlayCSS,
              '.ant-popover-content': {
                boxShadow: popoverShadow,
                maxHeight: contentRef.current
                  ? `calc(100vh - ${
                      contentRef.current.offsetTop +
                      contentRef.current.offsetHeight +
                      20
                    }px)`
                  : undefined,
                overflow: 'auto',
              },
              width: 240,
            })}
            autoAdjustOverflow={{ adjustX: 1, adjustY: 0 }}
          >
            <div
              css={{
                ...itemImageBox(theme),
                ...(selected && { ...selectedBox(theme) }),
                '&:hover': {
                  [`.${wrapperClass}`]: {
                    opacity: 0.3,
                    '&:hover': {
                      opacity: 1,
                    },
                  },
                },
              }}
              ref={contentRef}
            >
              {brokenImage ? (
                <BrokenImagePlaceholder
                  css={{ ...itemImageDimensions, fontSize: '1.2rem' }}
                />
              ) : (
                <img
                  src={getImageUrl(item.imageUrl)}
                  css={itemImageDimensions}
                  onError={() => {
                    setBrokenImage(true);
                  }}
                  alt={item.name}
                />
              )}
              {(exos?.length ?? 0) > 0 && (
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

export default BasicItemWithStats;
