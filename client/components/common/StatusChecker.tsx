/** @jsx jsx */

import React from 'react';
import { useRouter } from 'next/router';
import notification from 'antd/lib/notification';
import { useTranslation } from 'i18n';
import { cloneDeep } from 'lodash';

type StatusObj = {
  type: 'info' | 'success' | 'warn' | 'error';
  messageKey: string;
};

const statusMap = {
  verify_email: {
    messageKey: 'VERIFY_EMAIL',
    already_verified: {
      type: 'info',
      messageKey: 'ALREADY_VERIFIED',
    },
    success: {
      type: 'success',
      messageKey: 'SUCCESS',
    },
    invalid: {
      type: 'error',
      messageKey: 'INVALID',
    },
  },
} as {
  [key: string]: {
    [key: string]: StatusObj | string;
  };
};

function isStatusObj(value: string | StatusObj): value is StatusObj {
  return typeof value === 'object';
}

const StatusChecker: React.FC = () => {
  const router = useRouter();
  const { query } = router;
  const { t } = useTranslation('status');

  const processQueryEntry = React.useCallback(
    (statusType: string, statusValue: string) => {
      const obj = statusMap[statusType]?.[statusValue];
      if (isStatusObj(obj)) {
        const tKey = `${statusMap[statusType].messageKey}.${obj.messageKey}`;
        notification[obj.type]({
          message: t(`${tKey}.TITLE`),
          description: t(`${tKey}.DESCRIPTION`),
        });
        return true;
      }
      return false;
    },
    [t],
  );

  React.useEffect(() => {
    const newQuery = cloneDeep(query);
    Object.entries(query).forEach(([statusType, statusValue]) => {
      if (typeof statusValue === 'string') {
        if (processQueryEntry(statusType, statusValue)) {
          delete newQuery[statusType];
        }
      } else {
        statusValue.forEach(value => {
          if (processQueryEntry(statusType, value)) {
            const values = newQuery[statusType] as string[];
            newQuery[statusType] = values.filter(s => s !== value);
            if (newQuery[statusType].length === 0) {
              delete newQuery[statusType];
            }
          }
        });
      }
    });
    router.replace(
      { pathname: router.pathname, query: newQuery },
      {
        pathname: router.asPath.substring(0, router.asPath.indexOf('?')),
      },
      { shallow: true },
    );
  }, []);
  return null;
};

export default React.memo(StatusChecker);
