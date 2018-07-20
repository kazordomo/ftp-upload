const ftp = require('./ftp');
const { inputPathDefault } = require('../config');

const inputElement = document.getElementById('input-path');
const dirTree = document.getElementById('directory-tree');
const inputPath = document.getElementById('input-path');
const buttonPath = document.getElementById('button-path');
const buttonParentFolder = document.getElementById('parent-folder')
const uploadFiles = document.getElementById('upload-files');
const buttonUpload = document.getElementById('button-upload');
const uploadFilesArr = [];
let activeFolder = '';

const init = () => {
    inputPath.value = inputPathDefault;
    initEventListeners();
}

const checkDiff = async localFilePath => await ftp.checkDiff(localFilePath);

const initEventListeners = () => {
    buttonPath.addEventListener('click', () => getFolder());
    buttonParentFolder.addEventListener('click', () => moveUpOneFolder(inputPath.value));
    buttonUpload.addEventListener('click', () => uploadToServer());
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
    const isAdded = 
        uploadFilesArr.filter(fileInArr => file === fileInArr).length;

    if(isAdded)
        return;

    uploadFilesArr.push(file);
    let divEle = createUploadDiv(file);
    uploadFiles.appendChild(divEle);
    fileDiffStyle(file.path, divEle);
}

//error when uploading multiple files
const uploadToServer = () => {
    //TODO: promise.all?
    uploadFilesArr.forEach(file => {
        ftp.uploadFileToServer(file.path);
    });
}

const removeFromUpload = file => {
    uploadFilesArr.splice(uploadFilesArr.indexOf(file), 1);
    document.getElementById(file.name).remove();
}

init();