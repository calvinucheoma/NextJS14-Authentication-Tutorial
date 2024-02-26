'use client';
import { forgotPassword } from '@/lib/actions/authActions';
import { EnvelopeIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@nextui-org/react';
import Image from 'next/image';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type InputType = z.infer<typeof FormSchema>;

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InputType>({
    resolver: zodResolver(FormSchema),
  });

  const submitRequest: SubmitHandler<InputType> = async (data) => {
    // console.log(data);
    try {
      const result = await forgotPassword(data.email);

      toast.success('Reset password link has been sent to your email!');

      reset();
    } catch (error) {
      console.error(error); // Log the error for debugging
      if (error instanceof Error) {
        toast.error(error.message); // Display the error message using toast.error()
      } else {
        toast.error('An error occurred'); // Fallback message if error type is not Error
      }
    }
  };

  //   We use the 'instanceof' operator to check if the caught 'error' object is an instance of the 'Error' type.
  // If it is, TypeScript knows that the 'message' property exists and the linting error is resolved.
  // If the 'error' object is not an instance of 'Error', we provide a fallback error message to handle other types of errors.

  return (
    <div className="grid grid-cols-1 px-5 md:grid-cols-3 items-center">
      <form
        className="flex flex-col gap-2 p-2 border rounded-md shadow m-2"
        onSubmit={handleSubmit(submitRequest)}
      >
        <div className="text-center p-2">Enter Your Email Address</div>
        <Input
          label="Email"
          {...register('email')}
          startContent={<EnvelopeIcon className="w-4" />}
          errorMessage={errors.email?.message}
        />
        <Button
          isLoading={isSubmitting}
          disabled={isSubmitting}
          color="primary"
          type="submit"
        >
          {isSubmitting ? 'Please wait...' : 'Submit'}
        </Button>
      </form>
      <Image
        src={'/forgot-password.avif'}
        width={500}
        height={500}
        alt="forgot password"
        className="col-span-2 place-self-center mt-8"
      />
    </div>
  );
};

export default ForgotPasswordPage;
