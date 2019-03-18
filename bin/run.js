#!/usr/bin/env node

const { exec } = require("child_process");

exec(`node --experimental-modules ${__dirname}/server.mjs`, error => {
  throw error;
});
