#!/bin/bash

# Red Alert 2 Yuri's Revenge Settings Modifier
# A robust bash script to modify game settings with proper INI parsing

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
SETTINGS_FILE="Rulesmd.ini"
BACKUP_DIR="backups"
LOG_FILE="modification_log.txt"
TEMP_DIR="temp"

# Data structures for storing parsed INI data
declare -A sections
declare -A section_names
declare -A unit_names
declare -A unit_strengths
declare -A unit_damages
declare -A unit_teleporters

# Function to display the header
display_header() {
    clear
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}║${WHITE}        Red Alert 2 Yuri's Revenge Settings Modifier         ${RED}║${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo
}

# Function to display the main menu
display_menu() {
    echo -e "${CYAN}Please select an option:${NC}"
    echo
    echo -e "${WHITE}1.${NC} ${GREEN}Randomly set the Strength of all units${NC}"
    echo -e "${WHITE}2.${NC} ${YELLOW}Randomly set the Damage of all weapons${NC} ${RED}(Coming Soon)${NC}"
    echo -e "${WHITE}3.${NC} ${BLUE}Randomly set 5 units to teleporter${NC} ${RED}(Coming Soon)${NC}"
    echo -e "${WHITE}4.${NC} ${PURPLE}Advanced options${NC}"
    echo -e "${WHITE}5.${NC} ${CYAN}Restore from backup${NC}"
    echo -e "${WHITE}6.${NC} ${WHITE}Exit${NC}"
    echo
    echo -e "${YELLOW}Enter your choice (1-6): ${NC}"
}

# Function to display advanced menu
display_advanced_menu() {
    echo -e "${CYAN}Advanced Options:${NC}"
    echo
    echo -e "${WHITE}1.${NC} ${GREEN}Find unit by name and show its properties${NC}"
    echo -e "${WHITE}2.${NC} ${YELLOW}Modify specific unit's strength${NC}"
    echo -e "${WHITE}3.${NC} ${BLUE}List all units with their current strengths${NC}"
    echo -e "${WHITE}4.${NC} ${PURPLE}Search units by strength range${NC}"
    echo -e "${WHITE}5.${NC} ${CYAN}Back to main menu${NC}"
    echo
    echo -e "${YELLOW}Enter your choice (1-5): ${NC}"
}

# Function to check if settings file exists
check_settings_file() {
    if [[ ! -f "$SETTINGS_FILE" ]]; then
        echo -e "${RED}Error: $SETTINGS_FILE not found in current directory!${NC}"
        echo -e "${YELLOW}Please make sure you're running this script in the directory containing Rulesmd.ini${NC}"
        exit 1
    fi
}

# Function to create backup
create_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/Rulesmd_backup_$timestamp.ini"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Copy the settings file to backup
    cp "$SETTINGS_FILE" "$backup_file"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✓ Backup created: $backup_file${NC}"
        echo "$(date): Backup created - $backup_file" >> "$LOG_FILE"
        return 0
    else
        echo -e "${RED}✗ Failed to create backup!${NC}"
        return 1
    fi
}

# Function to clean a line aggressively (handles corrupted files)
clean_line() {
    local line="$1"
    
    # Remove all problematic characters:
    # - \r (carriage return), \0 (null characters) 
    # - High-byte characters (> ASCII 127), Control characters
    local cleaned=$(echo "$line" | tr -d '\r\n\0' | sed 's/[^[:print:]]//g' | sed 's/[^\x00-\x7F]//g')
    
    # Remove leading/trailing whitespace
    cleaned=$(echo "$cleaned" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    echo "$cleaned"
}

# Function to parse INI file into data structures (ROBUST VERSION)
parse_ini_file() {
    echo -e "${YELLOW}Parsing INI file (robust mode for corrupted files)...${NC}"
    
    local current_section=""
    local line_number=0
    local cleaned_lines=0
    
    # Clear existing data
    sections=()
    section_names=()
    unit_names=()
    unit_strengths=()
    unit_damages=()
    unit_teleporters=()
    
    while IFS= read -r raw_line; do
        ((line_number++))
        
        # Clean the line aggressively
        local line=$(clean_line "$raw_line")
        
        # Count cleaned lines
        if [[ "$line" != "$raw_line" ]]; then
            ((cleaned_lines++))
        fi
        
        # Skip empty lines and comments (after cleaning)
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*\; ]]; then
            continue
        fi
        
        # Check for section headers [SectionName] with tolerant regex
        if [[ "$line" =~ ^\[([A-Za-z0-9_]+)\]$ ]] || [[ "$line" =~ ^\[([^]]+)\]$ ]]; then
            current_section="${BASH_REMATCH[1]}"
            sections["$current_section"]="$line_number"
            section_names["$line_number"]="$current_section"
            continue
        fi
        
        # Process key=value pairs with more tolerance
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            
            # Clean key and value
            key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            # Store in current section
            if [[ -n "$current_section" ]]; then
                sections["$current_section:$key"]="$value"
                
                # Special handling for unit properties
                if [[ "$key" == "Name" ]]; then
                    unit_names["$current_section"]="$value"
                elif [[ "$key" == "Strength" ]]; then
                    # Clean the strength value - extract only numbers
                    local clean_strength=$(echo "$value" | sed 's/[^0-9]//g')
                    if [[ -n "$clean_strength" ]]; then
                        unit_strengths["$current_section"]="$clean_strength"
                    fi
                elif [[ "$key" == "Damage" ]]; then
                    unit_damages["$current_section"]="$value"
                elif [[ "$key" == "Teleporter" ]]; then
                    unit_teleporters["$current_section"]="$value"
                fi
            fi
        fi
    done < "$SETTINGS_FILE"
    
    echo -e "${GREEN}✓ Parsed ${#sections[@]} properties from $line_number lines (cleaned $cleaned_lines corrupted lines)${NC}"
    echo -e "${GREEN}✓ Found ${#unit_strengths[@]} units with strength values${NC}"
}

