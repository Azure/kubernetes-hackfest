require "sinatra"
require "sinatra/reloader" if :development?
require "mongo"

## Database values
DBURI = ENV["MONGOURI"]
DBOptions = {}
DBOptions[:user] = ENV["MONGOUSER"] if ENV["MONGOUSER"]
DBOptions[:password] = ENV["MONGOPWD"] if ENV["MONGOPWD"]
DBOptions[:database] = ENV["MONGODB"] if ENV["MONGODB"]
 # Note to self: bash "MONGODBSSL" value is only false if it is completely *NOT* set i.e. bash variable does not exist.  
 # Otherwise even a value of false returns true in ruby when grabbing from ENV ¯\_(ツ)_/¯
DBOptions[:ssl] = true if ENV["MONGODBSSL"]

# Cache Service values

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

get '/' do
  flights = DBClient[:flights].find().to_a.to_json
end

get '/healthprobe' do
  "Put this in your pipe and smoke it!"
end

get 'readinessprobe' do
  "Ready to go!"
end