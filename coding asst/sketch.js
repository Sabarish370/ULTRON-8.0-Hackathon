let storedValue = '';  // This variable will store the textarea value

// Function to update the storedValue with textarea content
function updateStoredValue() {
  storedValue = document.getElementById('codeArea').value;
  document.getElementById('storedValue').innerText = storedValue; 
  // Displaying updated value on the page

  // Send the updated value to the server every time it's updated
  fetch('/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storedValue: storedValue })  // Send the storedValue as JSON
  })
  .then(response => response.json())
  .then(data => console.log('Server response:', data))
  .catch(error => console.error('Error:', error));
}

// Set an interval to update the storedValue every 3 seconds (3000ms)
setInterval(updateStoredValue, 5000);
