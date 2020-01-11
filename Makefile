.PHONY: build-css build-js build resize dist

build-css:
	sass sass:public/css -s compressed

build-js:
	rollup -c

resize:
	node resize.js

build: build-css build-js resize
	./copy.py

test:
	eslint .
	mocha

dist: build test
	./make_dist.py

serve:
	sass sass:public/css -s compressed --watch
	node server.js

start:
	node server.js

kill:
	@kill `cat pid`
	@ps -ef | grep "node server.js"

nohup:
	@nohup node server.js 2>&1 &
	@printf ""
	@tail -n 2 nohup.out
	@cat pid
	@printf "\n"

status:
	ps -ef | grep "node server.js"

deploy: dist
	scp -rp -P 9681 dist/* pi@sandr0.tk:~/recipes/
