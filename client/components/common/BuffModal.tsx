/** @jsxImportSource @emotion/react */

import { useContext, useState, useCallback } from 'react';
import Modal from 'antd/lib/modal/Modal';

import { AppliedBuff, AppliedBuffActionType } from 'common/types';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { Select, Divider, Button } from 'antd';
import {
  antdSelectFilterOption,
  CustomSetContext,
  getFaceImageUrl,
  getImageUrl,
} from 'common/utils';
import { CardSkeleton, EmptyState } from 'common/wrappers';
import {
  classBuffs,
  classBuffsVariables,
} from 'graphql/queries/__generated__/classBuffs';
import { ClassBuffSpell, CustomSet } from 'common/type-aliases';
import classBuffsQuery from 'graphql/queries/classBuffs.graphql';
import { mq, statIcons } from 'common/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@emotion/react';
import { getModalStyle, itemCardStyle } from 'common/mixins';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import SpellBuffCard from './SpellBuffCard';
import ItemBuffCard from './ItemBuffCard';
import Card from './Card';

const { Option } = Select;

const getBuffImage = (appliedBuff: AppliedBuff) =>
  appliedBuff.spell?.imageUrl || appliedBuff.item?.imageUrl || null;

const getBuffName = (appliedBuff: AppliedBuff) => {
  return appliedBuff.spell?.name || appliedBuff.item?.name || null;
};

interface Props {
  open: boolean;
  closeBuffModal: () => void;
  customSet?: CustomSet | null;
  dofusClassId?: string;
}

const BuffModal = ({
  open,
  closeBuffModal,
  customSet,
  dofusClassId,
}: Props) => {
  const { appliedBuffs, dispatch } = useContext(CustomSetContext);
  const { t } = useTranslation(['stat', 'common']);
  const { data: classData } = useQuery<classes>(classesQuery);
  const { data: currentUserData } =
    useQuery<CurrentUserQueryType>(currentUserQuery);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(
    dofusClassId,
  );
  const { data, loading } = useQuery<classBuffs, classBuffsVariables>(
    classBuffsQuery,
    {
      skip: !selectedClassId,
      variables: { id: selectedClassId },
    },
  );

  const onSelectClass = useCallback((newSelectedClassId: string) => {
    setSelectedClassId(newSelectedClassId);
  }, []);

  const onResetAll = useCallback(() => {
    dispatch({ type: AppliedBuffActionType.CLEAR_ALL });
  }, []);

  const theme = useTheme();

  const flattenedSpellsWithBuffs =
    data?.classById?.spellVariantPairs
      .reduce(
        (acc, { spells: [s1, s2] }) => [...acc, s1, s2],
        [] as Array<ClassBuffSpell>,
      )
      .filter((s) => !!s.spellStats.some((ss) => !!ss.buffs?.length)) ?? [];

  const itemsWithBuffs =
    customSet?.equippedItems
      .filter((ei) => (ei.item.buffs?.length ?? 0) > 0)
      .map((ei) => ei.item) ?? [];

  return (
    <Modal
      open={open}
      onCancel={closeBuffModal}
      footer={null}
      title={t('BUFFS', { ns: 'common' })}
      css={{
        [mq[1]]: { minWidth: 720 },
        ...getModalStyle(theme),
      }}
    >
      {appliedBuffs.length > 0 && (
        <div>
          <div css={{ textAlign: 'right' }}>
            <Button
              css={{ marginBottom: 12 }}
              icon={
                <FontAwesomeIcon icon={faRedoAlt} css={{ marginRight: 8 }} />
              }
              onClick={onResetAll}
            >
              {t('RESET_ALL', { ns: 'common' })}
            </Button>
          </div>
          <div
            css={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            {appliedBuffs.map((ab) => {
              const buffName = getBuffName(ab);
              const buffImgSuffix = getBuffImage(ab);
              return (
                <Card
                  css={itemCardStyle}
                  key={ab.buff.id}
                  size="small"
                  hoverable
                  title={
                    <div>
                      {buffName && buffImgSuffix && (
                        <img
                          src={getImageUrl(buffImgSuffix)}
                          css={{ width: 24, height: 24, marginRight: 8 }}
                          alt={buffName}
                        />
                      )}
                      {buffName}
                    </div>
                  }
                  onClick={() => {
                    dispatch({
                      type: AppliedBuffActionType.REMOVE_BUFF,
                      buffId: ab.buff.id,
                    });
                  }}
                >
                  <div css={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <img
                      src={getImageUrl(statIcons[ab.buff.stat])}
                      alt={t(ab.buff.stat)}
                      css={{ width: 16 }}
                    />
                    {ab.numStacks * (ab.buff.incrementBy || 0) +
                      ab.numCritStacks * (ab.buff.critIncrementBy || 0)}{' '}
                    {t(ab.buff.stat)}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {appliedBuffs.length > 0 && <Divider css={{ margin: '12px 0' }} />}
      {itemsWithBuffs.length > 0 && (
        <>
          <div
            css={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(224px, 1fr))',
              gridGap: 12,
            }}
          >
            {itemsWithBuffs?.map((item) => (
              <ItemBuffCard item={item} key={item.id} />
            ))}
          </div>
          <Divider css={{ margin: '12px 0' }} />
        </>
      )}

      <Select<string>
        getPopupContainer={(node: HTMLElement) => {
          if (node.parentElement) {
            return node.parentElement;
          }
          return document && document.body;
        }}
        size="large"
        css={{ width: '100%', marginBottom: 12 }}
        showSearch
        filterOption={antdSelectFilterOption}
        value={selectedClassId}
        onChange={onSelectClass}
        placeholder={t('SELECT_CLASS', { ns: 'common' })}
        onKeyDown={(e) => {
          // prevents triggering SetBuilderKeyboardShortcuts
          e.nativeEvent.stopPropagation();
        }}
      >
        {classData &&
          [...(classData?.classes ?? [])]
            .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
            .map((dofusClass) => (
              <Option key={dofusClass.id} value={dofusClass.id}>
                <img
                  src={getFaceImageUrl(
                    dofusClass,
                    currentUserData?.currentUser?.settings.buildGender,
                  )}
                  alt={dofusClass.name}
                  css={{ width: 20, marginRight: 8 }}
                />
                {dofusClass.name}
              </Option>
            ))}
      </Select>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(224px, 1fr))',
          gridGap: 12,
        }}
      >
        {loading
          ? Array(4)
              .fill(null)
              .map((_, idx) => (
                <CardSkeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`card-skeleton-${idx}`}
                  css={{
                    marginTop: 20,
                    [mq[1]]: { marginTop: 0 },
                    backgroundColor: theme.layer?.backgroundLight,
                  }}
                  numRows={2}
                />
              ))
          : flattenedSpellsWithBuffs.map((s) => (
              <SpellBuffCard key={s.id} spell={s} level={200} />
            ))}
      </div>
      {selectedClassId && !loading && flattenedSpellsWithBuffs.length === 0 && (
        <EmptyState>{t('NO_BUFFS_FOUND', { ns: 'common' })}</EmptyState>
      )}
    </Modal>
  );
};

export default BuffModal;
