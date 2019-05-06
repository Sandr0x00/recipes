#!/usr/bin/env python3

import os
import shutil

if __name__ == "__main__":
    folder = 'dist'
    if not os.path.isdir(folder):
        os.mkdir(folder)
    else:
        shutil.rmtree(dist) 
        os.mkdir(folder)

    shutil.copy('helper.js', 'dist')
    shutil.copy('server.js', 'dist')
    shutil.copytree('public', 'dist/public')
    shutil.copytree('views', 'dist/views')
    shutil.copytree('recipes', 'dist/recipes')
    