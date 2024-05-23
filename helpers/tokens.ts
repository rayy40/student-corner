import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import {
  createVerificationCode,
  deleteVerifcationCode,
  getVerificationCodeByEmail,
} from "@/db/verification-token";

export const generateToken = () => {
  const token = uuidv4();
  return token;
};

export const generateTwoFactorCode = async (email: string) => {
  const code = crypto.randomInt(10 ** 5, 10 ** 6 - 1).toString();
  const expires = new Date(new Date().getTime() + 600 * 1000);

  const existingCode = await getVerificationCodeByEmail(email);

  if (existingCode) {
    await deleteVerifcationCode(existingCode._id);
  }

  await createVerificationCode(email, code, expires.getTime());

  return { email, code, expires };
};
