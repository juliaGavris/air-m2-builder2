#!/usr/bin/env node

const { exec } = require("child_process");

exec("node --experimental-modules ./bin/server.mjs", error => {
  throw error;
});
