const jsftp = require('jsftp');
const dirTree = require('directory-tree');
const { ftpConf } = require('../config/index.js');
const comperator = require('file-compare');
const { paths } = require('../config');

const Ftp = createNewFtpSess();

Ftp.auth(ftpConf.user, ftpConf.pass, (err, data) => {
    if(err)
        return console.log('err: ', err);

    console.log('Auth success, welcome.');
});

function checkDiff(localFilePath) {
    const fileName = getRemotePath(localFilePath);
    return new Promise((resolve, reject) => { 
        Ftp.get(fileName, 'serverFile.txt', err => {
            if(err)
                return reject(err);
        
            console.log(`${fileName} was successfully fetched`);
            return resolve(diffFiles(localFilePath, './serverFile.txt'));
        });
    });
}

// we need to create a new sess for each file we upload. 
// jsftp will only handle one upload each sess.
function createNewFtpSess(){
    return new jsftp({
        host: ftpConf.host,
        port: ftpConf.port,
        user: ftpConf.user,
        pass: ftpConf.pass,
    });
} 

function listLocalFiles(dirPath) {
    return dirTree(dirPath);
}

function listServerFiles(path = '.') {
    return new Promise((resolve, reject) => { 
        Ftp.ls(path, (err, res) => {
            if(err)
                return reject(err);
            
            return resolve(res);
        });
    });
}

function uploadFileToServer(filePath) {
    const remotePath = getRemotePath(filePath);
    const ftpSess = createNewFtpSess();

    ftpSess.put(filePath, remotePath, err => {
        if(err)
            return console.log('err: ', err);
    
        console.log(`${filePath} succesfully uploaded!`);
    });
}

//TODO: hardcoded atm. should upload all files to all folders within folder...
function uploadFileToAllSites(filePath) {
    const sitesArray = ['site1', 'site2', 'site3'];
    sitesArray.forEach(site => {
        const fileName = getRemotePath(filePath);
        const ftpSess = createNewFtpSess();

        ftpSess.put(filePath, `sites/${site}/${fileName}`, err => {
            if(err)
                return console.log('err: ', err);
        
            console.log(`${fileName} succesfully uploaded!`);
        });
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

function getRemotePath(path) {
    return path.substring(paths.mainPath.length, path.length).replace(/\\/g,"/");
}

module.exports = {
    listLocalFiles,
    listServerFiles,
    uploadFileToServer,
    uploadFileToAllSites,
    checkDiff,
}
