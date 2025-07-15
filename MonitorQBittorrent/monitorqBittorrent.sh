#!/bin/bash

# Configuration
SCRIPT_DIR="/share/CACHEDEV1_DATA/.qpkg/qBittorrent"
QBITTORRENT_SCRIPT="$SCRIPT_DIR/qBittorrent.sh"
PIDF="/var/run/qBittorrent.pid"
PROCESS_NAME="qbittorrent-nox"
CHECK_INTERVAL=30
DEBUG_MODE=false  # Set to true to enable debug output

# Global variables for tracking uptime
CURRENT_PID=""
START_TIME=""
UPTIME_RESULT=""

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

# Function to print debug messages (only when DEBUG_MODE is enabled)
debug_log() {
    if [ "$DEBUG_MODE" = "true" ]; then
        print_status $BLUE "DEBUG: $1"
    fi
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

# Function to reset tracking when process is not found
reset_tracking() {
    CURRENT_PID=""
    START_TIME=""
    UPTIME_RESULT=""
}

# Function to calculate and update uptime tracking (modifies global variables)
update_uptime_tracking() {
    local pid=$1
    if [ -z "$pid" ]; then
        UPTIME_RESULT="Unknown"
        return 1
    fi
    
    # Check if this is a new PID or first time
    if [ "$CURRENT_PID" != "$pid" ]; then
        CURRENT_PID="$pid"
        START_TIME=$(date +%s)
        UPTIME_RESULT="0 seconds"
        return 0
    fi
    
    # Calculate uptime based on our tracked start time
    if [ -z "$START_TIME" ]; then
        START_TIME=$(date +%s)
        UPTIME_RESULT="0 seconds"
        return 0
    fi
    
    local current_time=$(date +%s)
    local uptime_seconds=$((current_time - START_TIME))
    
    # Debug: Add some logging to understand what's happening
    debug_log "PID=$pid, CURRENT_PID=$CURRENT_PID, current_time=$current_time, START_TIME=$START_TIME, uptime_seconds=$uptime_seconds"
    
    # Calculate days, hours, minutes, seconds
    local days=$((uptime_seconds / 86400))
    local hours=$(((uptime_seconds % 86400) / 3600))
    local minutes=$(((uptime_seconds % 3600) / 60))
    local seconds=$((uptime_seconds % 60))
    
    if [ $days -gt 0 ]; then
        UPTIME_RESULT="${days} days, ${hours} hours, ${minutes} minutes"
    elif [ $hours -gt 0 ]; then
        UPTIME_RESULT="${hours} hours, ${minutes} minutes"
    elif [ $minutes -gt 0 ]; then
        UPTIME_RESULT="${minutes} minutes, ${seconds} seconds"
    else
        UPTIME_RESULT="${seconds} seconds"
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
    debug_log "Before check - CURRENT_PID='$CURRENT_PID', START_TIME='$START_TIME'"
    
    pid=$(is_qbittorrent_running)
    
    if [ $? -eq 0 ]; then
        # qBittorrent is running
        debug_log "Found PID $pid, calling update_uptime_tracking"
        update_uptime_tracking "$pid"
        debug_log "After update_uptime_tracking - CURRENT_PID='$CURRENT_PID', START_TIME='$START_TIME'"
        
        print_status $GREEN "qBittorrent is running (PID: $pid) - Uptime: $UPTIME_RESULT"
    else
        # qBittorrent is not running
        reset_tracking
        print_status $RED "qBittorrent is not running - attempting to start..."
        start_qbittorrent
    fi
    
    sleep $CHECK_INTERVAL
done
