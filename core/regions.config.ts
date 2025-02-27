export const regionToChannelIdMappings: Record<string, string> = {
  eu: '1705754',
  row: '1705753',
};

export const defaultRegion = 'row';

export function getChannelIdFromRegion(region = defaultRegion): string {
  return regionToChannelIdMappings[region] ?? regionToChannelIdMappings[defaultRegion];
}

export const regions = [
  { id: 'eu', label: 'European Union' },
  { id: 'row', label: 'Rest of World' },
];