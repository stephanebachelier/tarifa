var Q = require('q'),
    rimraf = require('rimraf'),
    argsHelper = require('../../lib/helper/args'),
    tarifaFile = require('../../lib/tarifa-file'),
    path = require('path'),
    settings = require('../../lib/settings'),
    print = require('../../lib/helper/print'),
    platformsLib = require('../../lib/cordova/platforms'),
    copyDefaultIcons = require('../../lib/cordova/icon').copyDefault,
    createDefaultAssetsFolders = require('../../lib/cordova/assets').createFolders,
    copyDefaultSplash = require('../../lib/cordova/splashscreen').copyDefault,
    fs = require('q-io/fs');

function addAssets(platform, splash, verbose) {
    var cwd = process.cwd();
    return Q.all(createDefaultAssetsFolders(cwd, [platform], 'default', splash))
        .then(function () { return copyDefaultIcons(cwd, [platform], verbose); })
        .then(function () {
            if(splash) return copyDefaultSplash(cwd, [platform], verbose);
            else return Q.resolve();
        });
}

function rmAssets(platform, verbose) {
    var defer = Q.defer();
    var platformAssetsPath = path.join(process.cwd(), settings.images, platform);
    rimraf(platformAssetsPath, function (err) {
        if(err) defer.reject(err);
        if(verbose) print.success('removed asset folder');
        defer.resolve();
    });
    return defer.promise;
}

function add(type, splash, verbose) {
    return tarifaFile.addPlatform(process.cwd(), type)
        .then(function () { return platformsLib.add([type], verbose); })
        .then(function () { return addAssets(type, splash, verbose); });
}

function remove(type, verbose) {
    return tarifaFile.removePlatform(process.cwd(), type)
        .then(function () { return platformsLib.remove([type], verbose); })
        .then(function () { return rmAssets(type, verbose); });
}

function platform (action, type, verbose) {
    var promises = [
        tarifaFile.parse(process.cwd()),
        platformsLib.isAvailableOnHost(type)
    ];

    return Q.all(promises).spread(function (localSettings) {
        var hasSplash = localSettings.plugins.indexOf("org.apache.cordova.splashscreen") > -1;
        if(action === 'add') return add(type, hasSplash, verbose);
        else return remove(type, verbose);
    });
}

function action (argv) {
    var verbose = false,
        actions = ['add', 'remove'],
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.checkValidOptions(argv, ['V', 'verbose'])) {
        if(argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }
        if(argv._[0] === 'list' && argsHelper.matchArgumentsCount(argv, [1])){
            return platformsLib.list(true);
        }
        if(actions.indexOf(argv._[0]) > -1
            && argsHelper.matchArgumentsCount(argv, [2])) {
            return platform(argv._[0], argv._[1], verbose);
        }
    }

    return fs.read(helpPath).then(print);
}

action.platform = platform;

module.exports = action;
