#!/bin/bash
set -e
set -o pipefail

removePolicies=false
removePrometheus=false

function show_usage (){
  cat << EOF
Usage: $0 [--remove-all-calico-policy] [--remove-prometheus] [-h|--help]

--remove-all-calico-policy   Calico Cloud includes support for tiered network policy. If you have created tiered
  network policy, then downgrading from Calico Cloud to Calico will disable all tiers except for the 'default' tier,
  which may cause unexpected network behavior, especially if you make heavy use of the 'pass' function.
  By default, this downgrade script will remove the Calico Cloud tiers, and block if network policy is in any
  other tiers besides the default. Use this flag to remove policies in all tiers (including the default tier).

--remove-prometheus    The downgrade script is not able to tell if prometheus operator was already running
  when Calico Cloud was installed on a managed cluster. As such, to prevent accidentally removing a pre-installed
  prometheus operator, the downgrade script will not uninstall prometheus by default. If you did not have prometheus
  operator already running before installing Calico Cloud, then you likely want to pass the --remove-prometheus
  flag to remove it as part of the downgrade.
EOF
  return 0
}

while [ ! -z "$1" ]; do
  case $1 in
    --remove-all-calico-policy)
    removePolicies=true
    ;;
    --remove-prometheus)
    removePrometheus=true
    ;;
    -h| --help)
    show_usage
    exit 0
    ;;
    *)
    echo "Unknown argument"
    show_usage
    exit 0
    ;;
  esac
  shift
done

# Creates temp file in /tmp
OUTPUT_TMP=$(mktemp)
on_exit() {
  rm -f $OUTPUT_TMP
}
trap on_exit EXIT

version_check(){
  opImg=$(kubectl get deployment -n tigera-operator tigera-operator -o jsonpath="{.spec.template.spec.containers[?(@.name=='tigera-operator')].image}")
  imgVer=$(echo $opImg | cut -d':' -f2)

  verSplit=($(echo $imgVer | tr "." "\n"))
  if [ ${verSplit[0]} != "v1" ]; then
    echo "[ERROR] Operator image version ($imgVer) not recognized, cannot safely downgrade."
    exit 1
  fi
  if [ ${verSplit[1]} -le 20 ]; then
    echo "[ERROR] Downgrade of install with image ($opImg) not supported by this script,"
    echo "        fetch the previous version https://installer.calicocloud.io/manifests/v2.0.2/downgrade.sh"
    echo "        and try again."
    exit 1
  fi
}

tigera_check(){
  retries=${1}
  component=${2}
  for attempt in $(seq 0 ${retries}); do
    exit_code=0
    [ -z "${component}" ] && component="--all"
    kubectl wait --for condition=available tigerastatus ${component} --timeout=60s &> /dev/null || exit_code=$?
    if [[ "${exit_code}" == "0" || "${exit_code}" == "" ]]; then
      break
    elif [[ "${attempt}" == "${retries}" ]]; then
      echo [ERROR] Tigera uninstall failed. Please retry
      if [ "x--all" == "x${component}" ]; then
        kubectl get tigerastatus -o yaml
      else
        kubectl get tigerastatus ${component} -o yaml
      fi
      echo ""
      exit ${exit_code}
    else
      echo [WAIT] Tigera ${component} is Progressing
      sleep 15
    fi
  done
}

# kubectl_retry retries <args>
kubectl_retry() {
  RETRIES=$1
  shift 1

  for attempt in $(seq 0 ${RETRIES}); do
    exit_code=0
    kubectl $@ 1> $OUTPUT_TMP 2>/dev/null || exit_code=$?
    if [[ "${exit_code}" == "0" || "${exit_code}" == "" ]]; then
      cat $OUTPUT_TMP
      break
    elif [[ "${attempt}" == "${RETRIES}" ]]; then
      kubectl $@ || true
      echo [ERROR] Failed to kubectl $@
      exit ${exit_code}
    else
      sleep 5
    fi
  done
}

