/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { Divider, Modal, Tabs } from 'antd';
import { useQuery } from '@apollo/client';

import { CustomSet } from 'common/type-aliases';
import { useTranslation } from 'next-i18next';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';

import { mq } from 'common/constants';
import { BuildGender } from '__generated__/globalTypes';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import DefaultClassButton from './DefaultClassButton';

interface Props {
  open: boolean;
  closeModal: () => void;
  customSet?: CustomSet | null;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const classContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  minHeight: 288,
  gridGap: 16,
  [mq[0]]: {
    gridTemplateColumns: 'repeat(6, 1fr)',
  },
};

const DefaultClassModal: React.FC<Props> = ({
  open,
  closeModal,
  customSet,
  setDofusClassId,
}) => {
  const { t } = useTranslation('common');
  const { data } = useQuery<classes>(classesQuery);
  const { data: currentUserData } =
    useQuery<CurrentUserQueryType>(currentUserQuery);

  const sortedClasses =
    data &&
    [...data.classes].sort(({ name: n1 }, { name: n2 }) =>
      n1.localeCompare(n2),
    );

  const defaultBuildGender =
    customSet?.buildGender ??
    currentUserData?.currentUser?.settings.buildGender;

  const tabs = [
    {
      key: BuildGender.FEMALE,
      label: t('FEMALE'),
      children: (
        <div css={classContainerStyle}>
          {sortedClasses &&
            sortedClasses.map((dofusClass) => (
              <DefaultClassButton
                key={dofusClass.id}
                dofusClass={dofusClass}
                setDofusClassId={setDofusClassId}
                closeModal={closeModal}
                customSetId={customSet?.id}
                isSelected={
                  customSet?.defaultClass?.id === dofusClass.id &&
                  customSet?.buildGender === BuildGender.FEMALE
                }
                buildGender={BuildGender.FEMALE}
              />
            ))}
        </div>
      ),
    },
    {
      key: BuildGender.MALE,
      label: t('MALE'),
      children: (
        <div css={classContainerStyle}>
          {sortedClasses &&
            sortedClasses.map((dofusClass) => (
              <DefaultClassButton
                key={dofusClass.id}
                dofusClass={dofusClass}
                setDofusClassId={setDofusClassId}
                closeModal={closeModal}
                customSetId={customSet?.id}
                isSelected={
                  customSet?.defaultClass?.id === dofusClass.id &&
                  customSet?.buildGender === BuildGender.MALE
                }
                buildGender={BuildGender.MALE}
              />
            ))}
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={t('SELECT_BUILD_CLASS')}
      footer={null}
      onCancel={closeModal}
    >
      <Tabs
        defaultActiveKey={defaultBuildGender || BuildGender.FEMALE}
        items={tabs}
      />
      <Divider />
      <div css={{ textAlign: 'center' }}>
        <DefaultClassButton
          dofusClass={null}
          setDofusClassId={setDofusClassId}
          closeModal={closeModal}
          customSetId={customSet?.id}
          isSelected={!customSet?.defaultClass?.id}
          buildGender={defaultBuildGender || BuildGender.MALE}
        />
      </div>
    </Modal>
  );
};

export default DefaultClassModal;
