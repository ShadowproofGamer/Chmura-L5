const form = document.getElementById('upload-form');
const fileList = document.getElementById('file-list');

form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    // Prepare the data to send (using FormData)
    const formData = new FormData();
    formData.append('file', file);

    // Send the data using AJAX (Fetch API)
    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            // Handle successful upload response and update the table
            console.log('Upload successful:', data);

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
      <td>${data.data.id}</td>
        <td>${data.data.filename}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-button" data-file-id="${data.data.id}">Modyfikuj</button>
        <button class="btn btn-sm btn-danger delete-button" data-file-id="${data.data.id}">Usuń</button>
        <button class="btn btn-sm btn-secondary download-button" data-file-id="${data.data.id}">Pobierz</button>
      </td>
    `;
            fileList.appendChild(newRow);

            // Add event listeners for action buttons (optional, see comments)
            // addEditButtonListeners();  // Call a function to add listeners
        })
        .catch(error => {
            console.error('Upload failed:', error); // Handle upload errors
        });
});

// Function to add event listeners for action buttons (optional)
function addEditButtonListeners() {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const fileId = event.target.dataset.fileId;
            // Implement logic to handle editing a file based on fileId
            console.log('Edit button clicked for file:', fileId);
        });
    });

    // Similar logic for delete and download buttons
}

// Call the function
