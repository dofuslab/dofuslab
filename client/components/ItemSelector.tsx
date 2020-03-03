/** @jsx jsx */

import React from "react";
import { jsx } from "@emotion/core";
import { useQuery } from "@apollo/react-hooks";

import Item from "./Item";
import { ResponsiveGrid } from "../common/wrappers";
import ItemsQuery from "../graphql/queries/items.graphql";
import { items } from "../graphql/queries/__generated__/items";

const ItemSelector: React.FC = () => {
  const { data } = useQuery<items>(ItemsQuery);

  if (!data || !data.items) return null;

  return (
    <ResponsiveGrid numColumns={[0, 0, 2, 2]}>
      {data.items.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </ResponsiveGrid>
  );
};

export default ItemSelector;
