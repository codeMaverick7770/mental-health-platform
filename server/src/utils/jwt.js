import jwt from 'jsonwebtoken';

export const signAdminToken = (payload, options = {}) => {
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRES || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const verifyAdminToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
