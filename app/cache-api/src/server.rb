require "sinatra"
require "redis"

# Server values
HOSTADDRESS = ENV["HOSTADDRESS"] || "0.0.0.0"
HOSTPORT = ENV["HOSTPORT"] || "4567"

# Set Server Values
set :bind, HOSTADDRESS
set :port, HOSTPORT
set :server, "thin"

# Redis env vars
redis = Redis.new(host: "localhost", port: 6379, db: 15)

redis.set("mykey", "hello world")

value = redis.get("mykey")

puts value