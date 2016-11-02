/* Copyright (C) - All Rights Reserved
 * Written by sgnaneshwar, 10/30/2016
 */

'use strict';

var controller = require('../controllers/landingPage.server.controllers');

module.exports = function(app){
    app.route('/')
        .get(controller.renderIndex);
};