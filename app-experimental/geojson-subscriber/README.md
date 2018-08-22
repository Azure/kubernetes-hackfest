# GeoJSON Subscriber

This service subscribes to the ```'/flights/states/all'``` channel in our message queue (i.e. Redis), peforms some data transforms and then publishes the new formatted data to a new channel ```'/flights/currentflights'```.  That is all.