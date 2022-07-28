/** @jsxImportSource @emotion/react */

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { mq } from 'common/constants';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { EditableContext } from 'common/utils';
import React from 'react';
import { Button } from 'antd';

export default function EquipSetLink({
  customSetId,
}: {
  customSetId?: string;
}) {
  const { t } = useTranslation('common');
  const isEditable = React.useContext(EditableContext);

  if (!isEditable) {
    return null;
  }

  return (
    <Link href={customSetId ? `/equip/set/${customSetId}/` : '/equip/set/'}>
      <a css={{ alignSelf: 'stretch', display: 'inline-flex' }}>
        <Button
          type="dashed"
          css={{
            margin: 6,
            '&:first-of-type': {
              marginLeft: 0,
            },
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 'auto',
            [mq[1]]: {
              margin: 4,
              ':first-of-type': {
                marginLeft: 0,
              },
            },
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          {t('EQUIP_SET')}
        </Button>
      </a>
    </Link>
  );
}
