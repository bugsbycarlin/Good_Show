//
// This file contains the code to notarize a MacOS application.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


require('dotenv').config();
const { notarize } = require('/usr/local/lib/node_modules/electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log("HI THERE");
  console.log(process.env.APPLEID);
  // xcrun altool --list-providers -u $APPLEID -p $APPLEIDPASS
  console.log(process.env.APPLEPROVIDER);

  return await notarize({
    appBundleId: 'com.alphazoo.sovietcomputerlab',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    ascProvider: process.env.APPLEPROVIDER,
  });
};