import { type MiddlewareFactory } from './compose-middlewares';
import { getChannelIdFromRegion, defaultRegion } from '~/regions.config';

export const withRegionChannel: MiddlewareFactory = (next) => {
  return (request, event) => {
    // Get region from cookie
    const regionCookie = request.cookies.get('region');
    const region = regionCookie?.value ?? defaultRegion;

    // Get channel ID based on region
    const channelId = getChannelIdFromRegion(region);

    // Set the channel ID header
    request.headers.set('x-bc-channel-id', channelId);

    console.log(`Region: ${region}, Channel ID: ${channelId}`);

    return next(request, event);
  };
};
