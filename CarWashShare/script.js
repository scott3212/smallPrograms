// ===== GLOBAL VARIABLES =====
// Get form and calendar elements
const form = document.getElementById('calendar-form');
const calendar = document.getElementById('calendar');
const summary = document.getElementById('summary');

// ===== SPENDING ITEMS MANAGEMENT =====

// Function to add new spending item
function addSpendingItem() {
	const spendingItems = document.getElementById('spending-items');
	const newItem = document.createElement('div');
	newItem.className = 'spending-item';
	newItem.innerHTML = `
		<input type="text" class="item-name" placeholder="Item name" required>
		<input type="number" class="item-price" placeholder="Price" step="0.01" required>
		<button type="button" class="remove-item" onclick="removeSpendingItem(this)">Remove</button>
	`;
	spendingItems.appendChild(newItem);
	
	// Add event listener to new price input
	const priceInput = newItem.querySelector('.item-price');
	priceInput.addEventListener('input', updateTotal);
}

// Function to remove spending item
function removeSpendingItem(button) {
	const spendingItems = document.getElementById('spending-items');
	const items = spendingItems.querySelectorAll('.spending-item');
	
	// Only allow removal if more than one item exists
	if (items.length > 1) {
		button.parentElement.remove();
		updateTotal();
	} else {
		alert('At least one item is required.');
	}
}

// Function to calculate and update total cost
function updateTotal() {
	const priceInputs = document.querySelectorAll('.item-price');
	let total = 0;
	
	priceInputs.forEach(input => {
		const value = parseFloat(input.value) || 0;
		total += value;
	});
	
	document.getElementById('total-display').textContent = `Total Cost: $${total.toFixed(2)}`;
	return total;
}

// ===== LOCAL STORAGE FUNCTIONS =====

// Function to save form data to localStorage
function saveFormData() {
	const formData = {
		startDate: document.getElementById('start-date').value,
		numDays: document.getElementById('num-days').value,
		names: document.getElementById('names').value,
		spendingItems: []
	};
	
	// Collect all spending items
	const spendingItems = document.querySelectorAll('.spending-item');
	spendingItems.forEach(item => {
		const itemName = item.querySelector('.item-name').value;
		const itemPrice = item.querySelector('.item-price').value;
		if (itemName || itemPrice) { // Only save if there's some data
			formData.spendingItems.push({
				name: itemName,
				price: itemPrice
			});
		}
	});
	
	localStorage.setItem('calendarGeneratorData', JSON.stringify(formData));
	console.log('Form data saved to localStorage');
}

// Function to load form data from localStorage
function loadFormData() {
	const savedData = localStorage.getItem('calendarGeneratorData');
	if (savedData) {
		try {
			const formData = JSON.parse(savedData);
			
			// Load basic form fields
			document.getElementById('start-date').value = formData.startDate || '';
			document.getElementById('num-days').value = formData.numDays || '';
			document.getElementById('names').value = formData.names || '';
			
			// Load spending items
			if (formData.spendingItems && formData.spendingItems.length > 0) {
				// Clear existing spending items first
				const spendingContainer = document.getElementById('spending-items');
				spendingContainer.innerHTML = '';
				
				// Add each saved spending item
				formData.spendingItems.forEach((item, index) => {
					const spendingItem = document.createElement('div');
					spendingItem.className = 'spending-item';
					spendingItem.innerHTML = `
						<input type="text" class="item-name" placeholder="Item name" value="${item.name}" required>
						<input type="number" class="item-price" placeholder="Price" step="0.01" value="${item.price}" required>
						<button type="button" class="remove-item" onclick="removeSpendingItem(this)">Remove</button>
					`;
					spendingContainer.appendChild(spendingItem);
					
					// Add event listener to price input
					const priceInput = spendingItem.querySelector('.item-price');
					priceInput.addEventListener('input', updateTotal);
				});
				
				// Update total after loading
				updateTotal();
			}
			
			console.log('Form data loaded from localStorage');
		} catch (error) {
			console.error('Error loading saved data:', error);
		}
	}
}

