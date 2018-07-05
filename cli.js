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

// -m put pathToFile | upload file to server.
if(argv.m === 'put')
    uploadToServer();

// -m get pathToFileOnServer | fetch the file from server.
if(argv.m === 'get')
    getFromServer(argv._[0]);

if(argv.m === 'mkdir')
    createDir();

// -m diff pathToFile1 pathToFile2 | returns true if the files is identical.
if(argv.m === 'diff')
    diffFiles(argv._[0], argv._[1]);

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

function getFromServer(pathToFile) {
    // const getFromServerPath = '/new_dir/testfile.txt';
    Ftp.get(pathToFile, 'filefromserver.txt', err => {
        if(err)
            return console.log('err: ', err);
    
        console.log(`${getFromServerPath} was successfully fetched`);
    });
}

function uploadToServer() {
    const filePaths = ['./testfile.txt'];
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
