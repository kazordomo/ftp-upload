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

const init = () => {
    initEventListeners();
}

const checkDiff = async localFilePath => await ftp.checkDiff(localFilePath);

const initEventListeners = () => {
    buttonPath.addEventListener('click', () => getProjectFromPath());
    inputPath.value = inputPathDefault;
    buttonParentFolder.addEventListener('click', () => moveUpOneFolder(inputPath.value));
    buttonUpload.addEventListener('click', () => uploadToServer());
}

const createDirTreeElem = (item, parentDiv) => {
    let newDiv = document.createElement('div');
    newDiv.classList.add('row');
    let newSpan = document.createElement('span');
    let newIcon = document.createElement('i');

    if(item.type === 'directory') {
        newIcon.classList.add('fas', 'fa-folder');
        newDiv.addEventListener('click', () => openDirectory(item.name));
    } else {
        newIcon.classList.add('far', 'fa-file-alt');
        newDiv.addEventListener('click', () => addToUpload(item));
    }

    newSpan.innerHTML = item.name;
    newDiv.appendChild(newIcon);
    newDiv.appendChild(newSpan);
    parentDiv.appendChild(newDiv);
}

const getAndOutPutFiles = projectPath => {
    const filesAndFolders = ftp.listLocalFiles(projectPath);
    filesAndFolders.children.forEach(item => {
        createDirTreeElem(item, dirTree);
    });
}

const moveUpOneFolder = path => {
    const newPath = path.split('\\');
    newPath.splice([newPath.length - 1], 1);
    openDirectory(newPath.join('\\'), true);
}

const openDirectory = (dirName, reset) => {
    if(reset) {
        inputElement.value = dirName;
    } else {
        inputElement.value += `\\${dirName}`;
    }
    while (dirTree.firstChild) {
        dirTree.removeChild(dirTree.firstChild);
    }
    document.getElementById('button-path').click();
}

const fileDiffStyle = async (path, element) => {
    const noFileDiff = await checkDiff(path);
    if(noFileDiff)
        element.style.color = 'green';
    else
        element.style.color = 'red';
}

const addToUpload = file => {
    const isAdded = 
        uploadFilesArr.filter(fileInArr => file === fileInArr).length;

    if(isAdded)
        return;

    uploadFilesArr.push(file);
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', file.name);
    newDiv.addEventListener('click', () => removeFromUpload(file));
    newDiv.innerHTML = file.name;
    uploadFiles.appendChild(newDiv);
    fileDiffStyle(file.path, newDiv);
}

//error when uploading multiple files
const uploadToServer = () => {+
    uploadFilesArr.forEach(file => {
        ftp.uploadFileToServer(file.path);
    });
}

const removeFromUpload = file => {
    uploadFilesArr.splice(uploadFilesArr.indexOf(file), 1);
    document.getElementById(file.name).remove();
}

const getProjectFromPath = () => {
    getAndOutPutFiles(inputElement.value);
}

init();