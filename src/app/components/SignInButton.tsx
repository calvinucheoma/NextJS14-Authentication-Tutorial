'use client';

import { Button } from '@nextui-org/react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';

const SignInButton = () => {
  const { data: session } = useSession();

  // console.log({ session });

  // next-auth uses it's own type file that contains only name,email and image properties so we have to change this type if we want it to correspond to our User schema defined in prisma

  return (
    <div className="flex items-center gap-2">
      {session && session.user ? (
        <>
          <Link href="/profile">{`${session.user.firstName} ${session.user.lastName}`}</Link>
          <Link
            className="text-sky-500 hover:text-sky-600 transition-colors"
            href="/api/auth/signout"
          >
            Sign Out
          </Link>
        </>
      ) : (
        <>
          {/* <Button as={Link} href="/api/auth/signin"> */}
          <Button onClick={() => signIn()}>Sign In</Button>
          <Button as={Link} color="primary" href="/auth/signup" variant="flat">
            Sign Up
          </Button>
        </>
      )}
    </div>
  );
};

export default SignInButton;

// <Link href='/api/auth/signout'> and <Link href='/api/auth/signin'>, these API requests would be handled by the catch-all-route of the next-auth
// We can either choose to call the signin and signout functions that comes from next-auth or we can just call the API link as we're doing above
// The signIn function without any paramter, i.e {() => signIn() sends us to the signIn page that we have specified in the next-auth route handler in the 'pages' object.