# kubectl_wait namespace type app condition timeout
kubectl_wait() {
  namespace=${1}
  type=${2}
  app=${3}
  condition=${4}
  timeout=${5}

  elapse=0
  exit_code=0
  while [ $elapse -lt $timeout ]; do
    t=$(($timeout - $elapse))
    if [ $t -gt 60 ]; then
      t=60
    fi
    kubectl wait --for=condition=$condition $type -l=k8s-app=$app -n $namespace --timeout=${t}s &> /dev/null && return 0
    echo [WAIT] Waiting on $app $type to be $condition
    elapse=$(($elapse + $t))
  done
  return 1
}

delete_tier_policies() {
  echo "Deleting policies in tier $1"
  # Delete networkpolicies.projectcalico.org with tier label
  kubectl_retry 3 delete networkpolicies.projectcalico.org -A -l projectcalico.org/tier=$1 >/dev/null
  # Delete globalnetworkpolicies.projectcalico.org with tier label
  kubectl_retry 3 delete globalnetworkpolicies.projectcalico.org -A -l projectcalico.org/tier=$1 >/dev/null
}

do_tier_policies_exist() {
  # Check networkpolicies.projectcalico.org with tier label
  if [ $(kubectl_retry 3 get networkpolicies.projectcalico.org -A -l projectcalico.org/tier=$1 --no-headers | wc -l) -gt 0 ]; then
    return 0
  fi
  # Check globalnetworkpolicies.projectcalico.org with tier label
  if [ $(kubectl_retry 3 get globalnetworkpolicies.projectcalico.org -A -l projectcalico.org/tier=$1 --no-headers | wc -l) -gt 0 ]; then
    return 0
  fi
  return 1
}

operator_crds=(
applicationlayers
amazoncloudintegrations
authentications
compliances
intrusiondetections
logcollectors
logstorages
managementclusters
managementclusterconnections
managers
monitors
)

installer_crds=(
installers
)

cloud_types=(
globalalerts
globalalerttemplates
globalreports
globalreporttypes
globalthreatfeeds
licensekeys
managedclusters
packetcaptures
remoteclusterconfigurations
stagedglobalnetworkpolicies
stagedkubernetesnetworkpolicies
stagednetworkpolicies
tiers
uisettings
uisettingsgroups
)

cloud_namespaces=(
tigera-prometheus
tigera-access
tigera-compliance
tigera-dex
tigera-elasticsearch
tigera-fluentd
tigera-guardian
tigera-intrusion-detection
tigera-kibana
tigera-license
tigera-manager
tigera-skraper
tigera-packetcapture
calico-cloud
)

cloud_clusterrolebindings=(
^tigera-license-updater$
^tigera-managed.*-binding$
^tigera-policy-recommendation$
^skraper$
^calico-cloud-proxy-rolebinding$
^calico-cloud-installer-rbac$
)
if [ "$removePrometheus" == "true" ]; then
  cloud_clusterrolebindings+=(calico-prometheus-operator)
fi

cloud_clusterroles=(
^tigera-license-updater$
^tigera-policy-recommendation$
^skraper$
^calico-cloud-proxy-role$
^calico-cloud-metrics-reader$
)
if [ "$removePrometheus" == "true" ]; then
  cloud_clusterroles+=(calico-prometheus-operator)
fi

operator_secrets=(
tigera-ee-ad-job-elasticsearch-access
tigera-ee-compliance-benchmarker-elasticsearch-access
tigera-ee-compliance-controller-elasticsearch-access
tigera-ee-compliance-reporter-elasticsearch-access
tigera-ee-compliance-snapshotter-elasticsearch-access
tigera-ee-installer-elasticsearch-access
tigera-ee-intrusion-detection-elasticsearch-access
tigera-eks-log-forwarder-elasticsearch-access
tigera-fluentd-elasticsearch-access
tigera-managed-cluster-connection
tigera-packetcapture-server-tls
tigera-secure-es-http-certs-public
tigera-secure-kb-http-certs-public
tigera-secure-es-gateway-http-certs-public
)

version_check

