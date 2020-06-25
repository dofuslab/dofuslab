/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Modal from 'antd/lib/modal/Modal';

import { AppliedBuff, AppliedBuffAction } from 'common/types';
import { useTranslation } from 'i18n';
import { useQuery } from '@apollo/react-hooks';
import { allBuffs } from 'graphql/queries/__generated__/allBuffs';
import allBuffsQuery from 'graphql/queries/allBuffs.graphql';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { Select } from 'antd';
import { useClassId } from 'common/utils';
import { Buff } from 'common/type-aliases';
import BuffCard from './BuffCard';

const { Option } = Select;

interface Props {
  visible: boolean;
  closeBuffModal: () => void;
  appliedBuffs: Array<AppliedBuff>;
  dispatch: React.Dispatch<AppliedBuffAction>;
}

const BuffModal: React.FC<Props> = ({
  visible,
  closeBuffModal,
  // appliedBuffs,
  // dispatch,
}) => {
  const { t } = useTranslation(['stat', 'common']);
  const { data } = useQuery<allBuffs>(allBuffsQuery);
  const { data: classData } = useQuery<classes>(classesQuery);
  const initialClassId = useClassId();
  const [selectedClassId, setSelectedClassId] = React.useState<
    string | undefined
  >(initialClassId);

  const onSelectClass = React.useCallback((newSelectedClassId: string) => {
    setSelectedClassId(newSelectedClassId);
  }, []);

  // const buffItems = React.useMemo(() => {
  //   const buffItemsObj: { [key: string]: BuffItem } = {};
  //   const filteredBuffs = data?.allBuffs.filter((buff) => !!buff.item) ?? [];
  //   filteredBuffs.forEach((buff) => {
  //     if (!buff.item) {
  //       return;
  //     }
  //     buffItemsObj[buff.item.id] = buff.item;
  //   });
  //   return Object.values(buffItemsObj);
  // }, [data?.allBuffs]);

  const buffClassesObj = React.useMemo(() => {
    const obj: { [key: string]: { [key: string]: Array<Buff> } } = {};
    const filteredBuffs =
      data?.allBuffs.filter((buff) => !!buff.spellStats) ?? [];
    filteredBuffs.forEach((buff) => {
      if (!buff.spellStats?.spell?.variantPair?.class) {
        return;
      }
      const classId = buff.spellStats.spell.variantPair.class.id;
      const spellId = buff.spellStats.spell.id;
      if (!obj[classId]) {
        obj[classId] = {};
      }
      if (obj[classId][spellId]) {
        obj[classId][spellId].push(buff);
      } else {
        obj[classId][spellId] = [buff];
      }
    });
    return obj;
  }, [data?.allBuffs]);

  return (
    <Modal
      visible={visible}
      onCancel={closeBuffModal}
      footer={null}
      title={t('BUFFS', { ns: 'common' })}
    >
      <Select<string>
        getPopupContainer={(node: HTMLElement) => {
          if (node.parentElement) {
            return node.parentElement;
          }
          return document && document.body;
        }}
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
              <Option
                key={dofusClass.id}
                value={dofusClass.id}
                disabled={!buffClassesObj[dofusClass.id]}
              >
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(224px, 1fr))',
          gridGap: 8,
        }}
      >
        {/* {data?.allBuffs
          .filter(
            (b) =>
              b.spellStats?.spell?.variantPair?.class?.id === selectedClassId,
          )
          .map((b) => (
            <div>{b.spellStats?.spell?.name}</div>
          ))} */}
        {selectedClassId &&
          buffClassesObj[selectedClassId] &&
          Object.entries(buffClassesObj[selectedClassId]).map(([, v]) => (
            <BuffCard buffs={v} level={200} />
          ))}
      </div>
    </Modal>
  );
};

export default BuffModal;
