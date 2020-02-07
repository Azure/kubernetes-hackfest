# Bootstrap the Lab 

This script will allow you to jump ahead on labs 1, 2 and 3 if needed.

This setup will use an in-cluster MongoDB rather than Cosmos, and as such the data-api deployment will use an aligned manifest rather than trying to reuse the Helm charts. Service Tracker UI, Weather API, Flights API and Quakes API will all reuse the Helm charts used by the standard lab flow.

```bash
# Make sure the script is executable
chmod +x bootstrap.sh

# NOTE: If you hit service principal errors on the following, 
# try deleting ~/azure/aksServicePrincipal.json

## Run the script
# Lab 1
./bootstrap.sh -1

# Lab 2
./bootstrap.sh -2

# Lab 3
./bootstrap.sh -3

# All three
./bootstrap.sh -123

# Cleanup
./boostrap.sh -C
```