// util

const cache = {}
exports.schedule = function (name, fn, delay) {
  const timer = cache[name]
  timer && clearTimeout(timer)
  cache[name] = setTimeout(function () {
    delete cache[name]
    fn()
  }, delay)
}