// Function to clear saved data
function clearSavedData() {
	if (confirm('Are you sure you want to clear all saved data? This will reset the form.')) {
		localStorage.removeItem('calendarGeneratorData');
		
		// Reset form
		document.getElementById('start-date').value = '';
		document.getElementById('num-days').value = '';
		document.getElementById('names').value = '';
		
		// Reset spending items to just one empty item
		const spendingContainer = document.getElementById('spending-items');
		spendingContainer.innerHTML = `
			<div class="spending-item">
				<input type="text" class="item-name" placeholder="Item name" required>
				<input type="number" class="item-price" placeholder="Price" step="0.01" required>
				<button type="button" class="remove-item" onclick="removeSpendingItem(this)">Remove</button>
			</div>
		`;
		
		// Re-add event listener to the price input
		const priceInput = spendingContainer.querySelector('.item-price');
		priceInput.addEventListener('input', updateTotal);
		
		updateTotal();
		
		// Clear results and hide container
		document.getElementById('summary').innerHTML = '';
		document.getElementById('calendar').innerHTML = '';
		document.getElementById('results-container').style.display = 'none';
		document.getElementById('screenshot-section').style.display = 'none';
		
		alert('Saved data cleared successfully!');
	}
}

// ===== SUMMARY GENERATION =====

// Function to generate summary
function generateSummary(nameDict, totalCost) {
	let sum = 0;
	
	for (const key in nameDict) {
		if (nameDict.hasOwnProperty(key)) {
			sum += nameDict[key];
		}
	}
	
	// Generate spending items breakdown
	let summaryHtml = '<h2>Spending Items</h2><table><thead><tr><th>Item</th><th>Price</th></tr></thead><tbody>';
	const spendingItems = document.querySelectorAll('.spending-item');
	spendingItems.forEach(item => {
		const itemName = item.querySelector('.item-name').value || 'Unnamed Item';
		const itemPrice = parseFloat(item.querySelector('.item-price').value) || 0;
		summaryHtml += `<tr><td>${itemName}</td><td>$${itemPrice.toFixed(2)}</td></tr>`;
	});
	summaryHtml += `<tr style="font-weight: bold; background: #3498db; color: white;"><td>Total</td><td>$${totalCost.toFixed(2)}</td></tr>`;
	summaryHtml += '</tbody></table><br>';
	
	// Generate cost breakdown by person
	summaryHtml += '<h2>Cost Breakdown by Person</h2><table><thead><tr><th>Name</th><th>Days</th><th>Cost</th></tr></thead><tbody>'
	for (const name in nameDict) {
		if (nameDict.hasOwnProperty(name)) {
			let cost = (nameDict[name] / sum) * totalCost;
			cost = (Math.round(cost * 100) / 100).toFixed(2);
			summaryHtml += `<tr><td>${name}</td><td>${nameDict[name]}</td><td>$${cost}</td></tr>`;
		}
	}
	
	summaryHtml += '</tbody></table>';
	return summaryHtml;
}

// ===== CALENDAR GENERATION =====

// Function to generate calendar HTML
function generateCalendarHtml(startDate, endDate, names, nameDict) {
	console.log("startDate:" + startDate);
	console.log("endDate:" + endDate);
    let calendarHtml = '';
	let isFirstMonth = true;
	let isLastMonth = false;
	let nameIdx = 0;
	
    // Loop through each month
    for (let date = new Date(startDate.getFullYear(), startDate.getMonth(), 1); date <= endDate; date.setMonth(date.getMonth() + 1)) {
		console.log("processing Month:" + date);
		console.log("is date <= endDate?" + date <= endDate);
		if(new Date(date.getFullYear(), date.getMonth() + 1, 1) > endDate) {
			isLastMonth = true;
		}
	
        // Get month and year
        const month = date.toLocaleString('default', {
            month: 'long'
        });
        const year = date.getFullYear();

        // Generate month header
        calendarHtml += `<h2>${month} ${year}</h2>`;

        // Generate table header
        calendarHtml += '<table><thead><tr>';
        calendarHtml += '<th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>';
        calendarHtml += '</tr></thead><tbody>';

        // Get first day of the month
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

        // Generate table rows
		let dayOfMonth = startDate.getDate()+1;
		let firstDayOfMonthIndex = (startDate.getDay() + 1) % 7;
		if(!isFirstMonth) {
			dayOfMonth = 1;
			firstDayOfMonthIndex = firstDayOfMonth.getDay();
		}
		let lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		if(isLastMonth) {
			lastDayOfMonth = endDate.getDate();
		}
        while (dayOfMonth <= lastDayOfMonth) {
            calendarHtml += '<tr>';

            // Generate cells for each day of the week
            for (let i = 0; i < 7; i++) {
				// if firstMonth, then need to skip the first few days if the first day is not sunday
				if (isFirstMonth && i < firstDayOfMonthIndex) {
					calendarHtml += '<td></td>';
				} else if ((i >= firstDayOfMonthIndex || dayOfMonth > 1) && dayOfMonth <= lastDayOfMonth) {
					isFirstMonth = false;
					let currentName = names[nameIdx];
					calendarHtml += `<td>${dayOfMonth}<br>${currentName}</td>`;
					dayOfMonth++;
					nameDict[names[nameIdx]] = nameDict[names[nameIdx]] + 1;
					nameIdx = (nameIdx + 1) % (names.length);
                } else {
                    calendarHtml += '<td></td>';
                }
            }

            calendarHtml += '</tr>';
        }

        calendarHtml += '</tbody></table>';
    }

    return calendarHtml;
}

