#!/bin/bash

# Checkout the emojivoto deployments

linkerd viz stat deployment -n emojivoto

# Get stats for the web service

linkerd viz top -n emojivoto deploy/web

# Get stats for the voting service

linkerd viz top -n emojivoto deploy/voting

# Tap the traffic from web to voting

linkerd viz tap deployment/web -n emojivoto --to deployment/voting --path / | less

# Narrow down the tap results to our problematic api call

linkerd viz tap deployment/web -n emojivoto --to deployment/voting --path /emojivoto.v1.VotingService/VoteDoughnut | less

# Output the tap calls as json data so you can share it with the app developer

linkerd viz tap deployment/web -n emojivoto --to deployment/voting --path /emojivoto.v1.VotingService/VoteDoughnut -o json | less