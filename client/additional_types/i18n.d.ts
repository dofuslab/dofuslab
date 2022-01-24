declare module "~i18n" {
  export { Trans } from "react-i18next";
  export { default as Link } from "next/link";
  export { default as Router } from "next/router";

  export function withNamespaces(namespace: string | string[]): any;
  export function appWithTranslation(Component: React.ComponentType): any;
}
