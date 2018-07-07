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

function listFromServerFolder(dirName) {
    return new Promise((resolve, reject) => {
        Ftp.ls(dirName, (err, res) => {
            if(err)
                return reject(err);
    
            return resolve(res.map(file => file.name));
        })
    });
}

function listLocalFiles(dirPath) {
    console.log(dirPath);
    return dirTree(dirPath);
}

module.exports = {
    getFromServer,
    listFromServerFolder,
    listLocalFiles,
}
