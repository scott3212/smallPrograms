# Red Alert 2 Yuri's Revenge Settings Modifier

A bash script to randomly modify Red Alert 2: Yuri's Revenge game settings for enhanced and unpredictable gameplay experience.

## 🎮 Features

- **Menu-driven interface** with colorful, user-friendly UI
- **Automatic backup system** - never lose your original settings
- **Random unit strength modification** - make every unit unpredictably powerful or weak
- **Restore functionality** - easily revert to any previous backup
- **Cross-platform compatibility** - works on Windows (Git Bash) and Linux
- **Logging system** - track all modifications made

## 📋 Current Features

### ✅ Available Now
1. **Randomly set the Strength of all units** - Modifies the health/durability of all units with random values between 25-90000
2. **Advanced unit management** - Find units by name, modify specific units, list all units, search by strength range
3. **Robust file handling** - Automatically handles corrupted files with encoding issues
4. **Automatic backups** - Creates timestamped backups before every modification
5. **Restore functionality** - Easily revert to any previous backup

### 🚧 Coming Soon
6. **Randomly set the Damage of all weapons** - Modify weapon damage values
7. **Randomly set 5 units to teleporter** - Enable/disable teleporter ability on random units
8. **Advanced filtering options** - Filter by unit type, faction, etc.

## 🚀 Installation & Usage

### Prerequisites
- Red Alert 2: Yuri's Revenge installed
- Bash shell (Git Bash on Windows, or native bash on Linux)
- Access to the game's `Rulesmd.ini` file

### Setup
1. Copy your `Rulesmd.ini` file to the script directory
2. Make sure both files are in the same folder:
   ```
   RedAlert2YuriRandomSettings/
   ├── ra2_modifier.sh              # Main script (robust parsing)
   ├── run_modifier.bat             # Windows launcher
   ├── README.md                    # This documentation
   └── Rulesmd.ini                  # Your game settings file
   ```

### Running the Script

#### On Linux/Mac
```bash
cd /path/to/RedAlert2YuriRandomSettings
bash ra2_modifier.sh
```

#### On Windows (Git Bash)
```bash
cd /path/to/RedAlert2YuriRandomSettings
./ra2_modifier.sh
```

#### Alternative method (both platforms)
```bash
bash ra2_modifier.sh
```

#### Windows Easy Launch
Simply double-click `run_modifier.bat` - it will automatically find and launch Git Bash!

## 🎯 How It Works

### Main Script (`ra2_modifier.sh`)
- **Robust INI parsing** - understands the file structure and handles corrupted files
- **Data structures** - stores all unit information in memory
- **Advanced search capabilities** - find units by name, strength range, etc.
- **Targeted modifications** - modify specific units only
- **Better error handling** - more robust and reliable
- **Automatic file cleaning** - handles encoding issues and binary content

### Advanced Features Available

#### 1. **Find unit by name and show its properties**
- Search for units by partial name matching
- Display all properties (strength, damage, teleporter status)
- Example: Search for "GI" to find all GI-related units

#### 2. **Modify specific unit's strength**
- Target individual units by their section name
- Example: Modify only the "E1" (GI) unit's strength
- Useful for fine-tuning specific units

#### 3. **List all units with their current strengths**
- Complete overview of all units and their strength values
- Formatted table display
- Useful for understanding current game balance

#### 4. **Search units by strength range**
- Find units within specific strength ranges
- Example: Find all units with strength between 100-500
- Useful for identifying overpowered or underpowered units

### Menu Options

1. **Randomly set the Strength of all units**
   - Scans the entire `Rulesmd.ini` file
   - Finds all `Strength=` values
   - Replaces them with random values between 25-90000
   - Creates automatic backup before modification
   - Shows real-time progress of changes

2. **Restore from backup**
   - Lists all available backups with timestamps
   - Allows you to restore any previous version
   - Safely restores your game settings

### Safety Features

- **Automatic Backups**: Every modification creates a timestamped backup
- **Backup Management**: View and restore from multiple backup files
- **Input Validation**: Prevents invalid menu selections
- **Error Handling**: Graceful handling of missing files or failed operations
- **Activity Logging**: All actions are logged to `modification_log.txt`

