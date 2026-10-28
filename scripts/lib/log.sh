# Funções de log e estilização do terminal, compartilhadas pelos scripts.
# As cores são usadas por print_header/print_step e pelas rotinas.

readonly RESET='\033[0m'
readonly BOLD='\033[1m'
readonly TITLE_MAIN='\033[38;5;93m'
readonly CATEGORY_COLOR='\033[38;5;208m'
readonly CMD='\033[38;5;141m'
readonly MUTED='\033[38;5;242m'
readonly SUCCESS='\033[38;5;82m'
readonly WARNING='\033[38;5;220m'
readonly ERROR='\033[38;5;196m'

print_line() {
  printf '%b\n' "${BOLD}${TITLE_MAIN}=================================================================${RESET}"
}

print_header() {
  print_line
  printf '%b\n' "${BOLD}${TITLE_MAIN}  $1${RESET}"
  print_line
  echo
}

print_step() { printf '%b\n' "\n${BOLD}${CATEGORY_COLOR}▶ $1${RESET}"; }
log_info()    { printf '%b\n' "  ${MUTED}•${RESET} $1"; }
log_success() { printf '%b\n' "  ${SUCCESS}✔${RESET} $1"; }
log_warn()    { printf '%b\n' "  ${WARNING}!${RESET} $1"; }
log_error()   { printf '%b\n' "  ${ERROR}✘ ${RESET}$1" >&2; }

die() {
  log_error "$1"
  exit "${2:-1}"
}
