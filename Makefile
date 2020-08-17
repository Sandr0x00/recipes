.PHONY: build-css build-js build resize dist test recipes

build-css:
	sass sass:public/css -s compressed

build-js:
	npm run compile

resize:
	node scripts/resize.js

recipes:
	node scripts/preprocess.js

icons:
	./scripts/pixelparser.py

build: build-css build-js resize recipes

test:
	npm test

dist: build test
	scripts/make_dist.py

serve:
	sass sass:public/css -s compressed --watch& node server.js

start:
	node server.js

kill:
	@kill `cat pid`
	@ps -ef | grep "[n]ode server.js"

nohup:
	@nohup node server.js 2>&1 &
	@printf ""
	@tail -n 2 nohup.out
	@cat pid
	@printf "\n"

status:
	ps -ef | grep "[n]ode server.js"
