/* Copyright (C) - All Rights Reserved
 * Written by sgnaneshwar, 10/30/2016
 */

'use strict';

var express = require('./express'),
    config = require('../config'),
    chalk = require('chalk');

module.exports.start = function(cb){
    var _this = this;
    _this.init(function(app,config){

        // Start the app by listening on <port>
        app.listen(config.port, function (cb) {

            console.log('--');
            console.log(chalk.green(config.app.title));
            console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
            console.log(chalk.green('Port:\t\t\t\t' + config.port));
            console.log(chalk.green('Database:\t\t\t\t' + config.db.uri));

            if (cb) cb(app, config);
        });


    });
};

module.exports.init = function(cb){
    var app = express.init();
    if(cb) cb(app,config);
};
