const ftp = require('./ftp');

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
    // listFromServer();
}

// const listFromServer = async () => {
//     const serverDirTree = await ftp.listServerFiles('.');
// }

const initEventListeners = () => {
    buttonPath.addEventListener('click', () => getProjectFromPath());
    // inputPath.value = 'C:\\xampp\\htdocs\\brokerwebpage\\wp-content\\plugins\\mspecs';
    // inputPath.value = 'C:\\Users\\Zak\\Dev\\Kaz\\ftp-upload\\dummyuploads';
    inputPath.value = 'C:\\users\\Zak\\Dev\\Kaz\\ftp-upload\\app';
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

const addToUpload = file => {
    const isAdded = 
        uploadFilesArr.filter(fileInArr => file === fileInArr).length;

    if(isAdded)
        return;

    uploadFilesArr.push(file);
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', file);
    newDiv.addEventListener('click', () => removeFromUpload(file));
    newDiv.innerHTML = file.name;
    uploadFiles.appendChild(newDiv);
}

//error when uploading multiple files
const uploadToServer = () => {
    uploadFilesArr.forEach(file => {
        ftp.uploadFileToServer(file.path);
    });
}

//TODO: BUGGY
const removeFromUpload = file => {
    uploadFilesArr.splice(uploadFilesArr.indexOf(file), 1);
    document.getElementById(file).remove();
}

const getProjectFromPath = () => {
    getAndOutPutFiles(inputElement.value);
}

init();