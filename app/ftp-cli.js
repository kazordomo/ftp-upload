#!/usr/bin/env node

const jsftp = require('jsftp');
const { ftpConf } = require('../config/index.js');
const comperator = require('file-compare');
const argv = require('minimist')(process.argv.slice(2));
const { zipProject } = require('./utils');

const Ftp = new jsftp({
    host: ftpConf.host,
    port: ftpConf.port,
    user: ftpConf.user,
    pass: ftpConf.pass,
});

Ftp.auth(ftpConf.user, ftpConf.pass, (err, data) => {
    if(err)
        return console.log('err: ', err);

    console.log('Auth success, welcome.');
});

// -m put filePaths (1 - *) | upload one or more files to server.
if(argv.m === 'put')
    uploadFileToServer(argv._);

// -m get pathToFileOnServer | fetch the file from server.
if(argv.m === 'get')
    getFromServer(argv._[0]);

// -m diff pathToFile1 pathToFile2 | returns true if the files is identical.
if(argv.m === 'diff')
    diffFiles(argv._[0], argv._[1]);

// -m diffFolder /dir_name |
if(argv.m === 'diffFolder')
    diffAllFilesInFolder(argv._[0]);

// -m zip | export a zip version of the project
if(argv.m === 'zip')
    zipProject();

function getFromServer(fileName) {
    const prefixedPath = `/new_dir/${fileName}`;
    Ftp.get(prefixedPath, 'filefromserver.txt', err => {
        if(err)
            return console.log('err: ', err);
    
        console.log(`${fileName} was successfully fetched`);
    });
}

function uploadFileToServer(filePaths) {
    filePaths.forEach(filePath => {
        Ftp.put(filePath, `${filePath}`, err => {
            if(err)
                return console.log('err: ', err);
        
            console.log(`${filePath} succesfully uploaded!`);
        });
    });
}

function diffFiles(file1, file2) {
    return comperator.compare(file1, file2, (bool, err) => {
        if(err)
            return console.log('err: ', err);
    
        return bool;
    });
}

function diffAllFilesInFolder(folder1) {
    Ftp.ls(folder1, (err, res) => {
        if(err)
            return console.log('err: ', err);

        console.log(res);
    })
}