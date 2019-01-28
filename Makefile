TESTS = $(shell find test -type f -name "*.test.js")
TEST_TIMEOUT = 20000
MOCHA_REPORTER = spec


install:
	@cnpm install 

test: install
	mocha \
	--reporter $(MOCHA_REPORTER) \
	-r should \
	--timeout $(TEST_TIMEOUT) \
	$(TESTS)



.PHONY: test