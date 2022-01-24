/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useMutation } from '@apollo/client';

import { getFaceImageUrl, navigateToNewCustomSet } from 'common/utils';
import { Class } from 'common/type-aliases';
import {
  editCustomSetDefaultClass,
  editCustomSetDefaultClassVariables,
} from 'graphql/mutations/__generated__/editCustomSetDefaultClass';
import editCustomSetDefaultClassMutation from 'graphql/mutations/editCustomSetDefaultClass.graphql';
import { useTranslation } from 'i18n';
import { useRouter } from 'next/router';
import Tooltip from './Tooltip';
import { BuildGender } from '__generated__/globalTypes';

interface Props {
  customSetId?: string;
  dofusClass: Class | null;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
  closeModal: () => void;
  isSelected: boolean;
  buildGender: BuildGender;
}

const DefaultClassButton: React.FC<Props> = ({
  dofusClass,
  customSetId,
  setDofusClassId,
  closeModal,
  isSelected,
  buildGender,
}) => {
  const [mutate] = useMutation<
    editCustomSetDefaultClass,
    editCustomSetDefaultClassVariables
  >(editCustomSetDefaultClassMutation, {
    variables: {
      customSetId,
      defaultClassId: dofusClass?.id,
      buildGender,
    },
    optimisticResponse: customSetId
      ? () => ({
          editCustomSetDefaultClass: {
            customSet: {
              id: customSetId,
              lastModified: Date.now().toString(),
              defaultClass: dofusClass && {
                id: dofusClass.id,
                name: dofusClass.name,
                enName: dofusClass.enName,
                femaleFaceImageUrl: dofusClass.femaleFaceImageUrl,
                femaleSpriteImageUrl: dofusClass.femaleSpriteImageUrl,
                maleFaceImageUrl: dofusClass.maleFaceImageUrl,
                maleSpriteImageUrl: dofusClass.maleSpriteImageUrl,
                __typename: 'Class',
              },
              buildGender,
              __typename: 'CustomSet',
            },
            __typename: 'EditCustomSetDefaultClass',
          },
        })
      : undefined,
    refetchQueries: () => ['myCustomSets'],
  });

  const router = useRouter();

  const { t } = useTranslation('common');

  return (
    <Tooltip
      key={dofusClass?.id ?? 'no-class'}
      title={dofusClass?.name ?? t('NO_CLASS')}
    >
      <a
        onClick={async () => {
          setDofusClassId(dofusClass?.id);
          closeModal();
          const { data } = await mutate();
          if (
            data?.editCustomSetDefaultClass?.customSet.id &&
            data.editCustomSetDefaultClass.customSet.id !== customSetId
          ) {
            navigateToNewCustomSet(
              router,
              data.editCustomSetDefaultClass.customSet.id,
            );
          }
        }}
        css={{ maxWidth: 65, display: 'inline-block' }}
      >
        <div
          css={{
            cursor: 'pointer',
            opacity: isSelected ? 1 : 0.3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <img
            src={getFaceImageUrl(dofusClass, buildGender)}
            css={{
              width: '100%',
            }}
            alt={dofusClass?.name ?? t('NO_CLASS')}
          />
        </div>
      </a>
    </Tooltip>
  );
};

export default DefaultClassButton;
