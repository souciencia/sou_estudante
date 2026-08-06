package config

import "os"

type Config struct {
	ESURL      string
	ESAPIKey   string
	// ESUsername string
	// ESPassword string
	Port       string
}

func Load() *Config {
	return &Config{
		ESURL:      	getEnv("ES_URL", "http://localhost:9200"),
		ESAPIKey: 		os.Getenv("ES_APIKEY"),
		// ESUsername: 	os.Getenv("ES_USERNAME"),
		// ESPassword: 	os.Getenv("ES_PASSWORD"),
		Port:       	getEnv("PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
