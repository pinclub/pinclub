TESTS = $(shell find test -type f -name "*.test.js")
TEST_TIMEOUT = 20000
MOCHA_REPORTER = spec
# NPM_REGISTRY = "--registry=http://registry.npm.taobao.org"
NPM_REGISTRY = ""


all: test

install:
	@npm install $(NPM_REGISTRY)

pretest:
	@if ! test -f config.js; then \
		cp config.default.js config.js; \
	fi
	@if ! test -d public/upload; then \
		mkdir public/upload; \
	fi

test: install build
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		-r should \
		-r test/env \
		-t $(TEST_TIMEOUT) \
		$(TESTS)

testfile:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		-r should \
		-r test/env \
		-t $(TEST_TIMEOUT) \
		$(FILE)

test-cov cov: install pretest
	@./node_modules/.bin/nyc --reporter=html --reporter=mocha --reporter=text-summary --report-dir ./public/testcov make test

test-cov2 cov2: install pretest
	@NODE_ENV=init node \
		node_modules/.bin/istanbul cover --preserve-comments --dir ./public/testcov \
		./node_modules/.bin/_mocha \
		-- \
		--reporter $(MOCHA_REPORTER) \
		-r should \
		-r test/env \
		-t $(TEST_TIMEOUT) \
		$(TESTS)


build:
	@./node_modules/loader-builder/bin/builder picviews .

run:
	@node app.js

start: install build
	@NODE_ENV=production ./node_modules/.bin/pm2 start app.js -i 0 --name "pinclub" --max-memory-restart 400M

restart: install build
	@NODE_ENV=production ./node_modules/.bin/pm2 restart "pinclub"

initdbfunc: install build
    @NODE_ENV=init ./node_modules/.bin/pm2 restart "pinclub"

.PHONY: install test testfile cov test-cov build run start restart initdbfunc
