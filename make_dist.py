#!/usr/bin/env python3

import os
import shutil

if __name__ == "__main__":
    folder = 'dist'
    if not os.path.isdir(folder):
        os.mkdir(folder)
    else:
        shutil.rmtree(folder)
        os.mkdir(folder)

    shutil.copy('helper.js', 'dist')
    shutil.copy('server.js', 'dist')
    shutil.copy('package.json', 'dist')
    shutil.copy('package-lock.json', 'dist')
    shutil.copytree('public', 'dist/public')
    shutil.copytree('views', 'dist/views')
    shutil.copytree('recipes', 'dist/recipes')
    shutil.copytree('node_modules', 'dist/node_modules')
    