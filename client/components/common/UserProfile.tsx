/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTranslation } from 'i18n';
import { useTheme } from 'emotion-theming';
import { mq } from 'common/constants';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import BuildList from './BuildList';
import ProfilePictureModal from './ProfilePictureModal';
import { Theme } from 'common/types';
import { getImageUrl } from 'common/utils';

interface Props {
  username: string;
  creationDate: string;
  profilePicture: string;
  isEditable: boolean;
}

const UserProfile: React.FC<Props> = ({
  username,
  creationDate,
  profilePicture,
  isEditable,
}) => {
  const [pictureModalVisible, setPictureModalVisible] = React.useState(false);

  const { t } = useTranslation('common');
  const theme = useTheme<Theme>();

  const getDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 1036,
        width: '100%',
        margin: '0 auto',
        [mq[1]]: { flexDirection: 'row' },
      }}
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          margin: '0px 20px 20px 0px',
          gridArea: '1 / 3 / 1 /1',
          borderRadius: 6,
          [mq[1]]: {
            flexDirection: 'column',
            margin: '10px 0px 0px 0px',
            padding: '0px 20px 20px 20px',
            width: '30%',
            minWidth: '25%',
          },
        }}
      >
        <div
          css={{
            display: 'inline-block',
            position: 'relative',
            width: 'auto',
            maxWidth: '100%',
            [mq[1]]: {
              width: '100%',
              '& > button': {
                visibility: 'hidden',
                opacity: 0,
              },
              '&:hover > button': {
                height: 'auto',
                visibility: 'visible',
                opacity: 1,
                transition: 'visibility 0s, opacity 0.2s linear',
              },
            },
          }}
        >
          <img
            src={getImageUrl(profilePicture)}
            alt="Avatar"
            css={{
              maxWidth: 120,
              alignItems: 'center',
              borderRadius: 6,
              border: '4px solid black',
              outline: '1px solid #434343',
              display: 'block',
              [mq[1]]: {
                maxWidth: '100%',
                alignItems: 'flex-start',
              },
            }}
          />
          {isEditable && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => {
                setPictureModalVisible(true);
              }}
              css={{
                position: 'absolute',
                bottom: -12,
                right: -12,
              }}
            />
          )}
        </div>
        <ProfilePictureModal
          visible={pictureModalVisible}
          onCancel={() => setPictureModalVisible(false)}
          currentlyActive={profilePicture}
        />
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: 20,
            [mq[1]]: {
              marginLeft: 0,
            },
          }}
        >
          <h1
            css={{
              margin: '10px 0px 0px 0px',
              fontSize: '1.6rem',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              color: theme.text?.default,
            }}
            title={username}
          >
            {username}
          </h1>
          <span css={{ color: theme.text?.default, fontSize: '0.75rem' }}>
            {t('MEMBER_SINCE', {
              date: getDate(creationDate),
            })}
          </span>
        </div>
      </div>
      <BuildList username={username} isEditable={isEditable} />
    </div>
  );
};

export default UserProfile;
