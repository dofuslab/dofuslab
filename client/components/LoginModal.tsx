/** @jsx jsx */
import React, { ChangeEvent } from 'react';
import { jsx } from '@emotion/core';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import { useMutation, useApolloClient } from '@apollo/react-hooks';
import {
  login as ILogin,
  loginVariables as ILoginVariables,
} from 'graphql/mutations/__generated__/login';
import loginMutation from 'graphql/mutations/login.graphql';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as ICurrentUser } from 'graphql/queries/__generated__/currentUser';

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<IProps> = ({ visible, onClose }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const client = useApolloClient();
  const [login, { loading }] = useMutation<ILogin, ILoginVariables>(
    loginMutation,
    {
      variables: { email, password },
    },
  );
  const onEmailChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [],
  );
  const onPasswordChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    [],
  );
  const handleOk = React.useCallback(async () => {
    const { data } = await login();
    if (data?.loginUser?.user) {
      client.writeQuery<ICurrentUser>({
        query: currentUserQuery,
        data: { currentUser: { ...data.loginUser.user } },
      });
      onClose();
      setEmail('');
      setPassword('');
    }
  }, [login, onClose, client, setEmail, setPassword]);

  return (
    <Modal
      title="Login"
      visible={visible}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={onClose}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        css={{
          width: 280,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>Email</div>
        <Input
          css={{ flex: '0 0 200px' }}
          value={email}
          onChange={onEmailChange}
          placeholder="Email"
        />
      </div>
      <div
        css={{
          width: 280,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>Password</div>
        <Input.Password
          css={{ flex: '0 0 200px' }}
          value={password}
          onChange={onPasswordChange}
          placeholder="Password"
        />
      </div>
    </Modal>
  );
};

export default LoginModal;
