include n.Makefile

.PHONY: test coverage

clean:
	git clean -fxd

test: verify
	$(NPM_BIN_ENV); istanbul cover ./node_modules/.bin/_mocha

coverage:
	open coverage/lcov-report/index.html
