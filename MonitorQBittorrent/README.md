# qBittorrent Monitor Script

This script monitors qBittorrent status and automatically restarts it if it stops running.

## Files

- `qBittorrent.sh` - Original QNAP qBittorrent control script
- `monitorqBittorrent.sh` - Monitoring script that checks qBittorrent status every 30 seconds

## How to Use

1. **Transfer both scripts to your QNAP server**:
   ```bash
   scp qBittorrent.sh monitorqBittorrent.sh admin@your-qnap-ip:/path/to/your/directory/
   ```

2. **Make the scripts executable**:
   ```bash
   chmod +x qBittorrent.sh monitorqBittorrent.sh
   ```

3. **Run the monitoring script**:
   ```bash
   ./monitorqBittorrent.sh
   ```

4. **To run in background** (recommended):
   ```bash
   nohup ./monitorqBittorrent.sh > monitor.log 2>&1 &
   ```

## What the Monitor Does

- **Every 30 seconds**: Checks if qBittorrent is running
- **If running**: Displays uptime in a human-readable format (days, hours, minutes)
- **If not running**: Attempts to start qBittorrent using the original script
- **Colored output**: 
  - Green: qBittorrent is running
  - Red: qBittorrent is not running
  - Yellow: Attempting to start qBittorrent
  - Blue: Informational messages

## Example Output

```
[2024-01-15 10:30:15] Starting qBittorrent monitoring...
[2024-01-15 10:30:15] Checking every 30 seconds
[2024-01-15 10:30:15] qBittorrent script location: /path/to/qBittorrent.sh
[2024-01-15 10:30:15] PID file location: /var/run/qBittorrent.pid

[2024-01-15 10:30:15] qBittorrent is running (PID: 1234) - Uptime: 2 days, 5 hours, 30 minutes
[2024-01-15 10:30:45] qBittorrent is running (PID: 1234) - Uptime: 2 days, 5 hours, 30 minutes
[2024-01-15 10:31:15] qBittorrent is not running - attempting to start...
[2024-01-15 10:31:15] Attempting to start qBittorrent...
[2024-01-15 10:31:20] qBittorrent start command executed successfully
[2024-01-15 10:31:25] qBittorrent is now running (PID: 5678)
```

## Configuration

You can modify these variables in the script:
- `CHECK_INTERVAL`: How often to check (default: 30 seconds)
- `PIDF`: Location of the PID file (default: /var/run/qBittorrent.pid)
- `PROCESS_NAME`: Name of the qBittorrent process (default: qbittorrent-nox)

## Stopping the Monitor

To stop the monitoring script:
```bash
# Find the process ID
ps aux | grep monitorqBittorrent.sh

# Kill the process
kill <PID>
```

Or if running in foreground, simply press `Ctrl+C`.

## Notes

- The script automatically detects its own location and looks for `qBittorrent.sh` in the same directory
- It monitors qBittorrent by checking for the process name only (simplified and reliable)
- The uptime calculation uses internal tracking - starts counting when the process is first detected
- Process detection uses `ps aux | grep` to find the `qbittorrent-nox` process (compatible with QNAP systems)
- Uptime resets when the process PID changes (indicating a restart) 