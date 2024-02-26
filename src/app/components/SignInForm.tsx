'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@nextui-org/react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

interface Props {
  callbackUrl?: string;
}

const FormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string({ required_error: 'Please enter your password' }),
});

type InputType = z.infer<typeof FormSchema>;

const SignInForm = (props: Props) => {
  const router = useRouter();

  const [visiblePassword, setVisiblePassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InputType>({ resolver: zodResolver(FormSchema) });

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    const result = await signIn('credentials', {
      redirect: false, //if we set it to true, it would redirect the user to a callback url that we can specify here but it would refresh the page and we do not want the page to refresh so we use the useRouter hook to redirect the user to the callback url manually.
      username: data.email,
      password: data.password,
    });
    if (!result?.ok) {
      toast.error(result?.error);
      return;
    }

    toast.success(`Welcome ${data.email}`);

    router.push(props.callbackUrl ? props.callbackUrl : '/');

    // when we call the 'signIn' function from next-auth here, we are actually calling the 'authorize' function from the credentials provider and our username and password gets passed into it.
  };

  return (
    <form
      className="flex flex-col gap-2  border rounded-md shadow overflow-hidden w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="bg-gradient-to-b from-white to-slate-200 dark:from-slate-700 dark:to-slate-900 p-2 text-center">
        Sign In Form
      </div>

      <div className="p-2 flex flex-col gap-2">
        <Input
          label="Email"
          {...register('email')}
          errorMessage={errors.email?.message}
        />
        <Input
          type={visiblePassword ? 'text' : 'password'}
          label="Password"
          {...register('password')}
          errorMessage={errors.password?.message}
          endContent={
            <button
              type="button"
              onClick={() => setVisiblePassword((prev) => !prev)}
            >
              {visiblePassword ? (
                <EyeSlashIcon className="w-4" />
              ) : (
                <EyeIcon className="w-4" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-center gap-2">
          <Button
            color="primary"
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
          <Button as={Link} href="/auth/signup">
            Sign Up
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SignInForm;
