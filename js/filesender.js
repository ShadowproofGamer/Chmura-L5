const form = document.getElementById('upload-form');

form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    // Prepare the data to send (using FormData)
    const formData = new FormData();
    formData.append('file', file);
    // console.log(formData.get('file'));
    // Send the data using AJAX (Fetch API)
    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json()) // Parse the response as JSON (optional)
        .then(data => {
            // Handle successful upload response (e.g., update table)
            console.log('Upload successful:', data); // Example for now
        })
        .catch(error => {
            console.error('Upload failed:', error); // Handle upload errors
        });
});
