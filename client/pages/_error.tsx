import Error, { ErrorProps } from "next/error";

const ErrorPage = (props: ErrorProps) => <Error {...props} />;

ErrorPage.getInitialProps = async () => {
  return {
    namespacesRequired: ["common"]
  };
};

export default ErrorPage;
