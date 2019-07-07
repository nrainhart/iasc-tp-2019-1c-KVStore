
var map = new Map();

module.exports = {
    store: {
        get: function (key) {
            return map.get(key);
        },
        put: function (key, value) {
            map.set(key, value);
        }
    }
};