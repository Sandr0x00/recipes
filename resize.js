/* global require, module, __dirname, console, Promise */
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');
sharp.cache(false);

const dirPath = path.join(__dirname, 'images');
fs.readdirSync(dirPath).forEach(fileName => {
    let filePath = path.join(dirPath, fileName);
    let stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        console.log('There should be no directory here!');
    } else if (stats.isFile()) {
        resizeOriginal(fileName, 1920, 1920, sharp.fit.inside);
        resize('', fileName, 600, 600, sharp.fit.inside);
        resize('thumbnail_', fileName, 280, 430, sharp.fit.cover);
        resize('placeholder_', fileName, 32, 32, sharp.fit.inside);
    }
});

function resizeOriginal(file, width, height, fit) {
    let to = `images/${file}`;
    let jpg = sharp(to);
    jpg.metadata().then(metadata => {
        if (metadata.width > width || metadata.height > height) {
            jpg.resize({
                width: width,
                height: height,
                fit: fit,
                withoutEnlargement: true
            })
            .jpeg({
                quality: 95,
            });
            saveFile(to, jpg);
        }
    });
}

function resize(prefix, file, width, height, fit) {
    let fileName = path.parse(file);
    let name = fileName.name;

    let to = `public/images/${prefix}${name}.jpg`;
    let jpg = sharp(`images/${file}`)
        .resize({
            width: width,
            height: height,
            fit: fit,
            withoutEnlargement: true
        })
        .jpeg({
            quality: 90,
        });
    saveFile(to, jpg);
};

function saveFile(to, jpg) {
    if (fs.existsSync(to)) {
        let s = fs.ReadStream(to);
        let a = new Promise((resolve, reject) => {
            let sha = crypto.createHash('sha256');
            s.on('data', d => sha.update(d));
            s.on('end', () => resolve(sha.digest('hex')));
        });
        let b = new Promise((resolve, reject) => {
            jpg.toBuffer().then(data => resolve(crypto.createHash('sha256').update(data).digest('hex')));
        });
        Promise.all([a,b])
            .then(values => {
                // only write, if file has changed
                if (values[0] !== values[1]) {
                    console.log(`Write ${to}`);
                    jpg.toBuffer().then(data => {
                        fs.writeFile(to, data, (err) => {
                            if (err) throw err;
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                }
            }).catch(err => {
                console.log(err);
            });
    } else {
        console.log(`Write ${to}`);
        jpg.toFile(to);
    }
}