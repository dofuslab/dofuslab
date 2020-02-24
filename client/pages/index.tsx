import { NextPage } from "next";
import { SetBuilder } from "../components";

const Index: NextPage = () => (
  <div className="App">
    <SetBuilder />
  </div>
);

Index.getInitialProps = async () => {
  return {
    namespacesRequired: ["common"]
  };
};

export default Index;
