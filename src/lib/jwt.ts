import jwt, { JwtPayload } from 'jsonwebtoken';

interface SignOption {
  expiresIn: string | number;
}

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: '1d', // our jwt would be valid for just 1 day
};

export function signJWT(
  payload: JwtPayload,
  option: SignOption = DEFAULT_SIGN_OPTION
) {
  const secretKey = process.env.JWT_USER_ID_SECRET!; // ! tells typescript that the secret key is not going to be undefined.
  const token = jwt.sign(payload, secretKey);
  return token;
}

export function verifyJWT(token: string) {
  try {
    const secretKey = process.env.JWT_USER_ID_SECRET!;
    const decoded = jwt.verify(token, secretKey);
    return decoded as JwtPayload;
  } catch (error) {
    console.error(error);
    return null; //returning null means the token was not valid
  }
}
