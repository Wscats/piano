const fs = require('fs-extra');
async function copyFiles() {
    try {
        await fs.copy('./build', './plugin/build')
        console.log('success!')
    } catch (err) {
        console.error(err)
    }
}

copyFiles();