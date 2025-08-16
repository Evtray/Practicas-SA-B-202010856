import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { config } from './env';
import { EncryptionService } from '../utils/encryption';

const prisma = new PrismaClient();

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0]) {
          return done(new Error('No email found in Google profile'), false);
        }

        const email = profile.emails[0].value;
        const name = profile.displayName || profile.name?.givenName || 'Google User';
        
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Create new user from Google OAuth
          const encryptedEmail = EncryptionService.encrypt(email);
          const encryptedName = EncryptionService.encrypt(name);
          
          // Generate a random password for OAuth users (they won't use it)
          const randomPassword = require('crypto').randomBytes(32).toString('hex');
          const hashedPassword = await require('bcrypt').hash(randomPassword, 10);

          user = await prisma.user.create({
            data: {
              email,
              encryptedEmail,
              encryptedName,
              password: hashedPassword,
              isEmailVerified: true, // Google accounts are pre-verified
              // OAuth users don't need email verification
            },
          });
        } else {
          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLogin: new Date(),
              isEmailVerified: true, // Ensure Google users are verified
            },
          });
        }

        return done(null, user);
      } catch (error: any) {
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;