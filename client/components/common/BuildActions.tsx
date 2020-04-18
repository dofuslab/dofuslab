/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { Button, Dropdown, Menu, notification } from 'antd';
import { useTranslation } from 'i18n';
import { useMutation } from '@apollo/react-hooks';
import {
  copyCustomSet,
  copyCustomSetVariables,
} from 'graphql/mutations/__generated__/copyCustomSet';
import copyCustomSetMutation from 'graphql/mutations/copyCustomSet.graphql';
import { navigateToNewCustomSet } from 'common/utils';
import { useRouter } from 'next/router';
import { mq } from 'common/constants';

interface IProps {
  customSet: customSet;
}

const BuildActions: React.FC<IProps> = ({ customSet }) => {
  const { t } = useTranslation('common');
  const theme = useTheme<TTheme>();
  const [mutate, { loading }] = useMutation<
    copyCustomSet,
    copyCustomSetVariables
  >(copyCustomSetMutation, {
    variables: { customSetId: customSet.id },
    refetchQueries: () => ['myCustomSets'],
  });
  const router = useRouter();

  const onCopy = React.useCallback(async () => {
    const { data } = await mutate();
    if (data?.copyCustomSet) {
      navigateToNewCustomSet(router, data.copyCustomSet.customSet.id);
      notification.success({
        message: t('SUCCESS'),
        description: t('COPY_BUILD_SUCCESS'),
      });
    }
  }, [mutate, customSet, router]);

  return (
    <div
      css={{
        marginLeft: 12,
        display: 'flex',
        alignItems: 'center',
        [mq[4]]: { marginLeft: 20 },
      }}
    >
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="copy" onClick={onCopy} disabled={loading}>
              {loading && <LoadingOutlined css={{ marginRight: 8 }} />}
              {t('COPY_BUILD')}
            </Menu.Item>
            <Menu.Item key="restart">{t('RESTART_BUILD')}</Menu.Item>
            <Menu.Item key="delete" css={{ color: theme.text?.danger }}>
              {t('DELETE_BUILD')}
            </Menu.Item>
          </Menu>
        }
      >
        <Button>
          {t('ACTIONS')} <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
};

export default BuildActions;
