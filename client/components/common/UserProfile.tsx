/** @jsxImportSource @emotion/react */

import React from 'react';

import { useTranslation } from 'next-i18next';
import { useTheme } from '@emotion/react';
import { mq } from 'common/constants';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getImageUrl } from 'common/utils';
import BuildList from './BuildList';
import ProfilePictureModal from './ProfilePictureModal';
import { Media } from './Media';

interface Props {
  username: string;
  creationDate: string;
  profilePicture: string;
  isEditable: boolean;
  isMobile?: boolean;
}

const UserProfile: React.FC<Props> = ({
  username,
  creationDate,
  profilePicture,
  isEditable,
  isMobile,
}) => {
  const [pictureModalVisible, setPictureModalVisible] = React.useState(false);

  const { t } = useTranslation('common');
  const theme = useTheme();

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
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-betweeen',
          [mq[1]]: {
            flexDirection: 'column',
            margin: '12px 32px 0px 0px',
            flex: '0 0 240px',
            textAlign: 'left',
            alignItems: 'flex-start',
          },
        }}
      >
        <div>
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
                maxWidth: 80,
                alignItems: 'center',
                borderRadius: '50%',
                border: `1px solid ${theme.border?.light}`,
                display: 'block',
                [mq[1]]: {
                  maxWidth: '100%',
                  alignItems: 'flex-start',
                },
              }}
            />
            {isEditable && !isMobile && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                shape="circle"
                onClick={() => {
                  setPictureModalVisible(true);
                }}
                css={{
                  position: 'absolute',
                  bottom: 24,
                  right: 8,
                }}
              />
            )}
          </div>
        </div>
        <ProfilePictureModal
          visible={pictureModalVisible}
          onCancel={() => setPictureModalVisible(false)}
          currentlyActive={profilePicture}
        />
        <div
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginLeft: 0,
            width: '100%',
            alignItems: 'center',
            [mq[1]]: {
              marginLeft: 0,
              textAlign: 'center',
              justifyContent: 'center',
            },
          }}
        >
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minWidth: 0,
            }}
          >
            <h1
              css={{
                margin: '0px',
                fontSize: '1.6rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                width: '100%',
                color: theme.text?.brightText,
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
          {isMobile && isEditable && (
            <Button
              onClick={() => {
                setPictureModalVisible(true);
              }}
              css={{ fontSize: '0.75rem' }}
            >
              <span css={{ marginRight: 12 }}>
                <EditOutlined />
              </span>
              {t('CHANGE_PHOTO')}
            </Button>
          )}
        </div>
      </div>
      <Media lessThan="xs">
        <BuildList username={username} isEditable={isEditable} isMobile />
      </Media>
      <Media greaterThanOrEqual="xs" css={{ flex: '1 1 auto' }}>
        <BuildList
          username={username}
          isEditable={isEditable}
          isMobile={false}
          isProfile
        />
      </Media>
    </div>
  );
};

export default UserProfile;
