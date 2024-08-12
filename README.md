```
backend
.
├──yarn.lock
├──webpack.config.js
├──tsconfig.spec.json
├──tsconfig.json
├──package-lock.json
├──ormconfig.js
├──nodemon.json
├──nodemon-debug.json
├──nest-cli.json
├──.gitignore
├──.env
└──src
     ├──modules
     │ 	├──admins
     │    │   ├──admins.controller.ts
     │	│   ├──admins.entity.ts
     │	│   ├──admins.module.ts
     │	│   ├──admins.service.ts
     │	│   ├──index.ts
     │	│   ├──password.transformer.ts
     │	├──admins
     │    │   ├──auth.controller.ts
     │	│   ├──login.payload.ts
     │	│   ├──auth.module.ts
     │	│   ├──auth.service.ts
     │	│   ├──index.ts
     │	│   ├──jwt-guard.ts
     │ 	│   ├──jwt-strategy.ts
     │    │   ├──register.payload.ts
     │	│   ├──request-guard.ts
     │	├──common-codes
     │	│   ├──common-codes.controller.ts
     │	│   ├──common-codes.entity.ts
     │	│   ├──common-codes.module.ts
     │	│   ├──common-codes.service.ts
     │	│   ├──index.ts
     │	├──contents
     │    │   ├──contents.controller.ts
     │	│   ├──contents.entity.ts
     │	│   ├──contents.module.ts
     │	│   ├──contents.service.ts
     │	│   ├──index.ts
     │    ├──daily-records
     │    │   ├──daily-records.controller.ts
     │	│   ├──daily-records.entity.ts
     │	│   ├──daily-records.module.ts
     │	│   ├──daily-records.service.ts
     │	│   ├──index.ts
     │	├──daily-records-details
     │    │   ├──daily-records-details.controller.ts
     │	│   ├──daily-records-details.entity.ts
     │	│   ├──daily-records-details.module.ts
     │	│   ├──daily-records-details.service.ts
     │	│   ├──index.ts
     │	├──daily-records-history
     │    │   ├──daily-records-history.controller.ts
     │	│   ├──daily-records-history.entity.ts
     │	│   ├──daily-records-history.module.ts
     │	│   ├──daily-records-history.service.ts
     │	│   ├──index.ts
     │	├──daily-records-history-details
     │    │   ├──daily-records-history-details.controller.ts
     │	│   ├──daily-records-history-details.entity.ts
     │	│   ├──daily-records-history-details.module.ts
     │	│   ├──daily-records-history-details.service.ts
     │	│   ├──index.ts
     │	├──environment-records
     │    │   ├──environment-records.controller.ts
     │	│   ├──environment-records.entity.ts
     │	│   ├──environment-records.module.ts
     │	│   ├──environment-records.service.ts
     │	│   ├──index.ts
     │	├──environment-records-details
     │    │   ├──environment-records-details.controller.ts
     │	│   ├──environment-records-details.entity.ts
     │	│   ├──environment-records-details.module.ts
     │	│   ├──environment-records-details.service.ts
     │	│   ├──index.ts
     │	├──favorities
     │    │   ├──favorities.controller.ts
     │	│   ├──favorities.entity.ts
     │	│   ├──favorities.module.ts
     │	│   ├──favorities.service.ts
     │	│   ├──index.ts
     │	├──fcm-token
     │    │   ├──fcm-token.controller.ts
     │	│   ├──fcm-token.entity.ts
     │	│   ├──fcm-token.module.ts
     │	│   ├──fcm-token.service.ts
     │	│   ├──index.ts
     │	├──notices
     │    │   ├──notices.controller.ts
     │	│   ├──notices.entity.ts
     │	│   ├──notices.module.ts
     │	│   ├──notices.service.ts
     │	│   ├──index.ts
     │	├──notifications
     │    │   ├──notifications.controller.ts
     │	│   ├──notifications.entity.ts
     │	│   ├──notifications.module.ts
     │	│   ├──notifications.service.ts
     │	│   ├──index.ts
     │	├──sleep-records
     │    │   ├──sleep-records.controller.ts
     │	│   ├──sleep-records.entity.ts
     │	│   ├──sleep-records.module.ts
     │	│   ├──sleep-records.service.ts
     │	│   ├──index.ts
     │	├──sleep-records-fitbit
     │    │   ├──sleep-records-fitbit.controller.ts
     │	│   ├──sleep-records-fitbit.entity.ts
     │	│   ├──sleep-records-fitbit.module.ts
     │	│   ├──sleep-records-fitbit.service.ts
     │	│   ├──index.ts
     │	├──sleep-records-mobile
     │    │   ├──sleep-records-mobile.controller.ts
     │	│   ├──sleep-records-mobile.entity.ts
     │	│   ├──sleep-records-mobile.module.ts
     │	│   ├──sleep-records-mobile.service.ts
     │	│   ├──index.ts
     │	├──sleep-records
     │    │   ├──sleep-records.controller.ts
     │	│   ├──sleep-records.entity.ts
     │	│   ├──sleep-records.module.ts
     │	│   ├──sleep-records.service.ts
     │	│   ├──index.ts
     │	├──survey-records
     │    │   ├──survey-records.controller.ts
     │	│   ├──survey-records.entity.ts
     │	│   ├──survey-records.module.ts
     │	│   ├──survey-records.service.ts
     │	│   ├──index.ts
     │	├──sleep-records-fitbit
     │    │   ├──sleep-records-fitbit.controller.ts
     │	│   ├──sleep-records-fitbit.entity.ts
     │	│   ├──sleep-records-fitbit.module.ts
     │	│   ├──sleep-records-fitbit.service.ts
     │	│   ├──index.ts
     │	├──user
     │    │   ├──user.controller.ts
     │	│   ├──user.entity.ts
     │	│   ├──user.module.ts
     │	│   ├──user.service.ts
     │	│   ├──password.transformer.ts
     │	│   ├──index.ts
     │	├──user-feedback
     │    │   ├──user-feedback.controller.ts
     │	│   ├──user-feedback.entity.ts
     │	│   ├──user-feedback.module.ts
     │	│   ├──user-feedback.service.ts
     │	│   ├──index.ts
     │	├──user-feedback-detail
     │    │   ├──user-feedback-detail.controller.ts
     │	│   ├──user-feedback-detail.entity.ts
     │	│   ├──user-feedback-detail.module.ts
     │	│   ├──user-feedback-detail.service.ts
     │	│   ├──index.ts
     │	├──user-password-history
     │    │   ├──user-password-history.controller.ts
     │	│   ├──user-password-history.entity.ts
     │	│   ├──user-password-history.module.ts
     │	│   ├──user-password-history.service.ts
     │	│   ├──index.ts
     │	├──user-log
     │    │   ├──user-log.controller.ts
     │	│   ├──user-log.entity.ts
     │	│   ├──user-log.module.ts
     │	│   ├──user-log.service.ts
     │	│   ├──index.ts
     │	├──users-notices
     │    │   ├──users-notices.controller.ts
     │	│   ├──users-notices.entity.ts
     │	│   ├──users-notices.module.ts
     │	│   ├──users-notices.service.ts
     │ 	│   ├──index.ts
     │	├──main
     │    │   ├──app.controller.ts
     │	│   ├──app.module.ts
     │	│   ├──app.service.ts
     │ 	│   ├──app.controller.spec.ts
     ├──main.ts
     ├──main.hmr.ts
     ├──constants
     │	└──response.ts
     ├──utils
          ├──constants.ts
          ├──DateHelper.ts  
          ├──Hash.ts
          ├──index.ts
          ├──TextHelper.ts   
          └──UploadImage.ts  //file support upload to s3

## How to run project
1. Option 1:
- npm install (or yarn install)
- npm run start:dev (or yarn start:dev)

## How to Deploy
STEPS

1. Build source code at developer machine
1.1 Checkout source code from master branch
cmd: git checkout master
1.2 Push code
cmd:
- git commit -m "comment"
- git push
2. Deploy to server dev
2.1 Download xshell from https://www.netsarang.com/en/xshell/
2.1 Join to server with pem file 
- somday.pem
- user: ubuntu
2.2 Pull buit code to server
cmd: 
cd somday
cd somday-backend
git pull
2.3 Restart server
cmd: 
pm2 stop 1
pm2 start 1

## Node version
v16.12.0
