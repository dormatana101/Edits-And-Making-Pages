// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import userModel, { IUser } from '../models/Users';
import dotenv from 'dotenv';

dotenv.config();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

// Настройка Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!, // Ваш Client ID
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Ваш Client Secret
  callbackURL: "/auth/google/callback"
},
  async (accessToken, refreshToken, profile: Profile, done) => {
    try {
      // Поиск пользователя по googleId
      let user = await userModel.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      // Если пользователь не найден, ищем по email
      const email = profile.emails && profile.emails[0].value;
      if (email) {
        user = await userModel.findOne({ email });
        if (user) {
          // Обновляем googleId, если он еще не установлен
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }
      }

      // Если пользователь с таким email не найден, создаем нового
      const newUser = new userModel({
        username: profile.displayName,
        email: email,
        googleId: profile.id,
        profileImage: profile.photos && profile.photos[0].value,
        // Пароль не требуется для OAuth пользователей
      });

      await newUser.save();
      done(null, newUser);
    } catch (err) {
      done(err, false);
    }
  }
));
