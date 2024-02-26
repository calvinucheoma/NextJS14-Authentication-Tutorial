import prisma from '@/lib/prisma';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as bcrypt from 'bcrypt';
import NextAuth from 'next-auth/next';
import { User } from '@prisma/client';

export const authOptions: AuthOptions = {
  pages: {
    signIn: '/auth/signin', //to indicate that we want to use our custom signIn page layout instead of the one provided by next-auth
  },
  session: {
    strategy: 'jwt', // we set the strategy of keeping the user session here. So the session of the next-auth would be turned to a jwt and saved inside a http-only cookie and then we can have access to the session of the next-auth with the getServer session function
    // we can also save this session in the database but we use the jwt strategy here.
    // for this to work, we need to define a value in the env file which is the NEXTAUTH_SECRET and set it to a random key
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {
          label: 'User Name', //label of the username in the signIn page that next-auth would create for us.
          type: 'text', //type of the username input
          placeholder: 'Your User Name',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.username },
        });
        if (!user) throw new Error('User name or password is not correct');

        if (!credentials?.password)
          throw new Error('Please provide your password');

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        ); //the first argument needs to be hashed and the second argument is already hashed so we need to put the entered user password as the first argument.

        if (!isPasswordCorrect)
          throw new Error('User name or password is not correct');

        if (!user.emailVerified)
          throw new Error('Please verify your email first');

        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;

        // const isPasswordCorrect = credentials?.password === user.password //The user password is not directly saved in our database and is hashed before saving it there so this would not work as we are comparing a hashed password to the real password so we have to hash the entered user password first.
        //  We can do it by installing a package called bcrypt. We also install the types of this bcrypt package using 'npm i -d @types/bcrypt'
      }, //we define an authorize function after the credentials object which takes in the credentials object as an argument
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user as User; //we change the type of the token in typescript since it does not have a user property in it's object

      return token;
    },

    async session({ token, session }) {
      session.user = token.user;
      return session; //the session we get from the useSession() hook, getSession or getServerSession function is this session object returned by the session callback
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Defining the 'credentials' object has two purposes:
// The first one describes what are our credentials, for exanmple username and password or email and password
// The second purpose is that nextAuth can create an auto-built signIn form from this credentials object.

// When a user in the signIn page clicks on the 'sign in' button, the username and password are packed in a credentials object and would be passed to the 'authorize' function.
// We authenticate our users in this function. If the username are password, we return a user object from this function and if they are not correct, the user is not authenticated and we either return a null value from this function or throw an error.

/**************************************** CALLBACKS EXPLAINED *****************************************************/

// When a user signs into our application successfully, the jwt callback is called and it receives an object that contains the token and user inside it.
// The 'user' object is the returning object of the 'authorized' function in the 'Credentials' provider.
// Then the jwt callback returns the token and then the session callback is called and receives the token that the jwt callback has returned.
// And then the session callback returns the next-auth session.
// These 2 callbacks are called whenever a user signs into our application or when we check the session of the next-auth in the client-side.
// The 'user' object is only available when the user signs into our application for the first time. After that, whenever we check the session of the 'next-auth',
// the 2 callbacks are called but the 'user' object is undefined.
// So in order to keep all the properties of the 'user' object in the session of the next-auth, we need to put the properties of the 'user' object into the token and then send the token to the session callbacks.
