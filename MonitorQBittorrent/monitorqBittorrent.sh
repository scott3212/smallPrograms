#!/bin/bash

# Configuration
SCRIPT_DIR="/share/CACHEDEV1_DATA/.qpkg/qBittorrent"
QBITTORRENT_SCRIPT="$SCRIPT_DIR/qBittorrent.sh"
PIDF="/var/run/qBittorrent.pid"
PROCESS_NAME="qbittorrent-nox"
CHECK_INTERVAL=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output with timestamp
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# Function to check if qBittorrent is running
is_qbittorrent_running() {
    # Check by process name using ps and grep
    local pid=$(ps aux 2>/dev/null | grep "$PROCESS_NAME" | grep -v grep | awk '{print $1}' | head -1)
    if [ -n "$pid" ]; then
        echo "$pid"
        return 0
    fi
    
    return 1
}

# Function to get process start time and calculate uptime
get_uptime() {
    local pid=$1
    if [ -z "$pid" ]; then
        return 1
    fi
    
    # Get process start time (this works on most Linux systems)
    local start_time
    if command -v stat >/dev/null 2>&1; then
        # Use stat on /proc/PID (more reliable)
        start_time=$(stat -c %Y /proc/$pid 2>/dev/null)
    elif command -v ps >/dev/null 2>&1; then
        # Fallback to ps command
        start_time=$(ps -o lstart= -p $pid 2>/dev/null | xargs -I {} date -d "{}" +%s 2>/dev/null)
    fi
    
    if [ -z "$start_time" ]; then
        echo "Unable to determine start time"
        return 1
    fi
    
    local current_time=$(date +%s)
    local uptime_seconds=$((current_time - start_time))
    
    # Calculate days, hours, minutes
    local days=$((uptime_seconds / 86400))
    local hours=$(((uptime_seconds % 86400) / 3600))
    local minutes=$(((uptime_seconds % 3600) / 60))
    
    if [ $days -gt 0 ]; then
        echo "${days} days, ${hours} hours, ${minutes} minutes"
    elif [ $hours -gt 0 ]; then
        echo "${hours} hours, ${minutes} minutes"
    else
        echo "${minutes} minutes"
    fi
}

# Function to start qBittorrent
start_qbittorrent() {
    print_status $YELLOW "Attempting to start qBittorrent..."
    
    if [ -f "$QBITTORRENT_SCRIPT" ]; then
        # Use the qBittorrent.sh script to start
        if bash "$QBITTORRENT_SCRIPT" start; then
            print_status $GREEN "qBittorrent start command executed successfully"
            sleep 5  # Give it time to start
            
            # Verify it actually started
            local pid=$(is_qbittorrent_running)
            if [ $? -eq 0 ]; then
                print_status $GREEN "qBittorrent is now running (PID: $pid)"
                return 0
            else
                print_status $RED "qBittorrent start command executed but process is not running"
                return 1
            fi
        else
            print_status $RED "Failed to execute qBittorrent start command"
            return 1
        fi
    else
        print_status $RED "qBittorrent.sh script not found at: $QBITTORRENT_SCRIPT"
        return 1
    fi
}

# Main monitoring loop
print_status $BLUE "Starting qBittorrent monitoring..."
print_status $BLUE "Checking every $CHECK_INTERVAL seconds"
print_status $BLUE "qBittorrent script location: $QBITTORRENT_SCRIPT"
print_status $BLUE "PID file location: $PIDF"
echo

while true; do
    pid=$(is_qbittorrent_running)
    
    if [ $? -eq 0 ]; then
        # qBittorrent is running
        uptime=$(get_uptime "$pid")
        if [ $? -eq 0 ]; then
            print_status $GREEN "qBittorrent is running (PID: $pid) - Uptime: $uptime"
        else
            print_status $GREEN "qBittorrent is running (PID: $pid) - Uptime: Unknown"
        fi
    else
        # qBittorrent is not running
        print_status $RED "qBittorrent is not running - attempting to start..."
        start_qbittorrent
    fi
    
    sleep $CHECK_INTERVAL
done
