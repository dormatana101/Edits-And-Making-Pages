import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from '../models/Users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import passport from 'passport';

const CLIENT_CONNECT = process.env.CLIENT_CONNECT;


type tTokens = {
    accessToken: string,
    refreshToken: string
}

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        res.status(400).json({ message: 'Username, email, and password are required' });
        return;
      }
  
      const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        if (existingUser.email === email) {
          res.status(409).json({ message: 'Email is already registered' });
          return;
        }
        if (existingUser.username === username) {
          res.status(409).json({ message: 'Username is already taken' });
          return;
        }
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  

      const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
      });
  
      res.status(201).json({
        message: 'User registered successfully',
        user: { username: user.username, email: user.email, _id: user._id },
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
const generateToken = (userId: string): tTokens | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString();
    const accessToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRES });

    const refreshToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};
const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }
  
      const user = await userModel.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Wrong email or password' });
        return;
      }

      const validPassword = user.password ? await bcrypt.compare(password, user.password) : false;
      if (!validPassword) {
        res.status(400).json({ message: 'Wrong email or password' });
        return;
      }
  
      const tokens = generateToken(user._id);
      if (!tokens) {
        res.status(500).json({ message: 'Failed to generate tokens' });
        return;
      }
  
      if (!user.refreshToken) {
        user.refreshToken = [];
      }
      user.refreshToken.push(tokens.refreshToken);
      await user.save();
  
      res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        _id: user._id,
        username: user.username, 
        isAuthenticated: true,
        likedPosts: user.likedPosts,
      });
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
type tUser = Document<unknown, {}, IUser> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        //get refresh token from body
        if (!refreshToken) {
            reject("fail");
            return;
        }
        //verify token
        if (!process.env.TOKEN_SECRET) {
            reject("fail");
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                reject("fail");
                return
            }
            //get the user id fromn token
            const userId = payload._id;
            try {
                //get the user form the db
                const user = await userModel.findById(userId);
                if (!user) {
                    reject("fail");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    reject("fail");
                    return;
                }
                const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                user.refreshToken = tokens;

                resolve(user);
            } catch (err) {
                reject("fail");
                return;
            }
        });
    });
}

// const logout = async (req: Request, res: Response) => {
//     try {
//         const user = await verifyRefreshToken(req.body.refreshToken);
//         await user.save();
//         res.status(200).send("success");
//     } catch (err) {
//         res.status(400).send("fail");
//     }
// };

const refresh = async (req: Request, res: Response) => {
    try {
        if(!req.body.refreshToken){
            res.status(400).send("fail");
            return;
        }
        const user = await verifyRefreshToken(req.body.refreshToken);
        
        const tokens = generateToken(user._id);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id
            });
        //send new token
    } catch (err) {
        res.status(400).send("fail");
    }
};

type Payload = {
    _id: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('authorization');
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
        res.status(401).send('Access Denied');
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send('Server Error');
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(401).send('Access Denied');
            return;
        }
        req.params.userId = (payload as Payload)._id;
        next();
    });
};

// auth_controller.ts

const googleCallback = async (req: Request, res: Response) => {
  try {
      const user = req.user as IUser & Document;

      if (!user._id) {
          res.status(500).json({ message: 'User ID is undefined' });
          return;
      }

      const tokens = generateToken(user._id);
      if (!tokens) {
          res.status(500).json({ message: 'No token' });
          return;
      }

      if (!user.refreshToken) {
          user.refreshToken = [];
      }
      user.refreshToken.push(tokens.refreshToken);
      await user.save();

      res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', 
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      res.redirect(`${CLIENT_CONNECT}/oauth/callback?token=${tokens.accessToken}&userId=${user._id}&username=${encodeURIComponent(user.username)}`);


  } catch (err) {
      console.error('Error googleCallback:', err);
      res.status(500).json({ message: 'Error' });
  }
};



export default {
    register,
    login,
    refresh,
    authMiddleware,
    googleCallback
   // logout
};
