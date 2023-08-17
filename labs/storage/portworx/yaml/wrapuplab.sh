#!/bin/bash

kubectl exec -it $PX_POD -n portworx -- /opt/pwx/bin/pxctl cluster options update --volume-expiration-minutes 0

kubectl delete -f busyboxpod.yaml -n sharedservice
kubectl delete -f sharedpvc.yaml -n sharedservice
kubectl delete ns sharedservice
kubectl delete -f mysql-app.yaml -n mysql
kubectl delete -f restoregrouppvc.yaml -n mysql
kubectl delete -f mysql-groupsnapshot.yaml -n mysql
kubectl delete -f mysql-restore-app.yaml -n mysql
kubectl delete -f mongo-snapshot.yaml
kubectl delete -f pxbbq-mongo-restore.yaml -n pxbbq
kubectl delete -f pxbbq-frontend.yaml -n pxbbq
kubectl delete ns pxbbq
kubectl delete ns mysql
kubectl delete pods --all
kubectl delete pvc --all

rm grafana-dashboard-config.yaml
rm grafana-datasource.yaml
rm portworx-cluster-dashboard.json
rm portworx-node-dashboard.json
rm portworx-volume-dashboard.json
rm portworx-performance-dashboard.json
rm portworx-etcd-dashboard.json
rm /tmp/grafana.yaml
kubectl delete -f autopilot-app.yaml -n pg1
kubectl delete -f autopilot-postgres.yaml -n pg1
kubectl delete -f autopilotrule.yaml
kubectl delete -f namespaces.yaml

kubectl delete -f pxbbq-frontend-tc.yaml
kubectl delete -f pxbbq-mongo-tc.yaml
kubectl delete ns trashcan

