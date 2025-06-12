# 📅 Calendar Generator - Cost Sharing App

A beautiful, modern web application designed for **cost-sharing scenarios** where people take turns over a period of time. Perfect for car wash sharing, cleaning services, equipment rentals, or any shared responsibility that needs fair cost distribution.

## ✨ Features

### 🎯 **Core Functionality**
- **Dynamic Calendar Generation** - Creates monthly calendar views with assigned names
- **Smart Cost Calculation** - Automatically calculates proportional costs based on assigned days
- **Flexible Spending Items** - Add multiple expense items with individual prices
- **Automatic Total Calculation** - Real-time total cost updates as you type

### 💾 **Data Management**
- **Auto-Save** - Automatically saves your data every time you generate a calendar
- **Auto-Load** - Restores your last session when you revisit the page
- **Manual Reset** - Clear saved data option with confirmation dialog
- **Browser Storage** - Uses localStorage for client-side data persistence

### 📸 **Export & Sharing**
- **Screenshot Capture** - One-click download of calendar and cost breakdown
- **High-Quality Images** - 2x scale for crisp, professional-looking exports
- **Ready to Share** - Perfect for sending via text, email, or social media

### 🎨 **User Experience**
- **Modern UI Design** - Beautiful gradient backgrounds and card-based layouts
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Interactive Elements** - Smooth hover effects and animations
- **Professional Styling** - Consistent color scheme and typography

## 🚀 Quick Start

### Installation
1. Clone or download the project files
2. No installation required - it's a pure client-side application!

### Usage
1. Open `index.html` in any modern web browser
2. Fill out the form:
   - **Start Date**: When your sharing period begins
   - **Number of Days**: How many days the period lasts
   - **Names**: Comma-separated list of participants
   - **Spending Items**: Add items with names and prices
3. Click **"Generate Calendar"**
4. Review the calendar and cost breakdown
5. Click **"📸 Capture & Download Image"** to save and share

## 📁 Project Structure

```
📦 Calendar Generator
├── 📄 index.html          # Main HTML structure
├── 🎨 styles.css          # All styling and responsive design
├── ⚙️ script.js           # Application logic and functionality
└── 📖 README.md           # This documentation
```

### File Organization
- **`index.html`** - Clean semantic HTML structure with external resource links
- **`styles.css`** - Organized CSS with sections for different components
- **`script.js`** - Modular JavaScript with clear functional sections

## 🛠️ How It Works

### Calendar Generation Algorithm
1. **Date Range Calculation** - Determines start and end dates for the period
2. **Name Rotation** - Cycles through participants in order for each day
3. **Monthly View Creation** - Generates calendar tables for each month in the range
4. **Day Assignment Tracking** - Counts how many days each person is assigned

### Cost Distribution Logic
1. **Proportional Calculation** - Each person pays based on their percentage of total days
2. **Precise Rounding** - Uses proper financial rounding to 2 decimal places
3. **Summary Generation** - Creates detailed breakdown tables

### Data Persistence
- **localStorage** stores form data as JSON
- **Automatic saving** on every calendar generation
- **Smart loading** recreates exact form state on page reload

## 💡 Use Cases

### 🚗 **Car Wash Sharing**
Perfect for groups who share car wash services and want to split costs fairly based on usage rotation.

### 🏠 **Cleaning Service Rotation**
Ideal for roommates or neighbors sharing cleaning services with rotating responsibility.

### 🔧 **Equipment Rental Sharing**
Great for sharing tools, equipment, or facility rentals where people take turns using them.

### 📊 **Any Time-Based Cost Sharing**
Flexible enough for any scenario where costs should be divided based on time periods.

## 🎨 Design Philosophy

### Modern & Professional
- Clean, card-based layout with subtle shadows
- Beautiful gradient backgrounds
- Consistent color scheme using blues and complementary colors

### User-Friendly
- Intuitive form flow from top to bottom
- Clear visual hierarchy with proper spacing
- Interactive elements with hover feedback

### Mobile-First
- Responsive design that adapts to all screen sizes
- Touch-friendly buttons and inputs
- Optimized layouts for mobile usage

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Semantic structure and modern form elements
- **CSS3** - Flexbox, gradients, animations, and responsive design
- **Vanilla JavaScript** - No frameworks, pure client-side functionality
- **html2canvas** - For screenshot capture functionality

### Browser Support
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Requires modern browser with localStorage support

### Performance
- **Lightweight** - No external frameworks or heavy dependencies
- **Fast Loading** - Minimal file sizes and optimized code
- **Client-Side Only** - No server required, works offline after first load

## 📈 Future Enhancements

### Potential Features
- **Export to PDF** - Alternative export format
- **Email Integration** - Direct sharing via email
- **Multiple Rotation Patterns** - Beyond simple sequential rotation
- **Calendar Import/Export** - Save/load different scenarios
- **Dark Mode** - Alternative color scheme
- **Multi-Language Support** - Internationalization

### Contributing
This is a self-contained project perfect for:
- Adding new features
- Improving the UI/UX
- Optimizing performance
- Adding new export formats

## 📄 License

Free to use for personal and commercial purposes. Feel free to modify and distribute.

## 🆘 Support

### Common Issues
1. **Calendar not generating?** - Make sure all required fields are filled
2. **Screenshot not working?** - Ensure you're using a modern browser
3. **Data not saving?** - Check that localStorage is enabled in your browser

### Troubleshooting
- Open browser developer tools (F12) and check the console for any error messages
- Try clearing browser cache and refreshing the page
- Ensure JavaScript is enabled in your browser

---

**Made with ❤️ for fair cost sharing and better group coordination!** 