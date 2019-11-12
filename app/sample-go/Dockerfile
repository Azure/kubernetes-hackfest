# build stage
FROM golang:1.13.1 AS build-env
WORKDIR /go/src/app
ADD . .
RUN go get -d -v
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# final stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app/
COPY --from=build-env /go/src/app/main .
COPY --from=build-env /go/src/app/css/. ./css/
COPY --from=build-env /go/src/app/fonts/. ./fonts/
COPY --from=build-env /go/src/app/img/. ./img/
COPY --from=build-env /go/src/app/views/. ./views/
EXPOSE 8080
CMD ["./main"]