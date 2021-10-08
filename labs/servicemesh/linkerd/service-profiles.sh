#! /bin/bash

kubectl create ns booksapp

curl -sL https://run.linkerd.io/booksapp.yml | kubectl -n booksapp apply -f -

kubectl -n booksapp port-forward svc/webapp 7000

kubectl get deploy -n booksapp -o yaml | linkerd inject - | kubectl apply -f -

curl -sL https://run.linkerd.io/booksapp/webapp.swagger | linkerd -n booksapp profile --open-api - webapp

curl -sL https://run.linkerd.io/booksapp/webapp.swagger | linkerd -n booksapp profile --open-api - webapp | kubectl -n booksapp apply -f -

curl -sL https://run.linkerd.io/booksapp/authors.swagger | linkerd -n booksapp profile --open-api - authors | kubectl -n booksapp apply -f -

curl -sL https://run.linkerd.io/booksapp/books.swagger | linkerd -n booksapp profile --open-api - books | kubectl -n booksapp apply -f -

linkerd viz -n booksapp routes svc/webapp

linkerd viz -n booksapp routes deploy/webapp --to svc/books

linkerd viz -n booksapp routes deploy/books --to svc/authors

kubectl -n booksapp edit sp/authors.booksapp.svc.cluster.local

linkerd viz -n booksapp routes deploy/books --to svc/authors -o wide

linkerd viz -n booksapp routes deploy/webapp --to svc/books

kubectl -n booksapp edit sp/books.booksapp.svc.cluster.local

linkerd viz -n booksapp routes deploy/webapp --to svc/books -o wide