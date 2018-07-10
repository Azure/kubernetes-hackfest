require 'sinatra'
require "sinatra/reloader" if :development?
require 'mongo'

set :bind, '0.0.0.0'
set :server, "thin"

DBURI = ENV["MONGOURI"]
DBOptions = {
  user: ENV["MONGOUSER"],
  password: ENV["MONGOPWD"],
  database: ENV["MONGODB"],
  ssl: true
}

begin
  DBClient = Mongo::Client.new([DBURI], DBOptions)
  puts('Client Connection: ')
  puts(DBClient.cluster.inspect)
  puts
  puts('Collection Names: ')
  puts(DBClient.database.collection_names.inspect)
  puts('Connected!')
rescue StandardError => err
  puts('Error: ')
  puts(err)
end

get '/' do
  flights = DBClient[:flights].find()
end

get '/healthprobe' do
  "Put this in your pipe and smoke it!"
end

get 'readinessprobe' do
  "Ready to go!"
end