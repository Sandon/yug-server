// util

var cache = {}
exports.schedule = function (name, fn, delay) {
  var timer = cache[name]
  timer && clearTimeout(timer)
  cache[name] = setTimeout(function () {
    delete cache[name]
    fn()
  }, delay)
}
