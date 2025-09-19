/** @jsxImportSource @emotion/react */

import { useCallback, useEffect, memo, useContext } from 'react';
import { useRouter } from 'next/router';
import NotificationContext from 'common/notificationContext';
import { useQuery } from '@apollo/client';

import { useTranslation } from 'next-i18next';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import Cookies from 'js-cookie';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';

type StatusObj = {
  type: 'info' | 'success' | 'warning' | 'error';
  messageKey: string;
};

const statusMap = {
  reset_password: {
    messageKey: 'RESET_PASSWORD',
    already_logged_in: {
      type: 'info',
      messageKey: 'ALREADY_LOGGED_IN',
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

const StatusChecker = () => {
  const router = useRouter();
  const { query } = router;
  const { t } = useTranslation('status');
  const { data } = useQuery<currentUser>(currentUserQuery);

  const notificationApi = useContext(NotificationContext);

  const processQueryEntry = useCallback(
    (statusType: string, statusValue: string) => {
      const obj = statusMap[statusType]?.[statusValue];
      if (isStatusObj(obj)) {
        const tKey = `${statusMap[statusType].messageKey}.${obj.messageKey}`;
        notificationApi[obj.type]({
          message: t(`${tKey}.TITLE`),
          description: t(`${tKey}.DESCRIPTION`),
        });
        return true;
      }
      return false;
    },
    [t],
  );

  useEffect(() => {
    if (data?.currentUser && !data.currentUser.verified) {
      router.replace('/verify-email');
      return;
    }
    Object.entries(query).forEach(([statusType, statusValue]) => {
      if (typeof statusValue === 'string') {
        processQueryEntry(statusType, statusValue);
      } else if (Array.isArray(statusValue)) {
        statusValue.forEach((value) => {
          processQueryEntry(statusType, value);
        });
      }
    });
  }, [data]);

  useEffect(() => {
    if (!Cookies.get('NEXT_LOCALE')) {
      Cookies.set(
        'NEXT_LOCALE',
        router.locale || router.defaultLocale || DEFAULT_LANGUAGE,
      );
    }
  }, [router]);

  return null;
};

export default memo(StatusChecker);
