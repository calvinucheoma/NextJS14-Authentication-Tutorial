import ResetPasswordForm from '@/app/components/ResetPasswordForm';
import { verifyJWT } from '@/lib/jwt';

interface Props {
  params: {
    jwt: string;
  };
}

const ResetPasswordPage = ({ params }: Props) => {
  const payload = verifyJWT(params.jwt);

  if (!payload)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-2xl">
        Invalid URL
      </div>
    );

  return (
    <div className="flex justify-center">
      <ResetPasswordForm jwtUserId={params.jwt} />
    </div>
  );
};

export default ResetPasswordPage;
