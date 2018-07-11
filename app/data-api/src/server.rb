require "sinatra"
require "sinatra/reloader" if :development?
require "mongo"
require 'net/http'

## Database values
DBURI = ENV["MONGOURI"]
DBOptions = {}
DBOptions[:user] = ENV["MONGOUSER"] if ENV["MONGOUSER"]
DBOptions[:password] = ENV["MONGOPWD"] if ENV["MONGOPWD"]
DBOptions[:database] = ENV["MONGODB"] if ENV["MONGODB"]
 # Note to self: bash "MONGODBSSL" value is only false if it is completely *NOT* set i.e. bash variable does not exist.  
 # Otherwise even a value of false returns true in ruby when grabbing from ENV ¯\_(ツ)_/¯
DBOptions[:ssl] = true if ENV["MONGODBSSL"]

# Cache Server values
CACHESERVERPROTOCOL = ENV["CACHESERVERPROTOCOL"]
CACHESERVER=ENV["CACHESERVER"]
CACHESERVERPORT=ENV["CACHESERVERPORT"]

# Server values
HOSTADDRESS = ENV["HOSTADDRESS"] || "0.0.0.0"
HOSTPORT = ENV["HOSTPORT"] || "4567"

# Set Server Values
set :bind, HOSTADDRESS
set :port, HOSTPORT
set :server, "thin"

begin
  DBClient = Mongo::Client.new([DBURI], DBOptions)
  puts('Client Connection: ')
  puts(DBClient.cluster.inspect)
  puts('Collection Names: ')
  puts(DBClient.database.collection_names.inspect)
  puts('Connected!')
rescue StandardError => err
  puts('Error: ')
  puts(err)
end

get '/flights/country/:code' do
  key = request.path_info
  flights = DBClient[:flights].find().to_a.to_json

  updateCache(key, flights)
end

get '/healthprobe' do
  "Put this in your pipe and smoke it!"
end

get 'readinessprobe' do
  "Ready to go!"
end

def updateCache(key, jsonData)
  uri = URI(CACHESERVERPROTOCOL + CACHESERVER + ":" + CACHESERVERPORT + key)
  puts uri
  req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  req.body = jsonData
  
  res = Net::HTTP.start(uri.hostname, uri.port) do |http|
    http.request(req)
  end

  puts res
end