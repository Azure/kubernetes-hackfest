# Open Sky CronJob Microservice

This microservice will run as a recuring cronjob.  It's sole purpose is to communicate with the [Open Sky](https://opensky-network.org/apidoc/) flight data service, make the necessary data changes, then write to a message queue to trigger additional work on the new data.