// ===== SCREENSHOT FUNCTIONALITY =====

// Function to capture screenshot of the results
async function captureScreenshot() {
	const captureBtn = document.getElementById('capture-btn');
	const originalText = captureBtn.innerHTML;
	
	// Show loading state
	captureBtn.innerHTML = '📸 Capturing...';
	captureBtn.disabled = true;
	
	try {
		// Create a container that includes both summary and calendar
		const summary = document.getElementById('summary');
		const calendar = document.getElementById('calendar');
		
		// Create a temporary container for screenshot
		const tempContainer = document.createElement('div');
		tempContainer.style.background = 'white';
		tempContainer.style.padding = '20px';
		tempContainer.style.borderRadius = '15px';
		tempContainer.style.position = 'absolute';
		tempContainer.style.left = '-9999px';
		tempContainer.style.top = '0';
		tempContainer.style.width = '800px';
		
		// Clone the summary and calendar content
		const summaryClone = summary.cloneNode(true);
		const calendarClone = calendar.cloneNode(true);
		
		tempContainer.appendChild(summaryClone);
		tempContainer.appendChild(calendarClone);
		document.body.appendChild(tempContainer);
		
		// Capture the screenshot
		const canvas = await html2canvas(tempContainer, {
			backgroundColor: '#ffffff',
			scale: 2, // Higher quality
			useCORS: true,
			allowTaint: true,
			width: 800,
			scrollX: 0,
			scrollY: 0
		});
		
		// Remove temporary container
		document.body.removeChild(tempContainer);
		
		// Create download link
		const link = document.createElement('a');
		link.download = `calendar-sharing-${new Date().toISOString().split('T')[0]}.png`;
		link.href = canvas.toDataURL();
		
		// Trigger download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		// Show success message
		captureBtn.innerHTML = '✅ Downloaded!';
		setTimeout(() => {
			captureBtn.innerHTML = originalText;
			captureBtn.disabled = false;
		}, 2000);
		
	} catch (error) {
		console.error('Error capturing screenshot:', error);
		captureBtn.innerHTML = '❌ Error occurred';
		setTimeout(() => {
			captureBtn.innerHTML = originalText;
			captureBtn.disabled = false;
		}, 2000);
	}
}

// ===== MAIN APPLICATION LOGIC =====

// Add submit event listener to form
form.addEventListener('submit', function(e) {
    e.preventDefault(); // prevent form from submitting

    // Get start date and number of days inputs
    const startDateInput = document.getElementById('start-date');
    const numDaysInput = document.getElementById('num-days');
	const names = document.getElementById('names').value.split(",");
	const totalCost = updateTotal(); // Get total from spending items
	
	// Save form data to localStorage
	saveFormData();
	let nameDict = {}
	for (const name of names) {
		nameDict[name] = 0;
	}

    // Parse input values
    const startDate = new Date(startDateInput.value);
    const numDays = parseInt(numDaysInput.value);

    // Calculate end date
    const endDate = new Date(startDate.getTime() + (numDays) * 24 * 60 * 60 * 1000);

    // Generate calendar
    const calendarHtml = generateCalendarHtml(startDate, endDate, names, nameDict);
    calendar.innerHTML = calendarHtml;
	
	// Generate summary
	const summaryHtml = generateSummary(nameDict, totalCost);
	summary.innerHTML = summaryHtml;
	
	// Show results container and screenshot button
	document.getElementById('results-container').style.display = 'block';
	document.getElementById('screenshot-section').style.display = 'block';
	
	console.log(nameDict);
});

// ===== INITIALIZATION =====

// Add event listeners to existing price inputs on page load
document.addEventListener('DOMContentLoaded', function() {
	// Load saved data first
	loadFormData();
	
	// Then add event listeners to any existing price inputs
	const priceInputs = document.querySelectorAll('.item-price');
	priceInputs.forEach(input => {
		input.addEventListener('input', updateTotal);
	});
}); 