const ftp = require('./ftp');
const { zipProject } = require('./utils');
const { inputPathDefault } = require('../config');

const inputElement = document.getElementById('input-path');
const dirTree = document.getElementById('directory-tree');
const inputPath = document.getElementById('input-path');
const uploadFilesArr = [];
let activeFolder = '';

const init = () => {
    inputPath.value = inputPathDefault;
    initEventListeners();
}

const checkDiff = async localFilePath => await ftp.checkDiff(localFilePath);

const initEventListeners = () => {
    const buttonPath = document.getElementById('button-path');
    const buttonParentFolder = document.getElementById('parent-folder')
    const buttonUploadSingle = document.getElementById('button-single-upload');
    const buttonUploadMultiple = document.getElementById('button-multiple-upload');
    const buttonZip = document.getElementById('button-zip');

    buttonPath.addEventListener('click', () => getFolder());
    buttonParentFolder.addEventListener('click', () => moveUpOneFolder(inputPath.value));
    buttonUploadSingle.addEventListener('click', () => uploadToSingleSite());
    buttonUploadMultiple.addEventListener('click', () => uploadToMultipleSites());
    buttonZip.addEventListener('click', () => zipProject());
}

const createDirTreeDiv = item => {
    let newDiv = document.createElement('div');
    newDiv.classList.add('row');
    const clickEvent = () => item.type === 'directory' ? 
        openDirectory(item.name) : 
        addToUpload(item);
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
    if(item.type === 'directory')
        newIcon.classList.add('fas', 'fa-folder');
    else
        newIcon.classList.add('far', 'fa-file-alt');
    return newIcon;
}

const createDirTreeElem = (item, parentDiv) => {
    let divEle = createDirTreeDiv(item);
    let spanEle = createDirTreeSpan(item);
    let iconEle = createDirTreeIcon(item);

    divEle.appendChild(iconEle);
    divEle.appendChild(spanEle);
    parentDiv.appendChild(divEle);
}

const getFolder = () => {
    const filesAndFolders = ftp.listLocalFiles(inputElement.value);
    if(activeFolder === inputElement.value)
        return;
    else {
        activeFolder = inputElement.value;
        filesAndFolders.children.forEach(item => createDirTreeElem(item, dirTree));
    }
}

const getParentDir = path => {
    const splitPath = path.split('\\');
    splitPath.splice([splitPath.length - 1], 1);
    return splitPath.join('\\');
}

const moveUpOneFolder = path => {
    const newPath = getParentDir(path);
    openDirectory(newPath, true);
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

const uploadAllFiles = func => {
    //TODO: promise.all?
    uploadFilesArr.forEach(file => {
        func(file.path);
    });
}

const uploadToSingleSite = () => {
    uploadAllFiles(ftp.uploadFileToServer);
}

const uploadToMultipleSites = () => {
    uploadAllFiles(ftp.uploadFileToAllSites);
}

const removeFromUpload = file => {
    uploadFilesArr.splice(uploadFilesArr.indexOf(file), 1);
    document.getElementById(file.name).remove();
}

init();