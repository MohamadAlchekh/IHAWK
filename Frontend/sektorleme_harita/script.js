// Drag & Drop and file input logic
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const uploadDate = document.getElementById('uploadDate');
const results = document.getElementById('results');

// Drag & Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('dragover');
}

function unhighlight(e) {
    dropZone.classList.remove('dragover');
}

dropZone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFileSelect, false);
dropZone.addEventListener('click', () => fileInput.click());

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.size > 10 * 1024 * 1024) {
            alert('Dosya boyutu 10MB\'dan büyük olamaz!');
            return;
        }
        if (!file.type.match('image.*')) {
            alert('Lütfen sadece resim dosyası yükleyin!');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            uploadDate.textContent = new Date().toLocaleString();
            imagePreview.style.display = 'block';
            uploadToBackend(file); // Send to backend
        }
        reader.readAsDataURL(file);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Backend upload
function uploadToBackend(file) {
    const formData = new FormData();
    formData.append('image', file);
    results.textContent = 'Analiz ediliyor...';

    fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Backend Response:', data); // Log JSON to console
        if (data.error) {
            results.textContent = `Hata: ${data.error}`;
            return;
        }

        // Translation mapping for labels
        const translations = {
            'Neighbourhood': 'Mahalle',
            'Urban design': 'Kentsel tasarım',
            'geological phenomenon': 'Jeolojik olay',
            "Bird's-eye view": 'Kuşbakışı görünüm',
            'Aerial photography': 'Hava fotoğrafçılığı',
            'Suburb': 'Banliyö',
            'Town square': 'Şehir meydanı',
            'Earthquake': 'Deprem',
            'Rubble': 'Enkaz'
        };

        // Create labels HTML with translations
        const labelsHTML = data.results.labels.map(label => {
            const turkishDescription = translations[label.description] || label.description;
            return `<div style="margin: 5px 0; padding: 8px; background: white; border-radius: 4px;">
                <strong>${turkishDescription}</strong>: ${label.score}
            </div>`;
        }).join('');

        // Display results with detailed object information
        results.innerHTML = `
            <img src="http://localhost:5000${data.image_url}" alt="Annotated Image" style="max-width:100%;border-radius:10px;margin-top:20px;">
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h3>Analiz Sonuçları:</h3>
                <p><strong>Algılanan Binalar:</strong> ${data.results.buildings.length}</p>
                <div style="margin-top: 15px;">
                    <h4>Algılanan Veriler (${data.results.labels.length}):</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${labelsHTML}
                    </div>
                </div>
                ${data.results.message ? `<p><strong>Mesaj:</strong> ${data.results.message}</p>` : ''}
            </div>
        `;
    })
    .catch(error => {
        results.textContent = `Hata: ${error.message}`;
        console.error('Fetch Error:', error); // Log errors
    });
}

function resetUpload() {
    previewImage.src = '';
    fileName.textContent = '';
    fileSize.textContent = '';
    uploadDate.textContent = '';
    imagePreview.style.display = 'none';
    fileInput.value = '';
    results.innerHTML = 'Henüz sonuç yok.';
}

// Remove all other functions and event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize any remaining functionality
});
