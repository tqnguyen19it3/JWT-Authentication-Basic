const redis = require('redis');
const redisClient = redis.createClient({
    port: 6379,
    host: '127.0.0.1'
});

redisClient.ping( (err, pong) => {
    console.log(pong);
});

redisClient.on("error", function(error) {
    console.error(error);
});

redisClient.on("connect", function(error) {
    console.error("redis connected");
});

redisClient.on("ready", function(error) {
    console.error("redis ready");
});

redisClient.on("end", function(error) {
    console.error("Redis end");
});

// redisClient.set("key", "value", redis.print);
// redisClient.get("key", redis.print);

module.exports = redisClient