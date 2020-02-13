/** @jsx jsx */

import React from "react";
import { jsx } from "@emotion/core";
import { useQuery } from "@apollo/react-hooks";

import Equipment from "./Equipment";
import { mq, EQUIPMENT_SLOT_TO_TYPES } from "../common/constants";
import { EquipmentSlotId, Equipment as EquipmentType } from "../common/types";
import { EQUIPMENT_LISTS } from "../common/data";
import { ResponsiveGrid } from "../common/wrappers";
import ItemsQuery from "../graphql/queries/items.graphql";
import { items } from "../graphql/queries/__generated__/items";

interface IEquipmentSelector {
  slotId: EquipmentSlotId;
}

const EquipmentSelector: React.FC<IEquipmentSelector> = props => {
  const equipmentTypes = EQUIPMENT_SLOT_TO_TYPES[props.slotId];
  const equipmentList: EquipmentType[] = [];
  const { data } = useQuery<items>(ItemsQuery);

  console.log(data);

  equipmentTypes
    .filter(equipmentType => !!EQUIPMENT_LISTS[equipmentType])
    .forEach(equipmentType => {
      EQUIPMENT_LISTS[equipmentType]!.forEach(equipment =>
        equipmentList.push(equipment)
      );
    });

  return (
    <ResponsiveGrid numColumns={[0, 0, 2, 2]}>
      {equipmentList.map(equipment => (
        <Equipment key={equipment.name} equipment={equipment} />
      ))}
    </ResponsiveGrid>
  );
};

export default EquipmentSelector;
