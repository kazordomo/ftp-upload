const zipper = require('zip-local');

function zipProject() {
    zipper.zip('C:\\users\\Zak\\Dev\\Kaz\\ftp-upload', (err, zipped) => {
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