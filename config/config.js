/* Copyright (C) - All Rights Reserved
 * Written by sgnaneshwar, 10/4/2016
 */

'use strict';

var _ = require('lodash'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path');


var getGlobbedPaths = function (globPatterns, excludes) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            if (excludes) {
                files = files.map(function (file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                            file = file.replace(excludes[i], '');
                        }
                    } else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }

    return output;
};

var validateEnvironmentVariable = function () {
    var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
    console.log();
    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error('Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead');
        } else {
            console.error('Error: NODE_ENV is not defined! Using default development environment');
        }
        process.env.NODE_ENV = 'development';
    }
};

var initGlobalConfigFolders = function (config, assets) {
    // Appending files
    config.folders = {
        server: {},
        client: {}
    };

    // Setting globbed client paths
    config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'modules/*/client/'), process.cwd().replace(new RegExp(/\\/g), '/'));
};

var initGlobalConfigFiles = function (config, assets) {
    config.files = {
        server: {},
        client: {}
    };

    config.files.server.models = getGlobbedPaths(assets.server.models);

    config.files.server.routes = getGlobbedPaths(assets.server.routes);

    config.files.server.configs = getGlobbedPaths(assets.server.config);

    config.files.server.policies = getGlobbedPaths(assets.server.policies);

    config.files.client.js = getGlobbedPaths(assets.client.lib.js, 'public/').concat(getGlobbedPaths(assets.client.js, ['public/']));

    config.files.client.css = getGlobbedPaths(assets.client.lib.css, 'public/').concat(getGlobbedPaths(assets.client.css, ['public/']));

    config.files.client.tests = getGlobbedPaths(assets.client.tests);
};

var initGlobalConfig = function () {
    validateEnvironmentVariable();

    var defaultAssets = require(path.join(process.cwd(), 'config/assets/default'));
    var environmentAssets = require(path.join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {};

    // Merge assets
    var assets = _.merge(defaultAssets, environmentAssets);

    var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));
    var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    var config = _.merge(defaultConfig, environmentConfig);

    var pkg = require(path.resolve('./package.json'));
    config.meanjs = pkg;

    initGlobalConfigFiles(config, assets);
    initGlobalConfigFolders(config, assets);

    config.utils = {
        getGlobbedPaths: getGlobbedPaths
    };
    return config;
};


module.exports = initGlobalConfig();