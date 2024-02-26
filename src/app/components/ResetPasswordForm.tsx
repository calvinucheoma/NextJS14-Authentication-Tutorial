'use client';

import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@nextui-org/react';
import { passwordStrength } from 'check-password-strength';
import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import PasswordStrength from './PasswordStrength';
import { resetPassword } from '@/lib/actions/authActions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Props {
  jwtUserId: string;
}

const FormSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be less than 50 characters'),
    confirmPassword: z.string(), //we do not need to chain the min and max functions again. We chain the 'refine' function after the 'object' function to compare the two passwords
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type InputType = z.infer<typeof FormSchema>;

const ResetPasswordForm = ({ jwtUserId }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InputType>({ resolver: zodResolver(FormSchema) });

  const router = useRouter();

  const [isVisiblePassword, setIsVisiblePassword] = useState(false);

  const [passStrength, setPassStrength] = useState(0);

  const password = watch().password;

  const passwordValue = useMemo(() => password, [password]);

  useEffect(() => {
    setPassStrength(passwordStrength(passwordValue).id);
  }, [passwordValue]);

  const toggleVisiblePassword = () => setIsVisiblePassword((prev) => !prev);

  const resetUserPassword: SubmitHandler<InputType> = async (data) => {
    try {
      const result = await resetPassword(jwtUserId, data.password);

      if (result === 'success')
        toast.success('Your password has been reset successfully!');

      router.push('/auth/signin');
    } catch (error) {
      console.error(error); // Log the error for debugging
      if (error instanceof Error) {
        toast.error(error.message); // Display the error message using toast.error()
      } else {
        toast.error('An error occurred'); // Fallback message if error type is not Error
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(resetUserPassword)}
      className="flex flex-col gap-2 p-2 m-2 border rounded-md shadow"
    >
      <div className="text-center p-2">Reset Your Password</div>
      <Input
        label="Password"
        {...register('password')}
        errorMessage={errors.password?.message}
        isInvalid={!!errors.password}
        type={isVisiblePassword ? 'text' : 'password'}
        startContent={<KeyIcon className="w-4" />}
        endContent={
          isVisiblePassword ? (
            <EyeSlashIcon
              className="w-4 cursor-pointer"
              onClick={toggleVisiblePassword}
            />
          ) : (
            <EyeIcon
              className="w-4 cursor-pointer"
              onClick={toggleVisiblePassword}
            />
          )
        }
      />
      <PasswordStrength passStrength={passStrength} />
      <Input
        label="Confirm Password"
        {...register('confirmPassword')}
        errorMessage={errors.confirmPassword?.message}
        isInvalid={!!errors.confirmPassword}
        type={isVisiblePassword ? 'text' : 'password'}
        startContent={<KeyIcon className="w-4" />}
        className="col-span-2"
      />
      <div className="flex justify-center">
        <Button
          type="submit"
          color="primary"
          className="w-48"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Please wait...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
