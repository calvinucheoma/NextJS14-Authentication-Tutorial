import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Image from 'next/image';
// import { redirect } from 'next/navigation';

const ProfilePage = async () => {
  const session = await getServerSession(authOptions);

  const user = session?.user;

  // if (!session || !session.user) redirect('/auth/signin');
  // we can protect pages from authenticated users in a better and easier way using the Next-Auth middleware
  return (
    <div>
      <Image
        src={user?.image ?? ''}
        height={300}
        width={300}
        alt={user?.firstName ?? ''}
        className="rounded-full"
      />

      <div className="grid grid-cols-4 gap-y-4">
        <p>First Name: </p> <p className="col-span-3">{user?.firstName}</p>
        <p>Last Name: </p> <p className="col-span-3">{user?.lastName}</p>
        <p>Phone: </p> <p className="col-span-3">{user?.phone}</p>
        <p>Email: </p> <p className="col-span-3">{user?.email}</p>
      </div>
      {/* Since the user might be null, we use a double question mark and pass the empty string in that case */}
    </div>
  );
};

export default ProfilePage;

// We can retrieve the authenticated user from the session of the next-auth in 2 ways:
// 1. Using useSession() hook that we get access to in only client components.
// 2. Using getServerSession function from the next-auth. It is a function that retrieves the session of the next-auth in server-side.
// In the getServerSession function, we pass the 'authOptions' object that we created in the next-auth API route handler as a parameter.
