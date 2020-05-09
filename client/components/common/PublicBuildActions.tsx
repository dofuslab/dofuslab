/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Button } from 'antd';
import { useTranslation } from 'i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { CustomSet } from 'common/type-aliases';
import { usePublicBuildActions } from 'common/utils';
import { optionalIconCss } from 'common/mixins';

interface Props {
  customSet: CustomSet;
  className?: string;
}

const PublicBuildActions: React.FC<Props> = ({ customSet, className }) => {
  const { t } = useTranslation('common');
  const {
    copyLoading,
    onCopyLink,
    onCopyBuild,
    linkTextareaRef,
  } = usePublicBuildActions(customSet);
  return (
    <ClassNames>
      {({ css, cx }) => (
        <div
          className={cx(
            css({ display: 'flex', alignItems: 'center' }),
            className,
          )}
        >
          <textarea
            css={{ display: 'none' }}
            id="classic-clipboard-link"
            ref={linkTextareaRef}
            contentEditable
          />
          <Button onClick={onCopyBuild} loading={copyLoading}>
            {t('COPY_BUILD')}
            <FontAwesomeIcon icon={faClone} css={optionalIconCss} />
          </Button>
          <Button type="primary" css={{ marginLeft: 12 }} onClick={onCopyLink}>
            {t('SHARE_BUILD')}
            <FontAwesomeIcon icon={faShareAlt} css={optionalIconCss} />
          </Button>
        </div>
      )}
    </ClassNames>
  );
};

export default PublicBuildActions;
