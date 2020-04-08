/** @jsx jsx */
import React from 'react';
import { NextPage } from 'next';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';

import { currentUser } from 'graphql/queries/__generated__/currentUser';
import { mediaStyles } from 'components/common/Media';
import Head from 'next/head';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { useRouter } from 'next/router';
import Button from 'antd/lib/button';
import { useTranslation } from 'i18n';
import { resendVerificationEmail } from 'graphql/mutations/__generated__/resendVerificationEmail';
import resendVerificationEmailMutation from 'graphql/mutations/resendVerificationEmail.graphql';
import CommonLayout from 'components/common/CommonLayout';

const VerifyEmailPage: NextPage = () => {
  const { data } = useQuery<currentUser>(currentUserQuery);
  const router = useRouter();
  const { t } = useTranslation('auth');
  const [mutate] = useMutation<resendVerificationEmail>(
    resendVerificationEmailMutation,
  );

  const onClick = React.useCallback(() => {
    mutate();
  }, [mutate]);

  const email = data?.currentUser?.email;

  React.useEffect(() => {
    if (data?.currentUser?.verified) {
      router.replace('/', {
        pathname: '/',
        query: { verify_email: 'already_verified' },
      });
    }
    if (!data?.currentUser) {
      router.replace('/', '/');
    }
  }, [data, router]);

  return (
    <CommonLayout>
      <Head>
        <style
          type="text/css"
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
        <title>DofusLab.io</title>
      </Head>
      <div
        css={{
          margin: '100px auto 60px auto',
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <h1 css={{ fontSize: '32px' }}>{t('THANKS_FOR_SIGNING_UP')}</h1>
        <div css={{ marginBottom: 20 }}>
          <img src="https://dofus-lab.s3.us-east-2.amazonaws.com/item/18191.png" />
        </div>
        <div css={{ fontSize: '16px', marginBottom: 20 }}>
          {t('VERIFICATION_MESSAGE', { email })}
        </div>
        <Button size="large" onClick={onClick}>
          {t('RESEND_VERIFICATION_EMAIL')}
        </Button>
      </div>
    </CommonLayout>
  );
};

VerifyEmailPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['auth'],
  };
};

export default VerifyEmailPage;
