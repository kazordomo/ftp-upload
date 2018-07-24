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

    // createDummyFiles();
    console.log('Auth success, welcome.');
});

function createDummyFiles() {
    Ftp.ls('.', (err, res) => {
        if(err)
            return console.log('err: ', err);
    
        const arr = [];
        res.forEach(item => {
            if(item.name === 'new_dir')
                arr.push(item);
        });
    
        if(!arr.length) {
            Ftp.raw('mkd', '/sites', (err, data) => {
                if(err)
                    return console.log('err: ', err);
    
                console.log(data);
                Ftp.raw('mkd', '/sites/site1', (err, data) => {
                    if(err)
                        return console.log('err: ', err);
        
                    console.log(data);
                });
                Ftp.raw('mkd', '/sites/site2', (err, data) => {
                    if(err)
                        return console.log('err: ', err);
        
                    console.log(data);
                });
                Ftp.raw('mkd', '/sites/site3', (err, data) => {
                    if(err)
                        return console.log('err: ', err);
        
                    console.log(data);
                });
            });
        }
    });
}

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

function uploadFileToServer(filePath) {
    const fileName = getFileNameFromPath(filePath);
    const ftpSess = createNewFtpSess();

    ftpSess.put(filePath, fileName, err => {
        if(err)
            return console.log('err: ', err);
    
        console.log(`${filePath} succesfully uploaded!`);
    });
}

function uploadFileToAllSites(filePath) {
    const sitesArray = ['site1', 'site2', 'site3'];
    sitesArray.forEach(site => {
        const fileName = getFileNameFromPath(filePath);
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

function getFileNameFromPath(path) {
    //TODO: path will only be split successfully with \\ on windows
    const splitedPath = path.split('\\');
    return splitedPath[splitedPath.length - 1];
}

module.exports = {
    listLocalFiles,
    uploadFileToServer,
    uploadFileToAllSites,
    checkDiff,
}
