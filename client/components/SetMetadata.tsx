/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import { BORDER_COLOR } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';

interface IProps {
  customSet?: customSet;
}

const SetMetadata: React.FC<IProps> = ({ customSet }) => {
  return (
    <div
      css={{
        background: 'white',
        border: `1px solid ${BORDER_COLOR}`,
        width: 248,
        height: 72,
        margin: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.75rem',
        borderRadius: 4,
      }}
    >
      {customSet?.name}
    </div>
  );
};

export default SetMetadata;
