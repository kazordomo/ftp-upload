const jsftp = require('jsftp');
const dirTree = require('directory-tree');
const { ftpConf } = require('../config/index.js');
const comperator = require('file-compare');

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

function getFromServer(fileName) {
    Ftp.get(fileName, 'filefromserver.txt', err => {
        if(err)
            return console.log('err: ', err);
    
        console.log(`${fileName} was successfully fetched`);
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
    const fileName = filePath.split('\\');
    fileName[fileName.length - 1];
    //second argument where to put it on the remote server.
    Ftp.put(filePath, fileName[fileName.length - 1], err => {
        if(err)
            return console.log('err: ', err);
    
        console.log(`${filePath} succesfully uploaded!`);
    });
}

function diffFiles(file1, file2) {
    return comperator.compare(file1, file2, (bool, err) => {
        if(err)
            return console.log('err: ', err);
    
        return bool;
    });
}

module.exports = {
    getFromServer,
    listServerFiles,
    listLocalFiles,
    uploadFileToServer,
}