# Function to generate random strength value
generate_random_strength() {
    local min_strength=25
    local max_strength=90000
    
    # Generate random number between min and max
    echo $((RANDOM % (max_strength - min_strength + 1) + min_strength))
}

# Function to find unit by name
find_unit_by_name() {
    echo -e "${CYAN}Enter unit name to search for: ${NC}"
    read -r search_name
    
    local found_units=()
    
    for section in "${!unit_names[@]}"; do
        local unit_name="${unit_names[$section]}"
        if [[ "$unit_name" =~ $search_name ]]; then
            found_units+=("$section")
        fi
    done
    
    if [[ ${#found_units[@]} -eq 0 ]]; then
        echo -e "${RED}No units found matching '$search_name'${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Found ${#found_units[@]} unit(s):${NC}"
    echo
    
    for section in "${found_units[@]}"; do
        local unit_name="${unit_names[$section]}"
        local strength="${unit_strengths[$section]:-N/A}"
        local damage="${unit_damages[$section]:-N/A}"
        local teleporter="${unit_teleporters[$section]:-N/A}"
        
        echo -e "${WHITE}Section:${NC} [$section]"
        echo -e "${WHITE}Name:${NC} $unit_name"
        echo -e "${WHITE}Strength:${NC} $strength"
        echo -e "${WHITE}Damage:${NC} $damage"
        echo -e "${WHITE}Teleporter:${NC} $teleporter"
        echo
    done
}

# Function to modify specific unit's strength
modify_specific_unit() {
    echo -e "${CYAN}Enter unit section name (e.g., E1, ADOG, ENGINEER): ${NC}"
    read -r section_name
    
    if [[ -z "${unit_strengths[$section_name]}" ]]; then
        echo -e "${RED}Unit '$section_name' not found or has no strength value${NC}"
        return 1
    fi
    
    local old_strength="${unit_strengths[$section_name]}"
    local new_strength=$(generate_random_strength)
    
    echo -e "${YELLOW}Modifying [$section_name] strength from $old_strength to $new_strength${NC}"
    
    # Create backup first
    if ! create_backup; then
        echo -e "${RED}Cannot proceed without backup. Aborting.${NC}"
        return 1
    fi
    
    # Update the file
    if update_unit_strength "$section_name" "$new_strength"; then
        echo -e "${GREEN}✓ Successfully modified [$section_name] strength!${NC}"
        echo "$(date): Modified specific unit [$section_name] strength from $old_strength to $new_strength" >> "$LOG_FILE"
    else
        echo -e "${RED}✗ Failed to modify unit strength${NC}"
    fi
}

# Function to update unit strength in file (handles corrupted format)
update_unit_strength() {
    local section="$1"
    local new_strength="$2"
    
    # Create temporary file
    local temp_file=$(mktemp)
    local in_section=false
    local modified=false
    
    while IFS= read -r raw_line; do
        # Clean the line for processing but keep original formatting for output
        local clean_line=$(clean_line "$raw_line")
        
        # Check for section headers with robust matching
        if [[ "$clean_line" =~ ^\[$section\]$ ]]; then
            in_section=true
            echo "$raw_line" >> "$temp_file"
        elif [[ "$clean_line" =~ ^\[.*\]$ ]]; then
            in_section=false
            echo "$raw_line" >> "$temp_file"
        elif [[ "$in_section" == true ]] && [[ "$clean_line" =~ ^Strength= ]]; then
            # Replace with clean new line (this will fix the corruption for this line)
            echo "Strength=$new_strength" >> "$temp_file"
            modified=true
        else
            echo "$raw_line" >> "$temp_file"
        fi
    done < "$SETTINGS_FILE"
    
    if [[ "$modified" == true ]]; then
        mv "$temp_file" "$SETTINGS_FILE"
        return 0
    else
        rm "$temp_file"
        return 1
    fi
}

# Function to list all units with their strengths
list_all_units() {
    echo -e "${CYAN}All units and their current strengths:${NC}"
    echo
    
    local count=0
    for section in "${!unit_strengths[@]}"; do
        local unit_name="${unit_names[$section]:-$section}"
        local strength="${unit_strengths[$section]}"
        
        printf "%-20s %-30s %s\n" "[$section]" "$unit_name" "$strength"
        ((count++))
    done
    
    echo
    echo -e "${GREEN}Total units with strength values: $count${NC}"
}

# Function to search units by strength range
search_by_strength_range() {
    echo -e "${CYAN}Enter minimum strength: ${NC}"
    read -r min_strength
    
    echo -e "${CYAN}Enter maximum strength: ${NC}"
    read -r max_strength
    
    if [[ ! "$min_strength" =~ ^[0-9]+$ ]] || [[ ! "$max_strength" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}Please enter valid numbers${NC}"
        return 1
    fi
    
    if [[ "$min_strength" -gt "$max_strength" ]]; then
        echo -e "${RED}Minimum strength cannot be greater than maximum strength${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Units with strength between $min_strength and $max_strength:${NC}"
    echo
    
    local found_count=0
    for section in "${!unit_strengths[@]}"; do
        local strength="${unit_strengths[$section]}"
        if [[ "$strength" -ge "$min_strength" ]] && [[ "$strength" -le "$max_strength" ]]; then
            local unit_name="${unit_names[$section]:-$section}"
            echo -e "${WHITE}•${NC} [$section] $unit_name: $strength"
            ((found_count++))
        fi
    done
    
    echo
    echo -e "${GREEN}Found $found_count unit(s) in range${NC}"
}

# Function to modify all unit strengths (advanced version)
modify_all_unit_strengths() {
    echo -e "${YELLOW}Modifying all unit strengths...${NC}"
    echo
    
    # Create backup first
    if ! create_backup; then
        echo -e "${RED}Cannot proceed without backup. Aborting.${NC}"
        return 1
    fi
    
    # Parse the file first
    parse_ini_file
    
    local modified_count=0
    local temp_file=$(mktemp)
    local in_unit_section=false
    local current_section=""
    
    echo -e "${CYAN}Processing units:${NC}"
    
    while IFS= read -r raw_line; do
        # Clean line for processing
        local clean_line=$(clean_line "$raw_line")
        
        # Check for section headers
        if [[ "$clean_line" =~ ^\[([^\]]+)\]$ ]]; then
            current_section="${BASH_REMATCH[1]}"
            in_unit_section=false
            
            # Check if this is a unit section (has strength value)
            if [[ -n "${unit_strengths[$current_section]}" ]]; then
                in_unit_section=true
            fi
            
            echo "$raw_line" >> "$temp_file"
        elif [[ "$in_unit_section" == true ]] && [[ "$clean_line" =~ ^Strength=([0-9]+) ]]; then
            local old_strength="${BASH_REMATCH[1]}"
            local new_strength=$(generate_random_strength)
            local new_line="Strength=$new_strength"
            
            # Write clean line (fixes corruption)
            echo "$new_line" >> "$temp_file"
            echo -e "  ${WHITE}•${NC} [$current_section] Changed Strength from ${RED}$old_strength${NC} to ${GREEN}$new_strength${NC}"
            ((modified_count++))
        else
            echo "$raw_line" >> "$temp_file"
        fi
    done < "$SETTINGS_FILE"
    
    # Replace original file with modified version
    mv "$temp_file" "$SETTINGS_FILE"
    
    echo
    echo -e "${GREEN}✓ Successfully modified $modified_count unit strength values!${NC}"
    echo "$(date): Modified $modified_count unit strengths" >> "$LOG_FILE"
    
    echo
    echo -e "${YELLOW}Press any key to continue...${NC}"
    read -n 1 -s
}

# Function to restore from backup
restore_from_backup() {
    echo -e "${CYAN}Available backups:${NC}"
    echo
    
    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        echo -e "${RED}No backups found.${NC}"
        echo
        echo -e "${YELLOW}Press any key to continue...${NC}"
        read -n 1 -s
        return
    fi
    
    # List backups with numbers
    local backups=($(ls -t "$BACKUP_DIR"/*.ini 2>/dev/null))
    local i=1
    
    for backup in "${backups[@]}"; do
        local filename=$(basename "$backup")
        local filedate=$(date -r "$backup" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || stat -c %y "$backup" 2>/dev/null || echo "Unknown date")
        echo -e "${WHITE}$i.${NC} $filename ${YELLOW}($filedate)${NC}"
        ((i++))
    done
    
    echo
    echo -e "${WHITE}0.${NC} Cancel"
    echo
    echo -e "${YELLOW}Select backup to restore (0-$((${#backups[@]})): ${NC}"
    
    read -r choice
    
    # Validate input
    if [[ ! "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -gt "${#backups[@]}" ]]; then
        echo -e "${RED}Invalid choice.${NC}"
        echo
        echo -e "${YELLOW}Press any key to continue...${NC}"
        read -n 1 -s
        return
    fi
    
    if [[ "$choice" -eq 0 ]]; then
        return
    fi
    
    # Restore selected backup
    local selected_backup="${backups[$((choice-1))]}"
    
    echo
    echo -e "${YELLOW}Restoring from: $(basename "$selected_backup")${NC}"
    
    if cp "$selected_backup" "$SETTINGS_FILE"; then
        echo -e "${GREEN}✓ Successfully restored from backup!${NC}"
        echo "$(date): Restored from backup - $(basename "$selected_backup")" >> "$LOG_FILE"
    else
        echo -e "${RED}✗ Failed to restore from backup!${NC}"
    fi
    
    echo
    echo -e "${YELLOW}Press any key to continue...${NC}"
    read -n 1 -s
}

# Function to handle invalid menu choice
invalid_choice() {
    echo -e "${RED}Invalid choice. Please select a valid option.${NC}"
    echo
    echo -e "${YELLOW}Press any key to continue...${NC}"
    read -n 1 -s
}

# Function for coming soon features
coming_soon() {
    echo -e "${YELLOW}This feature is coming soon!${NC}"
    echo -e "${CYAN}Stay tuned for future updates.${NC}"
    echo
    echo -e "${YELLOW}Press any key to continue...${NC}"
    read -n 1 -s
}

# Function to handle advanced menu
handle_advanced_menu() {
    while true; do
        display_header
        display_advanced_menu
        
        read -r choice
        
        case $choice in
            1)
                display_header
                find_unit_by_name
                echo
                echo -e "${YELLOW}Press any key to continue...${NC}"
                read -n 1 -s
                ;;
            2)
                display_header
                modify_specific_unit
                echo
                echo -e "${YELLOW}Press any key to continue...${NC}"
                read -n 1 -s
                ;;
            3)
                display_header
                list_all_units
                echo
                echo -e "${YELLOW}Press any key to continue...${NC}"
                read -n 1 -s
                ;;
            4)
                display_header
                search_by_strength_range
                echo
                echo -e "${YELLOW}Press any key to continue...${NC}"
                read -n 1 -s
                ;;
            5)
                return
                ;;
            *)
                invalid_choice
                ;;
        esac
    done
}

# Main program loop
main() {
    # Check if settings file exists
    check_settings_file
    
    # Create log file if it doesn't exist
    touch "$LOG_FILE"
    
    # Parse the INI file on startup
    parse_ini_file
    
    while true; do
        display_header
        display_menu
        
        read -r choice
        
        case $choice in
            1)
                display_header
                modify_all_unit_strengths
                # Re-parse after modification
                parse_ini_file
                ;;
            2)
                display_header
                coming_soon
                ;;
            3)
                display_header
                coming_soon
                ;;
            4)
                handle_advanced_menu
                ;;
            5)
                display_header
                restore_from_backup
                # Re-parse after restore
                parse_ini_file
                ;;
            6)
                echo -e "${GREEN}Thanks for using RA2 Settings Modifier!${NC}"
                echo -e "${CYAN}Happy gaming! 🎮${NC}"
                exit 0
                ;;
            *)
                invalid_choice
                ;;
        esac
    done
}

# Check if script is run with bash
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 