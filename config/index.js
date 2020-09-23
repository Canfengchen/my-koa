const devConfig = './config-dev.js';
const proConfig = './config-pro.js';

const fs = require('fs');

var config = null;

if (process.env.NODE_ENV === 'development') {
    console.log(`Load ${devConfig}...`);
    config = require(devConfig);
} else {
    console.log(`Load ${proConfig}...`);
    config = require(proConfig);
}

module.exports = config;