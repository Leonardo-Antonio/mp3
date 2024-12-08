package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func main() {

	mux := http.NewServeMux()
	// crea servidor de files
	mux.Handle("/playlist/", http.StripPrefix("/playlist/", http.FileServer(http.Dir("./music"))))
	mux.Handle("/mp3/", http.StripPrefix("/mp3/", http.FileServer(http.Dir("./public/mp3"))))

	mux.HandleFunc("/api/v1/playlist", method(func(w http.ResponseWriter, r *http.Request) {
		list, _ := os.ReadDir("./music")
		ps := []map[string]string{}
		for _, file := range list {
			ps = append(ps, map[string]string{"name": file.Name(), "url": "/playlist/" + file.Name()})
		}
		json.NewEncoder(w).Encode(ps)
	}, http.MethodGet))

	mux.HandleFunc("/upload", method(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, World upload!"))
	}, http.MethodPost))

	log.Println("Serving on port 8080", "http://localhost:8080")
	http.ListenAndServe(":8080", cors(mux))
}

func method(next func(w http.ResponseWriter, r *http.Request), method string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			w.WriteHeader(http.StatusMethodNotAllowed)
			json.NewEncoder(w).Encode(map[string]string{"error": "Method Not Allowed"})
			return
		}
		next(w, r)
	}
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		next.ServeHTTP(w, r)
	})
}
