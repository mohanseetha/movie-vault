import jwt from "jsonwebtoken";

export const signToken = (payload, expiresIn = "3h") =>
  jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });

export const verifyToken = (token) => jwt.verify(token, process.env.SECRET_KEY);
