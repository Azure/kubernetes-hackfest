#!/bin/bash

# Public IP address
IP="40.121.18.237"

# Name to associate with public IP address
DNSNAME=$UNIQUE_SUFFIX

# Get the resource-id of the public ip
PUBLICIPID=$(az network public-ip list --query "[?ipAddress!=null]|[?contains(ipAddress, '$IP')].[id]" --output tsv)

# Update public ip address with dns name
az network public-ip update --ids $PUBLICIPID --dns-name $DNSNAME
