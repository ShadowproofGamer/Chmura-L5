const form = document.getElementById('upload-form');
const fileList = document.getElementById('file-list');
const updateForm = document.getElementById('update-form');
const idField = document.getElementById('id-input');


updateForm.addEventListener('submit', (event)=>{
    event.preventDefault(); // Prevent default form submission
    const newFileName = document.getElementById('text-input').value;
    // Send the data using AJAX (Fetch API)
    console.log('http://localhost:3000/update/'+idField.value+'/'+newFileName);
    fetch('http://localhost:3000/update/'+idField.value+'/'+newFileName, {
        method: 'GET'
    }).then(response => response.json()) // Parse the response as JSON
        .then(data => {
            // Handle successful upload response and update the table
            console.log('update successful:', data);
            document.getElementById("name-"+idField.value).innerText = newFileName;
            updateForm.style.display = "none";


        }).catch(error => {
        console.error('update failed:', error); // Handle upload errors
    })
});

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
            newRow.id = "row-"+data.data.id
            newRow.innerHTML = `
      <td>${data.data.id}</td>
        <td id="name-${data.data.id}">${data.data.filename}</td>
      <td>
        <button class="btn btn-sm btn-warning edit-button" data-file-id="${data.data.id}" id="edit${data.data.id}">Modyfikuj</button>
        <button class="btn btn-sm btn-danger delete-button" data-file-id="${data.data.id}" id="delete${data.data.id}">Usuń</button>
        <button class="btn btn-sm btn-secondary download-button" data-file-id="${data.data.id}" id="download${data.data.id}">Pobierz</button>
      </td>
    `;
            fileList.appendChild(newRow);

            // Add event listeners for action buttons
            const editButton = newRow.querySelector('.edit-button');
            editButton.addEventListener('click', (event) => {
                const fileId = event.target.dataset.fileId;
                // Implement logic to handle editing a file based on fileId
                console.log('Edit button clicked for file:', fileId);
                // ... (Your edit functionality here)
                idField.value = fileId;
                updateForm.style.display = "block";
            });



            const deleteButton = newRow.querySelector('.delete-button');
            deleteButton.addEventListener('click', (event) => {
                const fileId = event.target.dataset.fileId;
                // Send a delete request to the backend with fileId
                console.log('Delete button clicked for file:', fileId);
                // ... (Your delete request logic here)
                fetch('http://localhost:3000/delete/'+fileId, {
                    method: 'GET'
                })
                    .then(r => {
                    document.getElementById("row-"+fileId).style.display = "hidden";
                })
            });

            const downloadButton = newRow.querySelector('.download-button');
            downloadButton.addEventListener('click', (event) => {
                const fileId = event.target.dataset.fileId;
                // Send a download request to the backend with fileId
                console.log('Download button clicked for file:', fileId);
                // ... (Your download request logic here)
                fetch('http://localhost:3000/getFile/'+fileId, {
                    method: 'GET'
                }).then(response => response.json())
                    .then(r => {
                    console.log(r);
                    downloadFileFromBuffer(r.data.Body.data, document.getElementById("name-"+fileId).textContent);

                })
            });

        })
        .catch(error => {
            console.error('Upload failed:', error); // Handle upload errors
        });
});


function downloadFileFromBuffer(buffer, filename, mimeType = 'application/octet-stream') {
    const arr = new Uint8Array(buffer);
    console.log(arr);
    // Create a Blob object from the buffer with the specified mimeType
    const blob = new Blob([buffer], { type: mimeType });

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');

    // Set the link's href attribute to the temporary URL
    link.href = url;

    // Set the link's download attribute to the desired filename
    link.download = filename;

    // Simulate a click on the link to trigger the download
    link.click();

    // Revoke the temporary URL to avoid memory leaks
    window.URL.revokeObjectURL(url);
}
