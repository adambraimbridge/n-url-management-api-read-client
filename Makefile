include n.Makefile

.PHONY: test coverage

test: verify unit-test

unit-test:
	$(NPM_BIN_ENV); mocha

coverage:
	$(NPM_BIN_ENV); istanbul cover ./node_modules/.bin/_mocha
	open coverage/lcov-report/index.html
