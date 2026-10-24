import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'rescueplate_demo_secret_jwt_key_2026_buildathon_secure',
  cookieSecret: process.env.COOKIE_SECRET || 'rescueplate_demo_cookie_secret_key_2026_buildathon',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtExpiresIn: '24h',
  cookieMaxAge: 24 * 60 * 60 * 1000 // 24 hours
};
