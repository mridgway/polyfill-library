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

    describe('basic tests', function () {

        it('AbortSignal constructor', function () {
            var signal = new AbortSignal();
            proclaim.isFalse(signal.aborted);
            proclaim.isNull(signal.onabort);
        });

        it('Request is patched', function () {
            var controller = new AbortController();
            var signal = controller.signal;
            var request = new Request('/', {
                signal: signal
            });
            proclaim.deepStrictEqual(request.signal, signal);
            proclaim.isTrue(Request.prototype.isPrototypeOf(request));
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
            var request = new Request('http://httpstat.us/200?sleep=1000', {
                signal: signal
            });
            fetch(request).then(function () {
                proclaim.isUndefined('abort during fetch when Request has signal failed');
            }, function (err) {
                proclaim.deepStrictEqual(err.name, 'AbortError');
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
            fetch('http://httpstat.us/200?sleep=1000', {
                signal: signal
            }).then(function () {
                proclaim.isUndefined('abort before fetch started failed');
            }, function (err) {
                proclaim.deepStrictEqual(err.name, 'AbortError');
            });
        });

        //   it('abort before fetch started, verify no HTTP request is made', function() {
        //     var server = http.createServer((req, res) => {
        //       fail('fetch() made an HTTP request despite pre-aborted signal');
        //     }).listen(0);
        //     var boundListenPort = server.address().port;
        //     browser.url(TESTPAGE_URL);
        //     var res = browser.executeAsync(async (boundListenPort, done) => {
        //       setTimeout(function() {
        //         done({name: 'fail'});
        //       }, 2000);
        //       var controller = new AbortController();
        //       controller.abort();
        //       var signal = controller.signal;
        //       try {
        //         await fetch(`http://127.0.0.1:${boundListenPort}`, {signal});
        //         done({name: 'fail'});
        //       } catch (err) {
        //         done(err);
        //       }
        //     }, boundListenPort);
        //     var err = res.value;
        //     expect(err.name).toBe('AbortError');
        //     expect(getJSErrors().length).toBe(0);
        //     server.close();
        //   });

        it('fetch without aborting', function (done) {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            var controller = new AbortController();
            var signal = controller.signal;
            fetch('http://httpstat.us/200?sleep=50', {
                signal: signal
            }).then(function () {
                done();
            }, function (err) {
                done(err);
            });
        });

        it('fetch without signal set', function (done) {
            setTimeout(function () {
                done({
                    name: 'fail'
                });
            }, 2000);
            fetch('http://httpstat.us/200?sleep=50').then(function () {
                done();

            }, function (err) {
                done(err);
            });
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
                if (controller.signal.aborted === true) {
                    done();
                } else {
                    done('FAIL');
                }
            });
            controller.abort();
            if (controller.signal.aborted !== true) {
                done('FAIL');
            }
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

        //   it('fetch from web worker works', function() {
        //     // Need to load from webserver because worker because security policy
        //     // prevents file:// pages from "loading arbitrary .js files" as workers.
        //     var server = http.createServer((req, res) => {
        //       if (req.url === '/') {
        //         // No need to load polyfill in main JS context, we're only gonna run it
        //         // inside the worker only
        //         res.end('');
        //       } else if (req.url === '/umd-polyfill.js') {
        //         res.end(fs.readFileSync(path.join(__dirname, '../dist/umd-polyfill.js')));
        //       } else if (req.url === '/web-worker.js') {
        //         res.end(fs.readFileSync(path.join(__dirname, 'web-worker.js')));
        //       }
        //     }).listen(0);
        //     var boundListenPort = server.address().port;

        //     browser.url(`http://127.0.0.1:${boundListenPort}`);
        //     var res = browser.executeAsync(async (done) => {
        //       setTimeout(function() {
        //         done('FAIL');
        //       }, 2000);
        //       var worker = new Worker('web-worker.js');
        //       worker.postMessage('run-test');
        //       worker.onmessage = (ev) => {
        //         var result = ev.data;
        //         done(result);
        //       };
        //     });
        //     expect(res.value).toBe('PASS');
        //     expect(getJSErrors().length).toBe(0);
        //     server.close();
        //   });

        it('toString() output', function () {
            proclaim.deepStrictEqual(new AbortController().toString(), '[object AbortSignal]');

            proclaim.deepStrictEqual(Object.prototype.toString.call(new AbortController()), '[object AbortSignal]');

            proclaim.deepStrictEqual(new AbortController().signal.toString(), '[object AbortSignal]');

            proclaim.deepStrictEqual(new AbortSignal().toString(), '[object AbortSignal]');

            proclaim.deepStrictEqual(Object.prototype.toString.call(new AbortSignal()), '[object AbortSignal]');
        });
    });
});