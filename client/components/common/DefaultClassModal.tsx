/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Divider, Modal } from 'antd';
import { useQuery } from '@apollo/client';

import { CustomSet } from 'common/type-aliases';
import { useTranslation } from 'i18n';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';

import { mq } from 'common/constants';
import DefaultClassButton from './DefaultClassButton';

interface Props {
  visible: boolean;
  closeModal: () => void;
  customSet?: CustomSet | null;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const DefaultClassModal: React.FC<Props> = ({
  visible,
  closeModal,
  customSet,
  setDofusClassId,
}) => {
  const { t } = useTranslation('common');
  const { data } = useQuery<classes>(classesQuery);

  return (
    <Modal
      visible={visible}
      title={t('SELECT_BUILD_CLASS')}
      footer={null}
      onCancel={closeModal}
    >
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          minHeight: 288,
          gridGap: 16,
          [mq[0]]: {
            gridTemplateColumns: 'repeat(6, 1fr)',
          },
        }}
      >
        {data &&
          [...data.classes]
            .sort(({ name: n1 }, { name: n2 }) => n1.localeCompare(n2))
            .map((dofusClass) => (
              <DefaultClassButton
                key={dofusClass.id}
                dofusClass={dofusClass}
                setDofusClassId={setDofusClassId}
                closeModal={closeModal}
                customSetId={customSet?.id}
                isSelected={customSet?.defaultClass?.id === dofusClass.id}
              />
            ))}
      </div>
      <Divider />
      <div css={{ textAlign: 'center' }}>
        <DefaultClassButton
          dofusClass={null}
          setDofusClassId={setDofusClassId}
          closeModal={closeModal}
          customSetId={customSet?.id}
          isSelected={!customSet?.defaultClass?.id}
        />
      </div>
    </Modal>
  );
};

export default DefaultClassModal;
