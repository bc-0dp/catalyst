import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import {getSessionCustomerId} from '~/auth';

const ReviewSchema = z.object({
  author: z.string(),
  email: z.string().email().optional(),
  rating: z.number(),
  text: z.string().trim(),
  title: z.string().trim(),
  productEntityId: z.number(),
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


export const POST = async (request: NextRequest) => {
    const customerId = await getSessionCustomerId();
    console.log('customerId', customerId);

  try {
    const body = await request.json();
    const parsedData = ReviewSchema.parse(body);

    const req = {
      document: SubmitNewReviewMutation,
      variables: {
        input: {
          productEntityId: parsedData.productEntityId,
          review: {
            author: parsedData.author,
            email: parsedData.email,
            rating: parsedData.rating,
            text: parsedData.text,
            title: parsedData.title,
          },
        },
      },
      customerId,
    };
    
      console.log('req', req);
    const response = await client.fetch(req);

    console.log('response', response);  
    if (!response.data) {
      return NextResponse.json({
        status: 'error',
        error: response,
      });
    }

    const result = response.data.catalog.addProductReview;
    if (result.errors && result.errors.length > 0) {
      return NextResponse.json({
        status: 'error',
        error: result.errors.map((error: { message: string }) => error.message).join('\n'),
      });
    }

    return NextResponse.json({ status: 'success', data: parsedData });
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
      });
    }
    return NextResponse.json({ status: 'error', error: 'An unknown error occurred' });
  }
};

export const runtime = 'edge';