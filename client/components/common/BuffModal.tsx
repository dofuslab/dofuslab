/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Modal from 'antd/lib/modal/Modal';

import { AppliedBuff, AppliedBuffActionType, Theme } from 'common/types';
import { useTranslation } from 'i18n';
import { useQuery } from '@apollo/client';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { Select, Spin, Divider, Button } from 'antd';
import { useClassId, CustomSetContext } from 'common/utils';
import {
  classBuffs,
  classBuffsVariables,
  classBuffs_classById_spellVariantPairs_spells as ClassBuffSpell,
} from 'graphql/queries/__generated__/classBuffs';
import classBuffsQuery from 'graphql/queries/classBuffs.graphql';
import { mq } from 'common/constants';
import { CustomSet } from 'common/type-aliases';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'emotion-theming';
import { getModalStyle } from 'common/mixins';
import SpellBuffCard from './SpellBuffCard';
import ItemBuffCard from './ItemBuffCard';

const { Option } = Select;

const getBuffImage = (appliedBuff: AppliedBuff) =>
  appliedBuff.spell?.imageUrl || appliedBuff.item?.imageUrl || null;

const getBuffName = (appliedBuff: AppliedBuff) => {
  return appliedBuff.spell?.name || appliedBuff.item?.name || null;
};

interface Props {
  visible: boolean;
  closeBuffModal: () => void;
  customSet?: CustomSet | null;
}

const BuffModal: React.FC<Props> = ({ visible, closeBuffModal, customSet }) => {
  const { appliedBuffs, dispatch } = React.useContext(CustomSetContext);
  const { t } = useTranslation(['stat', 'common']);
  const { data: classData } = useQuery<classes>(classesQuery);
  const initialClassId = useClassId();
  const [selectedClassId, setSelectedClassId] = React.useState<
    string | undefined
  >(initialClassId);
  const { data, loading } = useQuery<classBuffs, classBuffsVariables>(
    classBuffsQuery,
    {
      skip: !selectedClassId,
      variables: { id: selectedClassId },
    },
  );

  const onSelectClass = React.useCallback((newSelectedClassId: string) => {
    setSelectedClassId(newSelectedClassId);
  }, []);

  const onResetAll = React.useCallback(() => {
    dispatch({ type: AppliedBuffActionType.CLEAR_ALL });
  }, []);

  const theme = useTheme<Theme>();

  const flattenedSpells =
    data?.classById?.spellVariantPairs.reduce(
      (acc, { spells: [s1, s2] }) => [...acc, s1, s2],
      [] as Array<ClassBuffSpell>,
    ) ?? [];

  const itemsWithBuffs =
    customSet?.equippedItems
      .filter((ei) => (ei.item.buffs?.length ?? 0) > 0)
      .map((ei) => ei.item) ?? [];

  return (
    <Modal
      visible={visible}
      onCancel={closeBuffModal}
      footer={null}
      title={t('BUFFS', { ns: 'common' })}
      css={{
        [mq[1]]: { minWidth: 720 },
        ...getModalStyle(theme),
      }}
    >
      {appliedBuffs.length > 0 && (
        <Button
          css={{ float: 'right', marginBottom: 12, marginLeft: 12 }}
          icon={<FontAwesomeIcon icon={faRedoAlt} css={{ marginRight: 8 }} />}
          onClick={onResetAll}
        >
          {t('RESET_ALL', { ns: 'common' })}
        </Button>
      )}
      {appliedBuffs.map((ab) => {
        const buffName = getBuffName(ab);
        const buffImgUrl = getBuffImage(ab);
        return (
          <div
            key={ab.buff.id}
            css={{ ':not(:first-of-type)': { marginTop: 4 } }}
          >
            <a
              key={ab.buff.id}
              onClick={() => {
                dispatch({
                  type: AppliedBuffActionType.REMOVE_BUFF,
                  buffId: ab.buff.id,
                });
              }}
            >
              {buffName && buffImgUrl && (
                <img
                  src={buffImgUrl}
                  css={{ width: 24, height: 24, marginRight: 8 }}
                  alt={buffName}
                />
              )}
              {getBuffName(ab)}:{' '}
              {ab.numStacks * (ab.buff.incrementBy || 0) +
                ab.numCritStacks * (ab.buff.critIncrementBy || 0)}{' '}
              {t(ab.buff.stat)}
            </a>
          </div>
        );
      })}
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
        filterOption={(input, option) => {
          return (option?.children[1] as string)
            .toLocaleUpperCase()
            .includes(input.toLocaleUpperCase());
        }}
        value={selectedClassId}
        onChange={onSelectClass}
        placeholder={t('SELECT_CLASS', { ns: 'common' })}
      >
        {classData &&
          [...classData?.classes]
            .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
            .map((dofusClass) => (
              <Option key={dofusClass.id} value={dofusClass.id}>
                <img
                  src={dofusClass.faceImageUrl}
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
        {loading ? (
          <Spin css={{ marginTop: 24, gridColumn: '1 / -1' }} />
        ) : (
          flattenedSpells
            .filter((s) => !!s.spellStats.some((ss) => !!ss.buffs?.length))
            .map((s) => <SpellBuffCard key={s.id} spell={s} level={200} />)
        )}
      </div>
    </Modal>
  );
};

export default BuffModal;
