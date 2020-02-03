#!/usr/bin/env node

/* global require */

const express = require('express');
const compression = require('compression');
const fs = require('fs');
const app = express();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const process = require('process');

if (process.pid) {
    // safe PID for "make kill"
    fs.writeFile('pid', process.pid, (err) => {
        if (err) {
            throw err;
        }
        console.log(`PID: ${process.pid}`);
    });
}

let port = config.port;
if (port == null || port == '') {
    port = 8082;
}

let helper = require('./helper');

let json = helper.loadJSON();
let recipes = json.recipes;
let tags = json.tags;
let general = Object.values(helper.extractGeneralInfo(recipes));

app.locals.compileDebug = true;
app.locals.cache = false;

app.use(express.static('public', {
    setHeaders: function(res) {
        setHeaders(res);
    }
}));
app.use(compression());

app.get('/api/all', (req, res) => {
    setHeaders(res);
    res.json(general);
});

app.get('/api/tags', (req, res) => {
    setHeaders(res);
    res.json(tags);
});

app.get('/api/recipe/:id', (req, res) => {
    setHeaders(res);
    let id = req.params.id;
    if (id in recipes) {
        res.json(recipes[id]);
    } else {
        res.status(404);
        res.send();
    }
});

app.get('/api/tag/:tag', (req, res) => {
    setHeaders(res);
    let r = general.filter((item) => item.tags.includes(req.params.tag));

    if (r && r.length !== 0) {
        res.json(r);
    } else {
        res.status(404);
        res.send();
    }
});

app.get('/favicon.ico', (req, res) => {
    setHeaders(res);
    res.setHeader('Content-Type', 'image/png');
    let s = fs.createReadStream(`public/favicon_${Math.floor(Math.random() * 6)}.png`);
    s.pipe(res);
});

app.get('*', (req, res) => {
    setHeaders(res);
    console.log(req.params['0']);
    res.status(404);
    res.send();
});

app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

function setHeaders(res) {
    res.setHeader('X-XSS-ProtectionType', '"1; mode=block"');
    res.setHeader('X-Frame-Options', 'deny');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', '"max-age=31536000; includeSubDomains; preload"');
    res.setHeader('Content-Security-Policy',
        'default-src \'none\';'
        + 'img-src \'self\';'
        + 'style-src \'self\' \'unsafe-inline\';'
        + 'script-src \'self\' \'unsafe-inline\';'
        + 'font-src \'none\';'
        + 'connect-src \'self\';'
        + 'frame-ancestors \'none\';');
    res.setHeader('X-Permitted-Cross-Domain-Policies', '"none"');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Feature-Policy', 'accelerometer \'none\'; camera \'none\'; geolocation \'none\'; gyroscope \'none\'; magnetometer \'none\'; microphone \'none\'; payment \'none\'; usb \'none\'; sync-xhr \'none\'');
}