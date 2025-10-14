import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../utils/config';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'missing token' });
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    const csrfToken = req.headers['x-csrf-token'];

    if (typeof decodedToken === "object" && decodedToken.id && decodedToken.csrf === csrfToken) {
      req.userId = decodedToken.id;
    } else {
      res.status(401).json({ error: 'Invalid token or CSRF' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};