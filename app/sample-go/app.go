package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// PageVars : These values are used by consuming web pages.
type PageVars struct {
	Message  string
	Language string
}

var requestsCounter = prometheus.NewCounter(
	prometheus.CounterOpts{
		Name: "requests_counter_total",
		Help: "Total Requests Made.",
	},
)

func init() {
	// Metrics have to be registered to be exposed:
	prometheus.MustRegister(requestsCounter)
}

func main() {
	//client := appinsights.NewTelemetryClient(os.Getenv("APPINSIGHTS_INSTRUMENTATIONKEY"))
	//request := appinsights.NewRequestTelemetry("GET", "https://myapp.azurewebsites.net/", 1 , "Success")
	//client.Track(request)
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("css"))))
	http.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("img"))))
	http.Handle("/fonts/", http.StripPrefix("/fonts/", http.FileServer(http.Dir("fonts"))))
	http.HandleFunc("/", home)
	http.Handle("/metrics", promhttp.Handler())
	port := getPort()
	log.Printf("listening on port %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

func getPort() string {
	p := os.Getenv("HTTP_PLATFORM_PORT")
	if p != "" {
		return ":" + p
	}
	return ":8080"
}

func render(w http.ResponseWriter, tmpl string, pageVars PageVars) {

	tmpl = fmt.Sprintf("views/%s", tmpl)
	t, err := template.ParseFiles(tmpl)

	if err != nil { // if there is an error
		log.Print("template parsing error: ", err) // log it
	}

	err = t.Execute(w, pageVars) //execute the template and pass in the variables to fill the gaps

	if err != nil { // if there is an error
		log.Print("template executing error: ", err) //log it
	}
}

func home(w http.ResponseWriter, req *http.Request) {
	requestsCounter.Inc()
	pageVars := PageVars{
		Message:  "Success!",
		Language: "Go Lang",
	}
	render(w, "index.html", pageVars)
	log.Print("page rendering complete")
}
