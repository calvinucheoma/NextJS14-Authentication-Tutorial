'use client';

import {
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/20/solid';
import { Button, Checkbox, Input, Link } from '@nextui-org/react';
import { useEffect, useState, useMemo } from 'react';
import { z } from 'zod';
import validator from 'validator'; //install the typescript types package too for this to work as it is not compatible with typescript
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordStrength } from 'check-password-strength';
import PasswordStrength from './PasswordStrength';
import { registerUser } from '@/lib/actions/authActions';
import { toast } from 'react-toastify';

const FormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(45, 'First name must be less than 45 characters')
      .regex(new RegExp('^[a-zA-Z]+$'), 'No special characters allowed'), //our first name must start with a letter (A-Z or a-z). The + sign indicates we need to have at least 1 letter and the $ sign signifies the end of our regex.
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(45, 'Last name must be less than 45 characters')
      .regex(new RegExp('^[a-zA-Z]+$'), 'No special characters allowed'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .refine(validator.isMobilePhone, 'Please enter a valid phone number'), //if we return true from this callback, it means that the pattern is satisfied and false means the pattern is not satisfied and we can return an error message. But we can use a package called 'validator' to handle this instead of writing the callback function.
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be less than 50 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must be less than 50 characters'),
    accepted: z.literal(true, {
      errorMap: () => ({
        message: 'Please accept all terms',
      }),
    }), //with literals, we can't directly set the error message so we need to put an object and specify an errorMap function that would return an object with a message inside it.
    // phone: z.string().regex(new RegExp('^[0-9]{8}')), //this means only numbers are allowed with a length of only 8 numbers allowed.
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }); // 'path' specifies the element in which we put the error

