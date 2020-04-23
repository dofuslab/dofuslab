/** @jsx jsx */

import React from 'react';
import { useRouter } from 'next/router';
import { notification } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import { useQuery, useApolloClient } from '@apollo/react-hooks';

import { useTranslation } from 'i18n';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { locale } from 'graphql/queries/__generated__/locale';
import localeQuery from 'graphql/queries/locale.graphql';

type StatusObj = {
  type: 'info' | 'success' | 'warn' | 'error';
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

const StatusChecker: React.FC = () => {
  const router = useRouter();
  const { query } = router;
  const { t, i18n } = useTranslation('status');
  const client = useApolloClient();
  const { data } = useQuery<currentUser>(currentUserQuery);
  const { data: localeData } = useQuery<locale>(localeQuery);

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
    if (data?.currentUser && !data.currentUser.verified) {
      router.replace('/verify-email');
      return;
    }
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
    const { customSetId, ...restQuery } = newQuery;
    router.replace(
      { pathname: router.pathname, query: newQuery },
      {
        pathname: router.asPath.substring(0, router.asPath.indexOf('?')),
        query: restQuery,
      },
      { shallow: true },
    );
  }, [data]);

  React.useEffect(() => {
    if (localeData?.locale && localeData.locale !== i18n.language) {
      i18n.changeLanguage(localeData?.locale);
      client.resetStore();
    }
  }, [localeData, client, i18n]);

  return null;
};

export default React.memo(StatusChecker);
