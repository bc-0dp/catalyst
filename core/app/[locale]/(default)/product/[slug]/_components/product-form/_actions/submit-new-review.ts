'use server';
import { z } from 'zod';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
const ReviewSchema = z.object({
  author: z.string(),
  rating: z.coerce.number(),
  text: z.string().trim(),
  title: z.string().trim(),
  productEntityId: z.coerce.number(),
});
const SubmitNewReviewMutation = graphql(`
  mutation SubmitNewReviewMutation($input: AddProductReviewInput!) {
    catalog {
      addProductReview(input: $input) {
        errors {
          __typename
          ... on Error {
            message
          }
        }
      }
    }
  }
`);
export const submitNewReview = async (_previousState: unknown, formData: FormData) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const { productEntityId, ...review } = ReviewSchema.parse(Object.fromEntries(formData.entries()));
  const response = await client.fetch({
    document: SubmitNewReviewMutation,
    variables: { input: { productEntityId, review } },
    fetchOptions: { cache: 'no-store' },
    customerAccessToken,
  });
  console.log(response);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!response.data) {
    return {
      status: 'error',
      error: 'An unknown error occurred',
    };
  }
  const result = response.data.catalog.addProductReview;
  if (result.errors.length > 0) {
    return {
      status: 'error',
      error: result.errors.map((error: { message: string }) => error.message).join('\n'),
    };
  }
  return { status: 'success' };
};
