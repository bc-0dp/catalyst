'use client';

import { Checkbox, Combobox, Group, List, Slot, Style } from '@makeswift/runtime/controls';
import { ReactNode } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import { CustomerGroupsSchema, CustomerGroupsType } from '~/app/api/customer/groups/route';
import { GetCustomerGroupResponse } from '~/client/queries/get-customer';
import { runtime } from '~/lib/makeswift/runtime';

const CustomerGroupSchema = z.object({
  customer: z
    .object({
      customerGroupId: z.number(),
    })
    .nullable(),
});

interface Props {
  className: string;
  slots?: Array<{ group?: string; slot: ReactNode }>;
  simulateGroup: boolean;
  simulatedGroup?: string;
  noGroupSlot: ReactNode;
}

async function getAllCustomerGroups(): Promise<CustomerGroupsType | undefined> {
  try {
    const response = await fetch('/api/customer/groups');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: unknown = await response.json();
    const groups = CustomerGroupsSchema.parse(data);

    return groups;
  } catch (error) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching customer groups:', error);
      throw error;
    }
  }
}

async function fetchCustomerGroupData(): Promise<GetCustomerGroupResponse | undefined> {
  try {
    const response = await fetch('/api/customer/group');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: unknown = await response.json();
    const group = CustomerGroupSchema.parse(data);

    return group;
  } catch (error) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching customer group data:', error);
      throw error;
    }
  }
}

function CustomerGroupSlot({
  className,
  slots,
  simulateGroup,
  simulatedGroup = 'no-group',
  noGroupSlot,
}: Props) {
  const allSlots = slots?.concat({ group: 'no-group', slot: noGroupSlot });

  const { data, isLoading } = useSWR<GetCustomerGroupResponse | undefined>(
    '/api/customer/group',
    fetchCustomerGroupData,
  );

  // If we're simulating the group, render the selected group slot, otherwise use the group from the API. Coalesce to noGroupSlot if no group is found
  const groupSlot = simulateGroup
    ? (allSlots?.find((s) => s.group === simulatedGroup)?.slot ?? (
        // If the simulatedGroup does not exist in the list of slots
        <div className="p-4 text-center text-lg text-gray-400">
          This group needs to be added to "Targeted customer groups".
        </div>
      ))
    : (allSlots?.find((s) => s.group === `${data?.customer?.customerGroupId}`)?.slot ?? (
        <div className="p-4 text-center text-lg text-gray-400">
          This group needs to be added to "Targeted customer groups".
        </div>
      ));

  const slot = !data?.customer?.customerGroupId && !simulateGroup ? noGroupSlot : groupSlot;

  if (isLoading) return 'Loading...'; // Replace me with an appropriate loading state

  return <div className={className}>{slot}</div>;
}

runtime.registerComponent(CustomerGroupSlot, {
  type: 'catalyst-customer-group-slot',
  label: 'Catalyst / Customer Group Slot',
  props: {
    className: Style(),
    slots: List({
      label: 'Targeted customer groups',
      type: Group({
        label: 'Group',
        props: {
          group: Combobox({
            getOptions: async () => {
              try {
                const data = await getAllCustomerGroups();

                if (!data) return [];

                return data.map((d) => ({
                  id: `${d.id}`,
                  label: d.name,
                  value: `${d.id}`,
                }));
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error fetching customer group options:', error);

                return [];
              }
            },
          }),
          slot: Slot(),
        },
      }),
      getItemLabel(item) {
        return item?.group.label ?? 'Unselected group';
      },
    }),
    simulateGroup: Checkbox({ label: 'Simulate group', defaultValue: false }),
    simulatedGroup: Combobox({
      label: 'Simulated group',
      getOptions: async () => {
        try {
          const data = await getAllCustomerGroups();

          if (!data) return [];

          return data.map((d) => ({
            id: `${d.id}`,
            label: d.name,
            value: `${d.id}`,
          }));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error fetching customer group options:', error);

          return [];
        }
      },
    }),
    noGroupSlot: Slot(),
  },
});