# Include the tigera-system/tigera-api because v3.projectcalico.org could exist with the open source apiserver
if [ $(kubectl_retry 3 get apiservices | grep -c "v3.projectcalico.org[[:space:]]*tigera-system/tigera-api") -eq 1 ]; then
  if [ "$removePolicies" == "true" ]; then
    echo "[INFO] Removing all Calico policy"
    # remove all policy except allow-tigera and tigera-security tiers which we do below
    tiers=($(kubectl_retry 3 get tiers.projectcalico.org --no-headers -o=custom-columns=Name:.metadata.name))
    i=${#tiers[@]}
    while [ $i -ge 0 ]; do
      tier=${tiers[$i]}
      if [[ "$tier" != "allow-tigera" && "$tier" != "tigera-security" && -n "$tier" ]]; then
        delete_tier_policies $tier
      fi
      i=$((i-1))
    done
  else
    echo "[INFO] Checking for Calico policy in non-default tiers"
    # check for tiered policy in tiers other than allow-tigera, tigera-security, and default, exit if any exist.
    tiers=($(kubectl_retry 3 get tiers.projectcalico.org --no-headers -o=custom-columns=Name:.metadata.name))
    i=0
    in_use_tiers=""
    while [ $i -lt "${#tiers[@]}" ]; do
      tier=${tiers[$i]}
      if [[ "$tier" != "allow-tigera" && "$tier" != "tigera-security" && "$tier" != "default" ]]; then
        if do_tier_policies_exist $tier; then
          in_use_tiers="$in_use_tiers $tier"
        fi
      fi
      i=$((i+1))
    done
    if [ -n "$in_use_tiers" ]; then
      echo "[INFO] Policies are in tier(s):"
      echo "            $in_use_tiers"
      echo "[WARN] Use the --remove-all-calico-policy flag to remove ALL Calico policies."
      echo "[WARN] Kubernetes NetworkPolicy will not be removed so you should be confident that you are not depending on"
      echo "[WARN] Calico policy allowing traffic that would be blocked by Kubernetes policy."
      exit 1
    fi
  fi

  # Remove policy in tigera-security tier
  delete_tier_policies tigera-security
  # Remove policy in allow-tigera tier
  delete_tier_policies allow-tigera
else
  echo "[INFO] Tigera API not available, not attempting to remove policies"
fi

# Get all CRDs
crds=$(kubectl_retry 3 get crds)

echo "[INFO] Removing Calico Cloud operator CRDs"
for i in "${operator_crds[@]}"; do
  # Remove Calico Cloud operator CRDs which will remove the CRs
  crd=$i.operator.tigera.io
  if echo -e "$crds" | grep $crd >/dev/null; then
    kubectl delete crd $crd &>/dev/null || kubectl delete crd $crd
  fi
done

echo "[INFO] Removing Calico Cloud installer CRDs"
for i in "${installer_crds[@]}"; do
  crd=$i.operator.calicocloud.io
  if echo -e "$crds" | grep $crd >/dev/null; then
    kubectl delete crd $crd &>/dev/null || kubectl delete crd $crd
  fi
done

echo "[INFO] Deleting Calico Cloud namespaces"
namespaces=$(kubectl_retry 3 get namespaces)
for i in "${cloud_namespaces[@]}"; do
  if echo -n "$namespaces" | grep $i >/dev/null; then
    kubectl delete ns $i &>/dev/null || kubectl delete ns $i || true
  fi
done

echo "[INFO] Restarting the operator"
# Restart the operator
kubectl -n tigera-operator rollout restart deployment tigera-operator &> /dev/null || true
kubectl -n tigera-operator rollout status deployment/tigera-operator &> /dev/null || true
kubectl_wait tigera-operator pod tigera-operator Ready 300

if [ -n "$(kubectl_retry 3 get installation default -o jsonpath='{.spec.imagePullSecrets}')" ]; then
  jpatch="[{'op': 'remove', 'path': '/spec/imagePullSecrets'}, {'op': 'replace', 'path': '/spec/variant', 'value': 'Calico'}]"
else
  jpatch="[{'op': 'replace', 'path': '/spec/variant', 'value': 'Calico'}]"
fi

echo "[INFO] Updating installation to Calico"
# Switch Variant to Calico - includes 1 retry
kubectl patch installations.operator.tigera.io default --type=json --patch "$jpatch" >/dev/null || \
  kubectl patch installations.operator.tigera.io default --type=json --patch "$jpatch"
i=1
while [ "Calico" != $(kubectl_retry 3 get installation default --output=go-template='{{.status.variant}}') ]; do
  if [ $((i%3)) -eq 0 ]; then
    echo "[INFO] Waiting for Installation resource status to have Calico variant"
  fi
  sleep 5
  i=$((i+1))
done
tigera_check 15 calico

# Sometimes these statuses are not being cleaned up so remove them explicitly
tigerastatus=(
log-collector
intrusion-detection
management-cluster-connection
monitor
)
for i in "${tigerastatus[@]}"; do
  if kubectl_retry 3 get tigerastatus | grep $i >/dev/null ; then
    kubectl delete tigerastatus $i &> /dev/null || kubectl delete tigerastatus $i || true
  fi
done

tigera_check 10

echo "[INFO] Removing Calico Cloud resource CRDs"
for i in "${cloud_types[@]}"; do
  # Remove Enterprise CRDs which will remove the CRs
  crd=$i.crd.projectcalico.org
  if echo -e "$crds" | grep $crd >/dev/null; then
    kubectl delete crd $crd &>/dev/null || kubectl delete crd $crd
  fi
done

echo "[INFO] Cleaning up Calico Cloud secrets"
secrets=$(kubectl_retry 3 get secret -n tigera-operator | grep -v -e operator-token -e pull-secret)
for i in "${operator_secrets[@]}"; do
  if echo -n "$secrets" | grep $i >/dev/null; then
    kubectl delete secret -n tigera-operator $i &>/dev/null || kubectl delete secret -n tigera-operator $i || true
  fi
done

echo "[INFO] Cleaning up Calico Cloud ClusterRoleBindings"
crbs="$(kubectl_retry 3 get clusterrolebinding --no-headers -o=custom-columns=Name:.metadata.name)"
for i in "${cloud_clusterrolebindings[@]}"; do
  existing=($(echo -n "$crbs" | grep $i 2>/dev/null || true))
  for x in "${existing[@]}"; do
    kubectl delete clusterrolebinding  $x &>/dev/null || kubectl delete clusterrolebinding $x || true
  done
done

echo "[INFO] Cleaning up Calico Cloud ClusterRoles"
crs="$(kubectl_retry 3 get clusterrole --no-headers -o=custom-columns=Name:.metadata.name)"
for i in "${cloud_clusterroles[@]}"; do
  existing=($(echo -n "$crs" | grep $i 2>/dev/null || true))
  for x in "${existing[@]}"; do
    kubectl delete clusterrole $x &>/dev/null || kubectl delete clusterrole $x || true
  done
done

if kubectl_retry 3 get jobs -n kube-system | grep tigera-check-cni-conf-job >/dev/null ; then
  kubectl delete jobs -n kube-system tigera-check-cni-conf-job &> /dev/null || kubectl delete jobs tigera-check-cni-conf-job || true
fi

if [ "$removePrometheus" == "true" ]; then
  echo "[INFO] Removing Prometheus resource CRDs"
  prometheus_types=(alertmanagerconfigs alertmanagers podmonitors probes prometheuses prometheusrules servicemonitors thanosrulers)
  for i in "${prometheus_types[@]}"; do
    if echo -e "$crds" | grep ${i}.monitoring.coreos.com >/dev/null; then
      kubectl delete crd ${i}.monitoring.coreos.com &>/dev/null || kubectl delete crd ${i}.monitoring.coreos.com
    fi
  done
else
  echo "[INFO] Prometheus custom resources not removed, only remove if you know they are not being used."
  echo "[INFO] Remove prometheus custom resources by passing '--remove-prometheus'."
fi
