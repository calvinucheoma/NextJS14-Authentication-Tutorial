import { activateUser } from '@/lib/actions/authActions';

interface Props {
  params: {
    jwt: string;
  };
}

const ActivationPage = async ({ params }: Props) => {
  const result = await activateUser(params.jwt);
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {result === 'userNotExist' ? (
        <p className="text-red-500 text-2xl">User account does not exist</p>
      ) : result === 'alreadyActivated' ? (
        <p className="text-red-500 text-2xl">
          Your user account is already activated
        </p>
      ) : result === 'success' ? (
        <p className="text-green-500 text-2xl">
          Success! Your user account is now activated
        </p>
      ) : (
        <p className="text-yellow-500 text-2xl">
          Oops! Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
};

export default ActivationPage;
