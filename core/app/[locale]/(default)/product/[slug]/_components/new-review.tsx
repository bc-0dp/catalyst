'use client';

import { CircleUser, MessageCircleMore } from 'lucide-react';
import React, { FormEventHandler, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
  Input,
  TextArea,
} from '~/components/ui/form';
import { Message } from '~/components/ui/message';
import { Rating } from '~/components/ui/rating';

import { submitNewReview } from './product-form/_actions/submit-new-review';

interface Props {
  productId: number;
}

const Submit = () => {
  const { pending } = useFormStatus();

  return (
    <FormSubmit asChild>
      <Button
        className="relative mt-8 w-fit items-center px-8 py-2"
        loading={pending}
        loadingText="Submitting"
        variant="primary"
      >
        Submit Review
      </Button>
    </FormSubmit>
  );
};

export const NewReview = ({ productId }: Props) => {
  const [rating, setRating] = useState(0);

  const [isAuthorValid, setIsAuthorValid] = useState(true);
  const [isTextValid, setIsTextValid] = useState(true);
  const [isTitleValid, setIsTitleValid] = useState(true);

  const [state, formAction] = useFormState(submitNewReview, { status: 'idle' });

  const isFormInvalid = state.status === 'error';

  const handleInputValidation: FormEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const validationStatus = e.currentTarget.validity.valueMissing;

    switch (e.currentTarget.name) {
      case 'author': {
        setIsAuthorValid(!validationStatus);

        return;
      }

      case 'text': {
        setIsTextValid(!validationStatus);

        return;
      }

      case 'title': {
        setIsTitleValid(!validationStatus);
      }
    }
  };

  return (
    <>
      {isFormInvalid && (
        <Message className="mb-8 lg:col-span-2" variant="error">
          <p>Error submitting form</p>
        </Message>
      )}

      <Form
        action={formAction}
        className="x-auto mb-10 mt-8 grid grid-cols-1 gap-y-6 lg:w-2/3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2"
      >
        <Field className="relative space-y-2 pb-7" name="author">
          <FieldLabel htmlFor="author" isRequired={true}>
            Author
          </FieldLabel>
          <FieldControl asChild>
            <Input
              error={!isAuthorValid}
              icon={<CircleUser />}
              id="author"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="text"
            />
          </FieldControl>
          <div className="relative h-7">
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
              match="valueMissing"
            >
              Name is required
            </FieldMessage>
          </div>
        </Field>

        <Field className="relative space-y-2 pb-7" name="title">
          <FieldLabel className="font-semibold" htmlFor="title" isRequired={true}>
            Title
          </FieldLabel>
          <FieldControl asChild>
            <Input
              error={!isTitleValid}
              icon={<MessageCircleMore />}
              id="title"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="text"
            />
          </FieldControl>
          <div className="relative space-y-2 pb-7">
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
              match="valueMissing"
            >
              Please enter a title
            </FieldMessage>
          </div>
        </Field>

        <Field className="relative space-y-2 pb-7" name="rating">
          <FieldLabel className="font-semibold" htmlFor="rating" isRequired={true}>
            Rating
          </FieldLabel>
          <Rating onChange={setRating} rating={rating} />
          <FieldControl asChild>
            <input
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              type="hidden"
              value={rating}
            />
          </FieldControl>
          <div className="relative h-7">
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
              match="valueMissing"
            >
              Please provide a rating
            </FieldMessage>
          </div>
        </Field>

        <Field className="relative col-span-full max-w-full space-y-2 pb-5" name="text">
          <FieldLabel htmlFor="text" isRequired>
            Review
          </FieldLabel>
          <FieldControl asChild>
            <TextArea
              error={!isTextValid}
              id="text"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
            />
          </FieldControl>
          <div className="relative h-7">
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
              match="valueMissing"
            >
              Review is required
            </FieldMessage>
          </div>
        </Field>

        <input name="productEntityId" type="hidden" value={productId} />

        <Submit />
      </Form>
    </>
  );
};
