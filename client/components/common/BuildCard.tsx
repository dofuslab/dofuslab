/** @jsxImportSource @emotion/react */

import {
  faEyeSlash,
  faGlobe,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { itemCardStyle, selected } from 'common/mixins';
import { CardTitleWithLevel } from 'common/wrappers';
import Card from 'components/common/Card';
import { getImageUrl, getFaceImageUrl } from 'common/utils';
import { buildList_userByName_customSets_edges_node as AbbreviatedCustomSet } from 'graphql/queries/__generated__/buildList';
import { useTranslation } from 'react-i18next';
import { mq } from 'common/constants';
import { useTheme } from '@emotion/react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function BuildCard({
  customSet,
  isEditable,
  setSelectedCustomSetId,
  setDeleteModalVisible,
  setTogglePrivateModalVisible,
}: {
  customSet: AbbreviatedCustomSet;
  isEditable: boolean;
  setSelectedCustomSetId: (customSetId: string) => void;
  setDeleteModalVisible: (visible: true) => void;
  setTogglePrivateModalVisible: (visible: true) => void;
}) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const router = useRouter();
  const { customSetId } = router.query;

  return (
    <Card
      hoverable
      title={
        <CardTitleWithLevel
          title={customSet.name || t('UNTITLED')}
          level={customSet.level}
          afterLevel={
            <div css={{ display: 'flex', alignItems: 'center' }}>
              {[...customSet.tagAssociations]
                .sort(
                  (a1, a2) =>
                    new Date(a1.associationDate).getTime() -
                    new Date(a2.associationDate).getTime(),
                )
                .map(({ customSetTag: tag }) => {
                  return (
                    <img
                      title={tag.name}
                      key={tag.id}
                      src={getImageUrl(tag.imageUrl)}
                      css={{
                        width: 14,
                        height: 'auto',
                        marginLeft: 4,
                        maxHeight: 14,
                      }}
                      alt={tag.name}
                    />
                  );
                })}
            </div>
          }
          rightAlignedContent={
            isEditable && (
              <div
                css={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <div
                  css={{
                    padding: '0px 4px 0px 8px',
                    marginLeft: 4,
                    opacity: 0.3,
                    transition: '0.3s opacity ease-in-out',
                    '&:hover': { opacity: 1 },
                  }}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedCustomSetId(customSet.id);
                    setDeleteModalVisible(true);
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </div>
                <div
                  css={{
                    padding: '0px 4px 0px 8px',
                    marginLeft: 4,
                    opacity: 0.3,
                    transition: '0.3s opacity ease-in-out',
                    '&:hover': { opacity: 1 },
                  }}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedCustomSetId(customSet.id);
                    setTogglePrivateModalVisible(true);
                  }}
                >
                  <FontAwesomeIcon
                    icon={customSet.private ? faEyeSlash : faGlobe}
                  />
                </div>
              </div>
            )
          }
          leftImageUrl={getFaceImageUrl(
            customSet.defaultClass,
            customSet.buildGender,
          )}
          leftImageAlt={customSet.defaultClass?.name}
        />
      }
      size="small"
      css={{
        ...itemCardStyle,
        marginTop: 20,
        [mq[1]]: {
          marginTop: 0,
        },
        height: '100%',
        ':hover': {
          ...(customSet.id === customSetId && selected(theme)),
        },
        ...(customSet.id === customSetId && selected(theme)),
        transition: 'all 0.3s ease-in-out',
        '&.ant-card': {
          background: theme.layer?.backgroundLight,
        },
      }}
    >
      {customSet.equippedItems.length > 0 ? (
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridAutoRows: '1fr 1fr',
          }}
        >
          {[...customSet.equippedItems]
            .sort(({ slot: { order: i } }, { slot: { order: j } }) => i - j)
            .map(({ id, item }) => (
              <div
                key={`equipped-item-${id}`}
                css={{
                  position: 'relative',
                  '&::before': {
                    content: "''",
                    display: 'block',
                    paddingTop: '100%',
                  },
                }}
              >
                <img
                  src={getImageUrl(item.imageUrl)}
                  css={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                  }}
                  alt={id}
                />
              </div>
            ))}
        </div>
      ) : (
        <div css={{ fontStyle: 'italic', color: theme.text?.light }}>
          {t('NO_ITEMS_EQUIPPED')}
        </div>
      )}
    </Card>
  );
}
