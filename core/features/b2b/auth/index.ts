import '../types';
import { b2bClient } from '../client';

const loginWithB2B = async ({
  customerId,
  customerAccessToken,
}: {
  customerId: number;
  customerAccessToken: { value: string; expiresAt: string };
}) => {
  try {
    return await b2bClient.loginWithB2B({ customerId, customerAccessToken });
  } catch (error) {
    console.error('[B2B LOGIN] Failed:', error);
    return null;
  }
};

const fetchB2BUser = async (b2bToken: string) => {
  try {
    const b2bUser = await b2bClient.getCurrentUser(b2bToken);
    return b2bUser;
  } catch (error) {
    console.error('[B2B USER] Failed to fetch user data:', error);
    return null;
  }
};

export { loginWithB2B, fetchB2BUser };