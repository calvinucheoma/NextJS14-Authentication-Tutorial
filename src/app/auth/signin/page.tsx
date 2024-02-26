import SignInForm from '@/app/components/SignInForm';
import Link from 'next/link';

interface Props {
  searchParams: {
    callbackUrl?: string;
  };
}

const SignInPage = ({ searchParams }: Props) => {
  //   console.log({ searchParams }); ==={ searchParams: { callbackUrl: 'http://localhost:3000/' } }
  // This is how the link looks on this signIn page: http://localhost:3000/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F
  // And the callbackUrl on this page is: http://localhost:3000/ , so searchParams is a special prop passed on by nextjs routing that identifies the parameter name after the '?' as a property key to searchParams. In this case, it is callbackUrl and the value is our home page.
  return (
    <div className="flex items-center justify-center flex-col gap-3">
      <SignInForm callbackUrl={searchParams.callbackUrl} />
      <Link className="text-blue-500" href="/auth/forgotPassword">
        Forgot Your Password?
      </Link>
    </div>
  );
};

export default SignInPage;
