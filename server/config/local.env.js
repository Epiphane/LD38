'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'http://localhost:3000',

  DATABASE_URL:     'postgres://thomassteinke:thomasteinke@localhost/ld38',
  TEST_DATABASE_URL:'postgres://thomassteinke:thomasteinke@localhost/ld38_test',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