type InputType = z.infer<typeof FormSchema>;

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InputType>({
    resolver: zodResolver(FormSchema),
  });

  const [passStrength, setPassStrength] = useState(0);

  const [isVisiblePassword, setIsVisiblePassword] = useState(false);

  const password = watch().password;

  const passwordValue = useMemo(() => password, [password]);

  useEffect(() => {
    // console.log(watch().password);
    setPassStrength(passwordStrength(passwordValue).id); //the returning value of the passwordStrength function is an object, so we can extract 'id' from it which can be either 0, 1, 2 or 3 representing 'too weak', 'weak', 'medium' and 'strong' respectively.
  }, [passwordValue]);

  // We compute the value of password using watch().password.
  // We then use useMemo to memoize the value of password so that it only changes when watch().password changes.
  // Finally, we use passwordValue in the useEffect dependency array.
  // This way, you satisfy ESLint's requirement of having a simple expression in the useEffect dependency array without introducing any breaking changes to your code.

  // Had A UseEffect Linting Warning Error Because Of watch().password In The Dependency Array So Had To Use UseMemo

  // useEffect(() => {
  //   // console.log(watch().password);
  //   setPassStrength(passwordStrength(watch().password).id); //the returning value of the passwordStrength function is an object, so we can extract 'id' from it which can be either 0, 1, 2 or 3 representing 'too weak', 'weak', 'medium' and 'strong' respectively.
  // }, [watch().password]);

  // The warning you're receiving from ESLint is because you're using watch().password directly in the dependency array of the useEffect hook.
  // ESLint recommends extracting complex expressions from the dependency array to improve readability and avoid unnecessary re-renders.
  // To address this warning without breaking your code, you can use the useMemo hook to compute the value of watch().password and then include it in the dependency array.

  const toggleVisiblePassword = () => setIsVisiblePassword((prev) => !prev);

  const saveUser: SubmitHandler<InputType> = async (data) => {
    // console.log({ data });
    const { accepted, confirmPassword, ...user } = data;
    try {
      const result = await registerUser(user);
      toast.success('User registered successfully');
      reset();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(saveUser)}
      className="grid grid-cols-2 gap-3 p-2 shadow border rounded-md place-self-stretch"
    >
      <Input
        {...register('firstName')}
        errorMessage={errors.firstName?.message}
        isInvalid={!!errors.firstName} //double exclamation marks turns the errors.firstName to a boolean. This highlights the input field in a red color if there is an error.
        label="First Name"
        startContent={<UserIcon className="w-4" />}
      />
      <Input
        {...register('lastName')}
        errorMessage={errors.lastName?.message}
        isInvalid={!!errors.lastName}
        label="Last Name"
        startContent={<UserIcon className="w-4" />}
      />
      <Input
        {...register('email')}
        errorMessage={errors.email?.message}
        isInvalid={!!errors.email}
        label="Email"
        type="email"
        startContent={<EnvelopeIcon className="w-4" />}
        className="col-span-2"
      />
      <Input
        {...register('phone')}
        errorMessage={errors.phone?.message}
        isInvalid={!!errors.phone}
        label="Phone"
        type="phone"
        startContent={<PhoneIcon className="w-4" />}
        className="col-span-2"
      />
      <Input
        {...register('password')}
        errorMessage={errors.password?.message}
        isInvalid={!!errors.password}
        label="Password"
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
        className="col-span-2"
      />
      <PasswordStrength passStrength={passStrength} />
      <Input
        {...register('confirmPassword')}
        errorMessage={errors.confirmPassword?.message}
        isInvalid={!!errors.confirmPassword}
        label="Confirm Password"
        type={isVisiblePassword ? 'text' : 'password'}
        startContent={<KeyIcon className="w-4" />}
        className="col-span-2"
      />
      <Controller
        control={control}
        name="accepted"
        render={({ field }) => (
          <Checkbox
            onChange={field.onChange}
            onBlur={field.onBlur}
            className="col-span-2"
          >
            I accept the <Link href="/terms">terms</Link>
          </Checkbox>
          //Checkbox does not have an errorMessage prop so we include it manually
        )}
      />

      {!!errors.accepted && (
        <p className="text-red-500">{errors.accepted.message}</p>
      )}

      <div className="flex justify-center col-span-2">
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

export default SignUpForm;

// startContent sets anything we add to it to the left side of our input. We can add an icon here.
// HeroIcons is compatible with tailwindcss so we can use tailwindcss to style the icons.
// The Checkbox component of NextUI does not work with the 'register' function of React-hook-form as it returns undefined as the value always, so we wrap it in a Controller component from react-hook-form and remove the 'register' function from the Checkbox component.
// npm i @hookform/resolvers package resolves Zod to work with react-hook-form

/************************************** NOTES ON USEMEMO AND USEEFFECT *******************************/
// useMemo:

// Purpose: Memoizes the result of a function to optimize performance by caching expensive computations.
// Behavior: The provided function is only re-executed when one of the dependencies in the dependency array changes.
// Typical Use Cases: Memoizing complex computations, data transformations, or expensive calculations.

// useEffect:

// Purpose: Executes side effects in function components, such as data fetching, DOM manipulation, or subscribing to events.
// Behavior: The provided function is executed after every render by default. You can specify dependencies in the dependency array to control when the effect should re-run.
// Typical Use Cases: Fetching data from an API, updating the DOM, subscribing to events.

// useMemo:

// Purpose: useMemo is used to memoize expensive computations so that they are only re-executed when necessary. It's similar to the concept of memoization in functional programming.

// How it works: You provide a function and a dependency array to useMemo. React will execute the function and cache its result. The result will only be recomputed when one of the dependencies in the array changes.

// Typical use cases: Memoizing computationally expensive operations, such as complex calculations or data transformations.

// Example: const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useEffect:

// Purpose: useEffect is used to perform side effects in function components. Side effects can include data fetching, DOM manipulation, and subscribing to events.

// How it works: You provide a function to useEffect. React will execute this function after every render (by default). You can also specify dependencies in the dependency array, and the effect will only re-run if any of these dependencies change.

// Typical use cases: Fetching data from an API, subscribing to events, updating the DOM.

// Example: useEffect(() => {
//   // Perform side effects here
//   document.title = `You clicked ${count} times`;
// }, [count]); // Only re-run the effect if count changes

// While there may be scenarios where you could technically achieve similar behavior using either useMemo or useEffect,
// it's essential to use them according to their intended purposes for clarity and maintainability of your code.
// Mixing their use inappropriately could lead to confusion for other developers and may not optimize your code as efficiently as using each hook for its intended purpose.

// For example, using useMemo for data fetching could lead to unexpected behavior because useMemo is not designed to handle asynchronous operations like data fetching.
// It's better to use useEffect for data fetching because it's explicitly designed for executing side effects, including asynchronous operations.
// Similarly, using useEffect for complex computations may not be efficient because useEffect is intended for side effects, not for optimizing computations.
// In such cases, useMemo would be more appropriate.
