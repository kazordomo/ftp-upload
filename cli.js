#!/usr/bin/env node

//TODO: use path module to make the folder paths correct throughout (different os for example).

const jsftp = require('jsftp');
const { ftpConf } = require('./config/index.js');
const comperator = require('file-compare');
const argv = require('minimist')(process.argv.slice(2));

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

if(argv.m === 'mkdir')
    createDir();

// -m diff pathToFile1 pathToFile2 | returns true if the files is identical.
if(argv.m === 'diff')
    diffFiles(argv._[0], argv._[1]);

// -m diffFolder /dir_name |
if(argv.m === 'diffFolder')
    diffAllFilesInFolder(argv._[0]);

function createDir() {
    Ftp.ls('.', (err, res) => {
        if(err)
            return console.log('err: ', err);
    
        const arr = [];
        res.forEach(item => {
            if(item.name === 'new_dir')
                arr.push(item);
        });
    
        if(!arr.length) {
            Ftp.raw('mkd', '/new_dir', (err, data) => {
                if(err)
                    return console.log('err: ', err);
    
                console.log(data);
            });
        }
    });
}

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
        Ftp.put(filePath, `/new_dir/${filePath}`, err => {
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
