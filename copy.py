#!/usr/bin/env python3

import os
import json
import hashlib
import base64

def sriOfFile(filepath:str):
    sha = sha384OfFile(filepath)
    return 'sha384-' + base64.b64encode(sha).decode() #drop newline added by b64

def sha384OfFile(filepath:str):
    sha = hashlib.sha384()
    with open(filepath, 'rb') as f:
        while True:
            block = f.read(2**10) # Magic number: one-megabyte blocks.
            if not block: break
            sha.update(block)
        return sha.digest()

def copy(cp_from:str, cp_to:str, src_map:bool):
    with open(f'node_modules/{cp_from}') as f:
        file_str = f.read()
    with open(f'public/lib/{cp_to}', 'w+') as f:
        f.write(file_str)
    int_sha384 = sriOfFile(f'public/lib/{cp_to}')
    print(f'{cp_to} copied, integrity {int_sha384}')

    if src_map:
        with open(f'node_modules/{cp_from}.map') as f:
            file_str = f.read()
        with open(f'public/lib/{cp_to}.map', 'w+') as f:
            f.write(file_str)
        print('Source map copied')

    return int_sha384

if __name__ == "__main__":
    folder = 'public/lib'
    if not os.path.isdir(folder):
        os.mkdir(folder)

    for the_file in os.listdir(folder):
        file_path = os.path.join(folder, the_file)
        try:
            os.remove(file_path)
        except Exception as e:
            print(e)
    obj = {
        'jquery.min.js': copy('jquery/dist/jquery.min.js', 'jquery.min.js', False),
        'bootstrap.min.js': copy('bootstrap/dist/js/bootstrap.min.js', 'bootstrap.min.js', True),
        'bootstrap.min.css': copy('bootstrap/dist/css/bootstrap.min.css', 'bootstrap.min.css', True),
        'popper.min.js': copy('popper.js/dist/umd/popper.min.js', 'popper.min.js', True),
        'jquery.lazy.min.js': copy('jquery-lazy/jquery.lazy.min.js', 'jquery.lazy.min.js', False)
    }
    with open('public/lib/integrity.json', 'w+') as f:
        f.write(json.dumps(obj, indent=4))