## 📁 File Structure

After running the script, your directory will look like:

```
RedAlert2YuriRandomSettings/
├── ra2_modifier.sh              # Main script (robust parsing)
├── run_modifier.bat             # Windows launcher
├── README.md                    # Documentation
├── Rulesmd.ini                  # Modified settings file
├── modification_log.txt         # Activity log
└── backups/                     # Backup directory
    ├── Rulesmd_backup_20231201_143022.ini
    ├── Rulesmd_backup_20231201_144015.ini
    └── ...
```

## ⚠️ Important Notes

1. **Always backup your original `Rulesmd.ini`** before running the script
2. **Test modified settings** in skirmish mode before playing campaigns
3. **Some extreme values** might make the game unstable or unbalanced
4. **Restore from backup** if you encounter any issues
5. **The script modifies ALL units** - this includes infantry, vehicles, aircraft, and buildings
6. **Use the advanced script** for more precise control and better features

## 🔧 Customization

You can modify the script to change the random value ranges:

In the `generate_random_strength()` function:
```bash
local min_strength=25      # Minimum strength value
local max_strength=90000   # Maximum strength value
```

## 🐛 Troubleshooting

### Common Issues

1. **"Rulesmd.ini not found"**
   - Make sure the file is in the same directory as the script
   - Check the filename spelling (case-sensitive on Linux)

2. **"Permission denied"**
   - On Linux: Run `chmod +x ra2_modifier.sh`
   - On Windows: Use Git Bash or run with `bash ra2_modifier.sh`

3. **Script doesn't run**
   - Make sure you have bash installed
   - Try running with: `bash ra2_modifier.sh`

4. **Advanced features not working**
   - Use `ra2_modifier_advanced.sh` for advanced features
   - The basic script only supports simple modifications

### Getting Help

If you encounter issues:
1. Check the `modification_log.txt` file for error details
2. Ensure you have the correct `Rulesmd.ini` file from your RA2 installation
3. Try restoring from a backup if modifications cause problems
4. Use the advanced script for better error handling and features

## 🎲 Example Usage Session

```
$ bash ra2_modifier.sh

═══════════════════════════════════════════════════════════════
║    Red Alert 2 Yuri's Revenge Settings Modifier    ║
═══════════════════════════════════════════════════════════════

Parsing INI file (robust mode for corrupted files)...
✓ Parsed 500+ properties from 33731 lines (cleaned 33730 corrupted lines)
✓ Found 147+ units with strength values

Please select an option:

1. Randomly set the Strength of all units
2. Randomly set the Damage of all weapons (Coming Soon)
3. Randomly set 5 units to teleporter (Coming Soon)
4. Advanced options
5. Restore from backup
6. Exit

Enter your choice (1-6): 4

Advanced Options:

1. Find unit by name and show its properties
2. Modify specific unit's strength
3. List all units with their current strengths
4. Search units by strength range
5. Back to main menu

Enter your choice (1-5): 1

Enter unit name to search for: GI

Found 2 unit(s):

Section: [E1]
Name: GI
Strength: 125
Damage: N/A
Teleporter: N/A

Section: [GGI]
Name: Guardian GI
Strength: 100
Damage: N/A
Teleporter: N/A
```

## 🚀 Future Enhancements

- Weapon damage randomization
- Teleporter ability management
- Advanced filtering options (by unit type, faction, etc.)
- Configuration file for custom ranges
- Undo last operation
- Batch modification presets
- Export/import unit configurations
- Real-time game balance analysis
- Unit type categorization (Infantry, Vehicle, Aircraft, Building)
- Faction-specific modifications (Allied, Soviet, Yuri)

## 🔍 Advanced Usage Tips

1. **Search by unit names** to find specific units before modifying
2. **Check strength ranges** to identify unbalanced units
3. **Modify specific units** for fine-tuned gameplay changes
4. **Use backups** to experiment with different configurations
5. **The script handles corrupted files** - no need to worry about encoding issues

---

**Have fun creating chaos in the Red Alert 2 universe!** 🎮⚡ 