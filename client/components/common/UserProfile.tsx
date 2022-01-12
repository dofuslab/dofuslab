/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';
import { useTranslation } from 'i18n';
import { mq } from 'common/constants';
import { useQuery } from '@apollo/client';
import userProfileQuery from 'graphql/queries/userProfile.graphql';
import {
  userProfile,
  userProfileVariables,
} from 'graphql/queries/__generated__/userProfile';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { gray7 } from '../../common/mixins';
import BuildList from './BuildList';
import ProfilePictureModal from './ProfilePictureModal';

interface Props {
  username: string;
}

const profilePicStyles = css`
  display: inline-block;
  position: relative;
  width: 100%;
  max-width: 100%;
  & > button {
    visibility: hidden;
    opacity: 0;
  }
  &:hover > button {
    height: auto;
    visibility: visible;
    opacity: 1;
    transition: visibility 0s, opacity 0.2s linear;
  }
`;

const UserProfile: React.FC<Props> = ({ username }) => {
  const { data: userProfileData } = useQuery<userProfile, userProfileVariables>(
    userProfileQuery,
    { variables: { username } },
  );

  const [pictureModalVisible, setPictureModalVisible] = React.useState(false);

  const { t } = useTranslation('common');

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
        <div css={profilePicStyles}>
          <img
            src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
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
        </div>
        <ProfilePictureModal
          visible={pictureModalVisible}
          onCancel={() => setPictureModalVisible(false)}
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
            }}
          >
            {username}
          </h1>
          <span css={{ color: gray7 }}>
            {t('MEMBER_SINCE', {
              date: getDate(userProfileData?.userByName?.creationDate),
            })}
          </span>
        </div>
      </div>
      <BuildList username={username} />
    </div>
  );
};

export default UserProfile;
