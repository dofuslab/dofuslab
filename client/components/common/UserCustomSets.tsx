/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import BuildList from './BuildList';
import { mq } from 'common/constants';

interface Props {
  username: string;
}

const UserCustomSets: React.FC<Props> = ({ username }) => {

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
            width: '25%',
          },
        }}
      >
        <img
          src="https://media.discordapp.net/attachments/645410912605437972/924539234709282866/Layer_9.png"
          alt="Avatar"
          css={{
            maxWidth: 120,
            alignItems: 'center',
            borderRadius: 6,
            border: '4px solid black',
            outline: '1px solid #434343',
            [mq[1]]: {
              maxWidth: 240,
              alignItems: 'flex-start',
            },
          }}
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
          <h1 css={{ margin: '10px 0px 0px 0px', fontSize: 28 }}>{username}</h1>
          <span css={{ color: '#8b949e' }}>Member since 05/01/2021</span>
        </div>
      </div>
      <BuildList username={username} />
    </div>
  );
};

export default UserCustomSets;
