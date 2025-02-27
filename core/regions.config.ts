export interface Region {
  id: string;
  channelId: string;
  label: string;
  default?: boolean;
}

export const regions: Region[] = [
  {
    id: 'eu',
    channelId: '1705754',
    label: 'European Union',
  },
  {
    id: 'row',
    channelId: '1705753',
    label: 'Rest of World',
    default: true,
  },
];

export function getDefaultRegion(): Region {
  return regions.find((region) => region.default) || regions[0];
}

export function getRegionById(id: string | undefined | null): Region {
  if (!id) return getDefaultRegion();
  return regions.find((region) => region.id === id) || getDefaultRegion();
}

export function getChannelIdFromRegion(regionId: string | undefined | null): string {
  return getRegionById(regionId).channelId;
}

export const defaultRegion = getDefaultRegion().id;
