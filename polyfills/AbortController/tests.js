/* eslint-env mocha */
/* globals proclaim, AbortSignal */

describe('AbortSignal', function () {
    it('is a function', function () {
        proclaim.isFunction(AbortSignal);
    });

    it('has correct arity', function () {
        proclaim.arity(AbortSignal, 0);
    });

    it('has correct name', function () {
        proclaim.hasName(AbortSignal, 'AbortSignal');
    });

    it('is not enumerable', function () {
        proclaim.isNotEnumerable(window, 'AbortSignal');
    });

    // Copied from https://github.com/mo/abortcontroller-polyfill/blob/master/tests/basic.test.js
    describe('basic tests', function () {
        it('Request object has .signal', function () {
            var controller = new AbortController();
            var signal = controller.signal;
            var request = new Request('/', {
                signal: signal
            });
            proclaim.ok(request.signal);
            proclaim.ok(Request.prototype.isPrototypeOf(request));
        });

        it('abort during fetch', function (done) {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            var controller = new AbortController();
            var signal = controller.signal;
            setTimeout(function () {
                controller.abort();
            }, 500);
            fetch('https://httpstat.us/200?sleep=1000', {
                signal: signal
            }).then(function () {
                proclaim.isUndefined('Abort during fetch failed.');
            }, function (err) {
                proclaim.deepStrictEqual(err.name, 'AbortError');
                done();
            });
        });

        it('abort during fetch when Request has signal', function (done) {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            var controller = new AbortController();
            var signal = controller.signal;
            setTimeout(function () {
                controller.abort();
            }, 500);
            var request = new Request('https://httpstat.us/200?sleep=1000', {
                signal: signal
            });
            return fetch(request).then(function () {
                proclaim.isUndefined('Abort during fetch failed.');
            }, function (err) {
                proclaim.deepStrictEqual(err.name, 'AbortError');
                done();
            });
        });

        it('abort before fetch started', function (done) {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            var controller = new AbortController();
            controller.abort();
            var signal = controller.signal;
            return fetch('https://httpstat.us/200?sleep=1000', {
                signal: signal
            }).then(function () {
                proclaim.isUndefined('Abort during fetch failed.');
            }, function (err) {
                proclaim.deepStrictEqual(err.name, 'AbortError');
                done();
            });
        });

        // it('abort before fetch started, verify no HTTP request is made', function() {
        //   var server = http.createServer((req, res) => {
        //     fail('fetch() made an HTTP request despite pre-aborted signal');
        //   }).listen(0);
        //   var boundListenPort = server.address().port;
        //   browser.url(TESTPAGE_URL);
        //   var err = browser.executeAsync(async (boundListenPort, done) => {
        //     setTimeout(function() {
        //       done({name: 'fail'});
        //     }, 2000);
        //     var controller = new AbortController();
        //     controller.abort();
        //     var signal = controller.signal;
        //     try {
        //       await fetch('http://127.0.0.1:${boundListenPort}', {signal: signal});
        //       done({name: 'fail'});
        //     } catch (err) {
        //       done(err);
        //     }
        //   }, boundListenPort);
        //   expect(err.name).toBe('AbortError');
        //   server.close();
        // });

        it('fetch without aborting', function (done) {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            var controller = new AbortController();
            var signal = controller.signal;
            return fetch('https://httpstat.us/200?sleep=50', {
                signal: signal
            });
        });

        it('fetch without signal set', function () {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            return fetch('https://httpstat.us/200?sleep=50');
        });

        it('event listener fires "abort" event', function (done) {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            var controller = new AbortController();
            controller.signal.addEventListener('abort', function () {
                done();
            });
            controller.abort();
        });

        it('signal.aborted is true after abort', function (done) {
            setTimeout(function () {
                done('FAIL');
            }, 2000);
            var controller = new AbortController();
            controller.signal.addEventListener('abort', function () {
                proclaim.isTrue(controller.signal.aborted);
                done();
            });
            controller.abort();
            proclaim.isTrue(controller.signal.aborted);
        });

        it('event listener doesn\'t fire "abort" event after removeEventListener', function (done) {
            setTimeout(function () {
                done();
            }, 200);
            var controller = new AbortController();
            var handlerFunc = function () {
                done('FAIL');
            };
            controller.signal.addEventListener('abort', handlerFunc);
            controller.signal.removeEventListener('abort', handlerFunc);
            controller.abort();
        });

        it('signal.onabort called on abort', function (done) {
            setTimeout(function () {
                done('FAIL');
            }, 200);
            var controller = new AbortController();
            controller.signal.onabort = function () {
                done();
            };
            controller.abort();
        });

        it('toString() output', function () {
            proclaim.deepStrictEqual(new AbortController().toString(), '[object AbortController]');
            proclaim.deepStrictEqual(Object.prototype.toString.call(new AbortController()), '[object AbortController]');
            proclaim.deepStrictEqual(new AbortController().signal.toString(), '[object AbortSignal]');
        });
    });
});