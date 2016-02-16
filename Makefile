include n.Makefile

.PHONY: test coverage

test: verify unit-test

unit-test:
	$(NPM_BIN_ENV); istanbul cover ./node_modules/.bin/_mocha

coverage:
	open coverage/lcov-report/index.html
