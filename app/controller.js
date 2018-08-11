const ftp = require('./ftp');
const { paths } = require('../config');

const inputElement = document.getElementById('input-path');
const dirTree = document.getElementById('directory-tree');
const serverTree = document.getElementById('server-tree');
const inputPath = document.getElementById('input-path');

const uploadFilesArr = [];
let activeLocalFolder = '';
let serverFolderPath = '.';

const init = () => {
    inputPath.value = paths.inputPathDefault;
    initEventListeners();
    initServerFiles();
}

const checkDiff = async localFilePath => await ftp.checkDiff(localFilePath);

const initEventListeners = () => {
    const buttonPath = document.getElementById('button-path');
    const buttonLocalParentFolder = document.getElementsByClassName('parent-folder')[0];
    const buttonServerParentFolder = document.getElementsByClassName('parent-folder')[1];
    const buttonUploadSingle = document.getElementById('button-single-upload');
    const buttonUploadMultiple = document.getElementById('button-multiple-upload');
    const buttonUploadAllSingle = document.getElementById('button-single-all-upload');

    buttonPath.addEventListener('click', () => getFolder());
    buttonLocalParentFolder.addEventListener('click', () => moveUpOneFolder(inputPath.value));
    buttonServerParentFolder.addEventListener('click', () => moveUpOneFolder(serverFolderPath, true));
    buttonUploadSingle.addEventListener('click', () => uploadToSingleSite());
    buttonUploadAllSingle.addEventListener('click', () => uploadAllFilesToSite());
    buttonUploadMultiple.addEventListener('click', () => uploadToMultipleSites());
}

const initServerFiles = async path => {
    const serverFilesAndFolders = await ftp.listServerFiles(path);

    while(serverTree.firstChild)
        serverTree.removeChild(serverTree.firstChild);
        
    serverFilesAndFolders.forEach(item => { 
        const clickEvent = () => {
            if(item.type === 0)
                return;

            serverFolderPath = `${serverFolderPath}/${item.name}`;
            initServerFiles(serverFolderPath);
        }
        createDirTreeElem(item, serverTree, clickEvent)
    });
}

const createDirTreeDiv = (item, clickEvent) => {
    let newDiv = document.createElement('div');
    newDiv.classList.add('row');
    newDiv.addEventListener('click', () => clickEvent());
    return newDiv;
}

const createDirTreeSpan = item => {
    const newSpan = document.createElement('span');
    newSpan.innerHTML = item.name;
    return newSpan;
}

const createDirTreeIcon = item => {
    let newIcon = document.createElement('i');
    // local items will display type === 'directory' if dir and 
    // server items will display type === 1 if dir
    if(item.type === 'directory' || item.type === 1)
        newIcon.classList.add('fas', 'fa-folder');
    else
        newIcon.classList.add('far', 'fa-file-alt');
    return newIcon;
}

const createDirTreeElem = (item, parentDiv, clickEvent) => {
    let divEle = createDirTreeDiv(item, clickEvent);
    let spanEle = createDirTreeSpan(item);
    let iconEle = createDirTreeIcon(item);

    divEle.appendChild(iconEle);
    divEle.appendChild(spanEle);
    parentDiv.appendChild(divEle);
}

const getFolder = () => {
    const filesAndFolders = ftp.listLocalFiles(inputElement.value);
    if(activeLocalFolder === inputElement.value)
        return;
    else {
        activeLocalFolder = inputElement.value;
        filesAndFolders.children.forEach(item => { 
            const clickEvent = () => item.type === 'directory' ? 
                openDirectory(item.name) : 
                addToUpload(item);

            createDirTreeElem(item, dirTree, clickEvent)
        });
    }
}

const getParentDir = (path, serverTree) => {
    //TODO: no. we should use slashes the same way around the project.

    if(serverTree) {
        const splitPath = path.split('/');
        splitPath.splice([splitPath.length - 1], 1);
        return splitPath.join('/');
    } else {
        const splitPath = path.split('\\');
        splitPath.splice([splitPath.length - 1], 1);
        return splitPath.join('\\');
    }
}

const moveUpOneFolder = (path, serverTree) => {
    //TODO: sending serverTree = true to getParentDir because
    // different usage of backslashes and normal slashes...

    const newPath = getParentDir(path, serverTree);
    if(serverTree) {
        serverFolderPath = newPath;
        initServerFiles(serverFolderPath);
    } else {
        openDirectory(newPath, true);
    }
}

const openDirectory = (dirName, reset) => {
    if(reset)
        inputElement.value = dirName;
    else
        inputElement.value += `\\${dirName}`;

    while (dirTree.firstChild)
        dirTree.removeChild(dirTree.firstChild);
        
    document.getElementById('button-path').click();
}

const fileDiffStyle = async (path, element) => {
    const noFileDiff = await checkDiff(path);
    if(noFileDiff)
        element.style.color = 'green';
    else
        element.style.color = 'red';
}

const createUploadDiv = file => {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', file.name);
    newDiv.addEventListener('click', () => removeFromUpload(file));
    newDiv.innerHTML = file.name;
    return newDiv;
}

const addToUpload = file => {
    const uploadFiles = document.getElementById('upload-files');

    const isAdded = 
        uploadFilesArr.filter(fileInArr => file === fileInArr).length;

    if(isAdded)
        return;

    uploadFilesArr.push(file);
    let divEle = createUploadDiv(file);
    uploadFiles.appendChild(divEle);
    // fileDiffStyle(file.path, divEle);
}

const uploadAllFiles = (func, arr = uploadFilesArr) => {
    arr.forEach(file => {
        func(file.path);
    });
}

//TODO: callback or promise to run initeServerFiles when file is uploaded.
const uploadToSingleSite = arr => {
    uploadAllFiles(ftp.uploadFileToServer, arr);
}

const uploadToMultipleSites = () => {
    uploadAllFiles(ftp.uploadFileToAllSites);
}

// upload everything from the most parent folder (inputpathdefault).
const uploadAllFilesToSite = () => {
    const filesAndFolders = ftp.listLocalFiles(paths.inputPathDefault);

    const filePaths = [];
    const recursive = arr => {
        arr.forEach(item => {
            if(item.type === 'directory') {
                recursive(item.children);
            } else {
                filePaths.push(item);
            }
        });
    }

    recursive(filesAndFolders.children);
    if(filePaths.length)
        uploadToSingleSite(filePaths);
}

const removeFromUpload = file => {
    uploadFilesArr.splice(uploadFilesArr.indexOf(file), 1);
    document.getElementById(file.name).remove();
}

init();