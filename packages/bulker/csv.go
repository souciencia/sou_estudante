package main

import (
	"encoding/csv"
	"io"
	"os"
	"strings"
)

type CSVReader struct {
	file      *os.File
	reader    *csv.Reader
	headerMap map[string]int
}

func NewCSVReader(filePath string) (*CSVReader, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}

	reader := csv.NewReader(file)
	reader.Comma = ';'
	reader.LazyQuotes = true

	headers, err := reader.Read()
	if err != nil {
		file.Close()
		return nil, err
	}

	headerMap := make(map[string]int)
	for i, h := range headers {
		headerMap[strings.TrimSpace(h)] = i
	}

	return &CSVReader{
		file:      file,
		reader:    reader,
		headerMap: headerMap,
	}, nil
}

func (c *CSVReader) ReadRecord() ([]string, error) {
	return c.reader.Read()
}

func (c *CSVReader) GetHeaderMap() map[string]int {
	return c.headerMap
}

func (c *CSVReader) Close() error {
	return c.file.Close()
}

func (c *CSVReader) IsEOF(err error) bool {
	return err == io.EOF
}
