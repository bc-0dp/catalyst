import { z } from 'zod';

export interface B2BGraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
    locations?: Array<{ line: number; column: number }>;
    extensions?: Record<string, unknown>;
  }>;
  code?: number;
  message?: string;
}

export interface LoginWithB2BParams {
  customerId: number;
  customerAccessToken: {
    value: string;
    expiresAt: string;
  };
}

export const EnvSchema = z.object({
  B2B_API_TOKEN: z.string(),
  BIGCOMMERCE_CHANNEL_ID: z.string(),
});

export const ErrorResponseSchema = z.object({
  code: z.number(),
  data: z.record(z.any()).optional(),
  meta: z.object({ message: z.string() }).optional(),
  detail: z.string().optional(),
});

export const B2BTokenResponseSchema = z.object({
  data: z.object({
    token: z.array(z.string()).nonempty({ message: 'No token returned from B2B API' }),
  }),
});

export type EnvConfig = z.infer<typeof EnvSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type B2BTokenResponse = z.infer<typeof B2BTokenResponseSchema>;
