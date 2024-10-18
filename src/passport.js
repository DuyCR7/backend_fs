require('dotenv').config();
import passport from 'passport';
import db from "./models/index";
import { v4 as uuidv4 } from "uuid";

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

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
        let existCustomer = await db.Customer.findOne({
          where: {
            email: profile.emails[0].value
          }
        })
        if(existCustomer){
          await db.Customer.update({
            googleId: profile.id,
            username: profile.displayName,
            tokenLoginGoogle: tokenLoginGoogle,
            typeLogin: profile.provider,
          }, {
            where: {
              email: profile.emails[0].value
            }
          })
        } else {
          let response = await db.Customer.findOrCreate({
            where: {
              googleId : profile.id
            },
            defaults: {
              email: profile.emails[0].value,
              image: profile.photos[0].value,
              username: profile.displayName,
              typeLogin: profile.provider,
              tokenLoginGoogle: tokenLoginGoogle,
              verified: true,
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
      
      }
    } catch (err) {
      console.log(err);
    }

    // console.log(profile);
    return cb(null, profile);
  }
));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/v1/auth/github/callback"
},
async function(accessToken, refreshToken, profile, done) {
  const tokenLoginGithub = uuidv4();
  profile.tokenLoginGithub = tokenLoginGithub;

  try {
    if(profile?.id){
      let existCustomer = await db.Customer.findOne({
        where: {
          githubId: profile.id
        }
      })
      if(existCustomer){
        await db.Customer.update({
          githubId: profile.id,
          username: profile.username,
          tokenLoginGithub: tokenLoginGithub,
          typeLogin: profile.provider,
        }, {
          where: {
            githubId: profile.id
          }
        })
      } else {
        let response = await db.Customer.findOrCreate({
          where: {
            githubId : profile.id
          },
          defaults: {
            image: profile.photos[0].value,
            username: profile.username,
            typeLogin: profile.provider,
            tokenLoginGithub: tokenLoginGithub,
            verified: true,
          }
        })

        if(!response[1]){
          await db.Customer.update({
            tokenLoginGithub: tokenLoginGithub
          }, {
            where: {
              githubId: profile.id
            }
          })
        }
      }
    
    }
  } catch (err) {
    console.log(err);
  }

  // console.log("profile", profile);
  return done(null, profile);
}
));