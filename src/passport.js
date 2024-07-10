require('dotenv').config();
import passport from 'passport';
import db from "./models/index";
import { v4 as uuidv4 } from "uuid";

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    // thêm customer vào db 
    const tokenLoginGoogle = uuidv4();
    profile.tokenLoginGoogle = tokenLoginGoogle;

    try {
      if(profile?.id){
        let response = await db.Customer.findOrCreate({
          where: {
            googleId : profile.id
          },
          defaults: {
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            username: profile.displayName,
            typeLogin: profile.provider,
            tokenLoginGoogle: tokenLoginGoogle
          }
        })

        if(!response[1]){
          await db.Customer.update({
            tokenLoginGoogle: tokenLoginGoogle
          }, {
            where: {
              googleId: profile.id
            }
          })
        }
      }
    } catch (err) {
      console.log(err);
    }

    // console.log(profile);
    return cb(null, profile);
  }
));