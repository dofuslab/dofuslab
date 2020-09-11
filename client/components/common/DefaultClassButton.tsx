/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useMutation } from '@apollo/client';

import { getImageUrl, navigateToNewCustomSet } from 'common/utils';
import { Class } from 'common/type-aliases';
import {
  editCustomSetDefaultClass,
  editCustomSetDefaultClassVariables,
} from 'graphql/mutations/__generated__/editCustomSetDefaultClass';
import editCustomSetDefaultClassMutation from 'graphql/mutations/editCustomSetDefaultClass.graphql';
import { useTranslation } from 'i18n';
import { useRouter } from 'next/router';
import Tooltip from './Tooltip';

interface Props {
  customSetId?: string;
  dofusClass: Class | null;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
  closeModal: () => void;
  isSelected: boolean;
}

const DefaultClassButton: React.FC<Props> = ({
  dofusClass,
  customSetId,
  setDofusClassId,
  closeModal,
  isSelected,
}) => {
  const [mutate] = useMutation<
    editCustomSetDefaultClass,
    editCustomSetDefaultClassVariables
  >(editCustomSetDefaultClassMutation, {
    variables: {
      customSetId,
      defaultClassId: dofusClass?.id,
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
                faceImageUrl: dofusClass.faceImageUrl,
                maleSpriteImageUrl: dofusClass.maleSpriteImageUrl,
                __typename: 'Class',
              },
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
            src={
              dofusClass?.faceImageUrl ?? getImageUrl('class/face/No_Class.svg')
            }
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
