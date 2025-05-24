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
        if (data.error) {
            results.textContent = `Hata: ${data.error}`;
            return;
        }

        // Display results
        results.innerHTML = `
            <img src="http://localhost:5000${data.image_url}" alt="Annotated Image" style="max-width:100%;border-radius:10px;margin-top:20px;">
            <p>${data.results.buildings.length} bina algılandı.</p>
            ${data.results.message ? `<p>${data.results.message}</p>` : ''}
        `;
    })
    .catch(error => {
        results.textContent = `Hata: ${error.message}`;
    });
}

// Save and delete map
function saveMap() {
    const maps = JSON.parse(localStorage.getItem('sectorMaps') || '[]');
    const newMap = {
        id: Date.now(),
        image: previewImage.src,
        name: fileName.textContent,
        size: fileSize.textContent,
        uploadDate: uploadDate.textContent
    };
    maps.push(newMap);
    localStorage.setItem('sectorMaps', JSON.stringify(maps));
    alert('Harita başarıyla kaydedildi!');
    loadSavedMaps();
    resetUpload();
}

function deleteMap() {
    if (confirm('Haritayı silmek istediğinizden emin misiniz?')) {
        resetUpload();
    }
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

function loadSavedMaps() {
    const mapsGrid = document.getElementById('savedMapsGrid');
    const maps = JSON.parse(localStorage.getItem('sectorMaps') || '[]');
    mapsGrid.innerHTML = '';
    if (maps.length === 0) {
        mapsGrid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:20px;">Henüz kaydedilmiş harita bulunmamaktadır.</div>';
        return;
    }
    maps.forEach(map => {
        const card = document.createElement('div');
        card.className = 'map-card';
        card.innerHTML = `
            <img src="${map.image}" alt="${map.name}">
            <div class="map-info">
                <h3>${map.name}</h3>
                <p class="map-date">Yüklenme: ${map.uploadDate}</p>
                <p>Boyut: ${map.size}</p>
            </div>
        `;
        mapsGrid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadSavedMaps);