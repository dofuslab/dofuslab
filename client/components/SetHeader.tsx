/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import Input from 'antd/lib/input';

import { customSet } from 'graphql/fragments/__generated__/customSet';

interface IProps {
  customSet?: customSet | null;
}

const SetHeader: React.FC<IProps> = ({ customSet }) => {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <div
      css={{
        margin: '8px 20px',
        display: 'flex',
        alignItems: 'baseline',
        flex: '0 0 48px',
      }}
    >
      {isEditing ? (
        <Input css={{ fontSize: '1.5rem', fontWeight: 500, width: 240 }} />
      ) : (
        <div
          css={{ fontSize: '1.5rem', fontWeight: 500, maxWidth: 400 }}
          onClick={() => {
            setIsEditing(true);
          }}
        >
          {customSet?.name || 'Untitled'}
        </div>
      )}

      <div css={{ marginLeft: 20 }}>Level {customSet?.level}</div>
    </div>
  );
};

export default SetHeader;
