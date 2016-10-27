#!/usr/bin/env node

module.exports = function (context) {
    var IosSDKVersion = 'OpenTok-iOS-2.9.1';
    var fs = require('fs');
    var downloadFile = require('./downloadFile.js'),
        exec = require('./exec/exec.js'),
        Q = context.requireCordovaModule('q'),
        deferral = new Q.defer();
    var frameworkDir = context.opts.plugin.dir + '/src/ios';
    var frameworkDownloaded = frameworkDir + '/OpenTok.framework/download_succesful_' + IosSDKVersion;
    fs.stat(frameworkDownloaded, function(err, stat) {
        if (!err) {
            console.log('OpenTok iOS SDK already on disk, skipping download');
            deferral.resolve();
            return;
        }
        console.log('Downloading OpenTok iOS SDK');
        downloadFile('https://s3.amazonaws.com/artifact.tokbox.com/rel/ios-sdk/' + IosSDKVersion + '.tar.bz2',
            './' + IosSDKVersion + '.tar.bz2', function (err) {
            if (!err) {
                console.log('downloaded');
                exec('tar -zxvf ./' + IosSDKVersion + '.tar.bz2', function (err, out, code) {
                    console.log('expanded');
                    exec('rm -r ' + frameworkDir + '/OpenTok.framework', function (err, out, code) {
                        console.log('removed old framework');
                        exec('mv ./' + IosSDKVersion + '/OpenTok.framework ' + frameworkDir, function (err, out, code) {
                            console.log('moved OpenTok.framework into ' + frameworkDir);
                            exec('rm -r ./' + IosSDKVersion, function (err, out, code) {
                                console.log('Removed extracted dir');
                                exec('rm ./' + IosSDKVersion + '.tar.bz2', function (err, out, code) {
                                    exec('touch ' + frameworkDownloaded, function (err) {
                                        console.log('Removed downloaded SDK');
                                        deferral.resolve();
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    });
    return deferral.promise;
};
