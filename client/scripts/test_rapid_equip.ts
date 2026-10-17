import assert from 'assert';
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  gql,
} from '@apollo/client';
import { resolveEquipSlotId } from '../common/equip-slot';

const slots = Array.from({ length: 6 }, (_, index) => ({
  id: `trophy-${index + 1}`,
  order: index + 1,
}));
const gear = (slotId: string, itemId: string) => ({
  __typename: 'EquippedItem' as const,
  id: `gear-${slotId}`,
  slot: { __typename: 'ItemSlot' as const, id: slotId },
  item: { __typename: 'Item' as const, id: itemId },
});
const occupied = slots.map(({ id }) => gear(id, id));
assert.equal(resolveEquipSlotId(slots[0].id, slots, occupied, true), null);
assert.equal(
  resolveEquipSlotId(slots[0].id, slots, occupied, false),
  slots[0].id,
);
assert.equal(resolveEquipSlotId(slots[4].id, slots, [], true), slots[4].id);
assert.equal(
  resolveEquipSlotId(
    'weapon',
    [{ id: 'weapon', order: 1 }],
    [gear('weapon', 'old')],
    true,
  ),
  'weapon',
);
assert.equal(
  resolveEquipSlotId(
    slots[0].id,
    [...slots].reverse(),
    [gear(slots[0].id, 'old')],
    true,
  ),
  slots[1].id,
);

const fragment = gql`
  fragment TestBuild on CustomSet {
    id
    equippedItems {
      id
      slot {
        id
      }
      item {
        id
      }
    }
  }
`;
const mutation = gql`
  mutation Equip($itemSlotId: String!, $itemId: String!) {
    updateCustomSetItem(itemSlotId: $itemSlotId, itemId: $itemId) {
      customSet {
        ...TestBuild
      }
    }
  }
  ${fragment}
`;
type Build = {
  __typename: 'CustomSet';
  id: string;
  equippedItems: ReturnType<typeof gear>[];
};

async function testRapidEquips() {
  const requests: {
    slot: string;
    item: string;
    complete: (build: Build) => void;
  }[] = [];
  const cache = new InMemoryCache();
  const client = new ApolloClient({
    cache,
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          requests.push({
            slot: operation.variables.itemSlotId,
            item: operation.variables.itemId,
            complete: (customSet) => {
              observer.next({
                data: {
                  updateCustomSetItem: {
                    __typename: 'UpdateCustomSetItem',
                    customSet,
                  },
                },
              });
              observer.complete();
            },
          });
        }),
    ),
  });
  const initial: Build = {
    __typename: 'CustomSet',
    id: 'build',
    equippedItems: [],
  };
  cache.writeFragment({ id: 'CustomSet:build', fragment, data: initial });
  const read = () =>
    cache.readFragment<Build>({ id: 'CustomSet:build', fragment }, true)!;
  let finishPermissionCheck!: () => void;
  const permissionCheck = new Promise<void>((resolve) => {
    finishPermissionCheck = resolve;
  });
  async function click(itemId: string) {
    // Both rendered cards chose slot 1 before the permission check completed.
    const requestedSlot = slots[0].id;
    await permissionCheck;
    const latest = read();
    const slot = resolveEquipSlotId(
      requestedSlot,
      slots,
      latest.equippedItems,
      true,
    );
    if (!slot) return;
    return client.mutate({
      mutation,
      variables: { itemSlotId: slot, itemId },
      optimisticResponse: {
        updateCustomSetItem: {
          __typename: 'UpdateCustomSetItem',
          customSet: {
            ...latest,
            equippedItems: [...latest.equippedItems, gear(slot, itemId)],
          },
        },
      },
    });
  }
  const clicks = [click('shaker'), click('nomad'), click('major-mule')];
  finishPermissionCheck();
  await Promise.resolve();
  assert.deepEqual(
    read().equippedItems.map((item) => item.slot.id),
    slots.slice(0, 3).map((slot) => slot.id),
  );
  assert.deepEqual(
    read().equippedItems.map((item) => item.item.id),
    ['shaker', 'nomad', 'major-mule'],
  );
  assert.deepEqual(
    requests.map((request) => request.slot),
    slots.slice(0, 3).map((slot) => slot.id),
  );
  for (let index = 0; index < requests.length; index++) {
    requests[index].complete({
      ...initial,
      equippedItems: requests
        .slice(0, index + 1)
        .map((request) => gear(request.slot, request.item)),
    });
    await clicks[index];
  }
  assert.equal(read().equippedItems.length, 3);
  client.stop();
}

testRapidEquips()
  .then(() =>
    console.log(
      'PASS: rapid optimistic equips, full slots, explicit replacement and single-slot equipment',
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
