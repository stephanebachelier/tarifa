var Q = require('q'),
    format = require('util').format,
    exec = require('child_process').exec,
    log = require('../../../../../helper/log');

function addDevice(user, team, password, name, uuid) {
    var defer = Q.defer(),
        options = {
            timeout: 40000,
            maxBuffer: 1024 * 400
        },
        t = (team ? (' --team ' + team) : ''),
        cmd = format('ios devices:add $\'%s\'=%s -u %s -p $\'%s\' %s', name, uuid, user, password, t);

    exec(cmd, options, function (err, stdout) {
        if(err) {
            log.send('error', 'command: %s', cmd);
            defer.reject('ios stderr ' + err);
            return;
        }
        defer.resolve(stdout.toString());
    });
    return defer.promise;
}

module.exports = addDevice;
