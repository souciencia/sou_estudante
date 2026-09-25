package cursos

import "strconv"

func intToStr(value *int) string {
	if value == nil {
		return ""
	}
	return strconv.Itoa(*value)
}

func intToBool(value *int) bool {
	return value != nil && *value == 1
}
