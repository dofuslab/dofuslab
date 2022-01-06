/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import BuildList from './BuildList';

interface Props {
  username: string;
  onClose?: () => void;
}

const MyBuilds: React.FC<Props> = ({ onClose, username }) => {
  return (
      <BuildList 
        username={username}
        onClose={onClose}
      />  
  );
};

export default MyBuilds;
