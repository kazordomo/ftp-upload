const zipper = require('zip-local');
const { paths } = require('../config');

function zipProject() {
    zipper.zip(paths.zipFolderPath, (err, zipped) => {
        if(err)
            return console.log(err);

        zipped.save('testProject.zip', err => {
            if(err)
                return console.log(err);

            console.log('Zip success!');
        })
    })
}

module.exports = {
    zipProject,
}