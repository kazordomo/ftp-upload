const jsftp = require('jsftp');
const dirTree = require('directory-tree');
const { ftpConf } = require('../config/index.js');
const comperator = require('file-compare');
const fs = require('fs');

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

function checkDiff(localFilePath) {
    console.log(localFilePath);
    const fileName = getFileNameFromPath(localFilePath);
    return new Promise((resolve, reject) => { 
        //TODO: we need the whole path, but splitted at the right time.
        Ftp.get(fileName, 'serverFile.txt', err => {
            if(err)
                return reject(err);
        
            console.log(`${fileName} was successfully fetched`);
            return resolve(diffFiles(localFilePath, './serverFile.txt'));
        });
    });
}

function listServerFiles(dirPath) {
    return new Promise((resolve, reject) => {
        Ftp.ls(dirPath, (err, res) => {
            if(err)
                return reject(err);
            
            return resolve(res);
        })
    });
}

function listLocalFiles(dirPath) {
    return dirTree(dirPath);
}

function uploadFileToServer(filePath) {
    const fileName = getFileNameFromPath(filePath);
    //second argument where to put it on the remote server.
    Ftp.put(filePath, fileName[fileName.length - 1], err => {
        if(err)
            return console.log('err: ', err);
    
        console.log(`${filePath} succesfully uploaded!`);
    });
}

function diffFiles(file1, file2) {
    return new Promise((resolve, reject) => { 
        comperator.compare(file1, file2, (bool, err) => {
            if(err)
                return reject(err);
        
            return resolve(bool);
        });
    });
}

function getFileNameFromPath(path) {
    //TODO: path will only be split successfully with \\ on windows
    const splitedPath = path.split('\\');
    return splitedPath[splitedPath.length - 1];
}

module.exports = {
    listLocalFiles,
    uploadFileToServer,
    checkDiff,
}
