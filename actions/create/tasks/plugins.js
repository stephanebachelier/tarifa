/*
 * add cordova plugins task
 */

var path = require('path'),
    plugins = require('../../../lib/cordova/plugins'),
    print = require('../../../lib/helper/print'),
    settings = require('../../../lib/settings');

module.exports = function (response) {
    if(response.plugins.length === 0 ) return Q.resolve(response);

    return plugins.add(response.path, response.plugins).then(function () {
        if (response.options.verbose) print('cordova plugins added');
        return response;
    });
};
