/** @jsx jsx */

import React from "react";
import { jsx } from "@emotion/core";

import List from "antd/lib/list";
import { modifiedStartCase } from "../common/utils";

interface IStatTable {
  name?: string;
  groups: ReadonlyArray<{ [key: string]: string }>;
}

interface IStat {
  stat: string;
  value?: number;
}

const StatTable: React.FC<IStatTable> = props => {
  const stats = props.groups.map(group => Object.values(group)).flat();
  return (
    <List
      css={{ background: "white" }}
      itemLayout="horizontal"
      size="small"
      bordered
      dataSource={stats.map(v => ({
        stat: modifiedStartCase(v as string)
      }))}
      rowKey={(item: IStat) => item.stat}
      renderItem={(item: IStat) => (
        <List.Item
          css={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div css={{ fontSize: "0.75rem" }}>{item.stat}</div>
          <div css={{ fontSize: "0.75rem" }}>{item.value}</div>
        </List.Item>
      )}
    />
  );
};

export default StatTable;
