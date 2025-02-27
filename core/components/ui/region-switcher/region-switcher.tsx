'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@bigcommerce/components/button';
import { Dropdown } from '@bigcommerce/components/dropdown';

interface Region {
  id: string;
  label: string;
}

interface RegionSwitcherProps {
  regions: Region[];
  activeRegionId?: string;
  action: (region: string) => Promise<void>;
}

export const RegionSwitcher = ({ regions, activeRegionId, action }: RegionSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const activeRegion = regions.find(({ id }) => id === activeRegionId) || regions[0];

  const handleRegionSelect = async (region: Region) => {
    await action(region.id);

    startTransition(() => {
      router.refresh();
      setIsOpen(false);
    });
  };

  return (
    <Dropdown>
      <Dropdown.Button
        disabled={isPending}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1">
          {activeRegion.label}
          <span aria-hidden="true">▼</span>
        </span>
      </Dropdown.Button>
      {isOpen && (
        <Dropdown.Content>
          <ul className="py-2">
            {regions.map((region) => (
              <li key={region.id}>
                <Button
                  variant="link"
                  className={`w-full px-4 py-2 text-left ${
                    region.id === activeRegionId ? 'font-bold' : ''
                  }`}
                  onClick={() => handleRegionSelect(region)}
                >
                  {region.label}
                </Button>
              </li>
            ))}
          </ul>
        </Dropdown.Content>
      )}
    </Dropdown>
  );
};
