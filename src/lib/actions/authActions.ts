'use server';
import { User } from '@prisma/client';
import prisma from '../prisma';
import * as bcrypt from 'bcrypt';
import {
  compileActivationTemplate,
  compileResetPasswordTemplate,
  sendMail,
} from '../mail';
import { signJWT, verifyJWT } from '../jwt';

//now every function inside this file would be a server action
// Server Actions are asynchronous functions that are executed on the server.
// They can be used in Server and Client Components to handle form submissions and data mutations in Next.js applications.
// Having these special functions that only run on the server means that developers can offload responsibilities like data fetching and mutations to them, avoiding the vulnerabilities and security concerns of fetching and mutating data from the client.

export async function registerUser(
  user: Omit<User, 'id' | 'emailVerified' | 'image'>
) {
  //type of this User parameter is the User without the id
  const result = await prisma.user.create({
    data: {
      ...user,
      password: await bcrypt.hash(user.password, 10), //10 is the number of salt rounds which determine the complexity of the hash
    },
  });

  const jwtUserId = signJWT({ id: result.id });

  const activationUrl = `${process.env.NEXTAUTH_URL}/auth/activation/${jwtUserId}`;
  // it is not safe to put the id of the user directly in the activation page but we will change this soon.
  // we need to encrypt the id of the user and then put the encrypted version of the id inside our activation link.
  // we can use JWT to encrypt the ID of the user.
  // we install jsonwebtoken using npm i jsonwebtoken and install the types using npm i -d @types/jsonwebtoken

  const body = compileActivationTemplate(user.firstName, activationUrl);

  await sendMail({ to: user.email, subject: 'Account Activation', body });

  return result;
}

type ActivateUserFunction = (
  jwtUserId: string
) => Promise<'userNotExist' | 'alreadyActivated' | 'success'>;

export const activateUser: ActivateUserFunction = async (jwtUserId) => {
  const payload = verifyJWT(jwtUserId);
  // payload is going to be an object that has an 'id' property
  const userId = payload?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return 'userNotExist';
  }

  if (user.emailVerified) {
    return 'alreadyActivated';
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  return 'success';
};

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) throw new Error('User does not exist');

  // Send Email With Password Reset Link
  const jwtUserId = signJWT({
    id: user.id,
  });

  const resetPasswordUrl = `${process.env.NEXTAUTH_URL}/auth/resetPassword/${jwtUserId}`;

  const body = compileResetPasswordTemplate(user.firstName, resetPasswordUrl);

  const sendResult = await sendMail({
    to: user.email,
    subject: 'Reset Password',
    body: body,
  });

  return sendResult;
}

type ResetPasswordFunction = (
  jwtUserId: string,
  password: string
) => Promise<'userNotExist' | 'success'>;

export const resetPassword: ResetPasswordFunction = async (
  jwtUserId,
  password
) => {
  const payload = verifyJWT(jwtUserId);

  if (!payload) return 'userNotExist';

  const userId = payload.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) return 'userNotExist';

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: await bcrypt.hash(password, 10),
    },
  });

  if (result) {
    return 'success';
  } else throw new Error('Something went wrong!');
};
