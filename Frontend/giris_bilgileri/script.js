function addMember() {
    const container = document.getElementById('membersContainer');
    const memberCount = container.children.length + 1;
    
    const memberGroup = document.createElement('div');
    memberGroup.className = 'member-group';
    memberGroup.innerHTML = `
        <div class="form-row">
            <label for="member${memberCount}Name" class="required">İsim</label>
            <input type="text" id="member${memberCount}Name" name="memberName[]" required>
        </div>
        <div class="form-row">
            <label for="member${memberCount}Role" class="required">Görev</label>
            <input type="text" id="member${memberCount}Role" name="memberRole[]" required>
        </div>
        <div class="form-row">
            <label for="member${memberCount}Phone">Telefon</label>
            <input type="tel" id="member${memberCount}Phone" name="memberPhone[]">
        </div>
        <div class="form-row">
            <label for="member${memberCount}Experience">Tecrübe (Yıl)</label>
            <input type="number" id="member${memberCount}Experience" name="memberExperience[]" min="0">
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Üyeyi Sil</button>
    `;
    
    container.appendChild(memberGroup);
}

function addEquipment() {
    const container = document.getElementById('equipmentContainer');
    const equipmentCount = container.children.length + 1;
    
    const equipmentGroup = document.createElement('div');
    equipmentGroup.className = 'equipment-group';
    equipmentGroup.innerHTML = `
        <div class="form-row">
            <label for="equipment${equipmentCount}Name" class="required">Ekipman Adı</label>
            <input type="text" id="equipment${equipmentCount}Name" name="equipmentName[]" required>
        </div>
        <div class="form-row">
            <label for="equipment${equipmentCount}Type" class="required">Ekipman Türü</label>
            <select id="equipment${equipmentCount}Type" name="equipmentType[]" required>
                <option value="">Seçiniz</option>
                <option value="drone">Drone</option>
                <option value="kamera">Kamera</option>
                <option value="haberleşme">Haberleşme Ekipmanı</option>
                <option value="arama">Arama Ekipmanı</n>
                <option value="kurtarma">Kurtarma Ekipmanı</option>
                <option value="diğer">Diğer</option>
            </select>
        </div>
        <div class="form-row">
            <label for="equipment${equipmentCount}Quantity" class="required">Miktar</label>
            <input type="number" id="equipment${equipmentCount}Quantity" name="equipmentQuantity[]" min="1" required>
        </div>
        <div class="form-row">
            <label for="equipment${equipmentCount}Status">Durum</label>
            <select id="equipment${equipmentCount}Status" name="equipmentStatus[]">
                <option value="aktif">Aktif</option>
                <option value="bakımda">Bakımda</option>
                <option value="yedek">Yedek</option>
            </select>
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Ekipmanı Sil</button>
    `;
    
    container.appendChild(equipmentGroup);
}

// Bildirim sistemi
function showNotification(title, message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon} notification-icon"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function showSuccessModal() {
    document.getElementById('successModalOverlay').style.display = 'block';
    document.getElementById('successModal').style.display = 'block';
}

function redirectToDashboard() {
    window.location.href = '../ekipler/index.html';
}

// Form gönderim işlemini güncelle
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Form verilerini topla
    const formData = new FormData(event.target);
    const teamData = {
        id: Date.now(),
        organization: formData.get('organization'),
        teamName: formData.get('teamName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        teamType: formData.get('teamType'),
        teamStatus: formData.get('teamStatus'),
        members: [],
        equipment: [],
        location: {
            city: formData.get('city'),
            district: formData.get('district'),
            address: formData.get('address'),
            coordinates: formData.get('coordinates')
        }
    };

    // Üye bilgilerini topla
    const memberGroups = document.querySelectorAll('.member-group');
    memberGroups.forEach(group => {
        const member = {
            name: group.querySelector('[name^="memberName"]').value,
            role: group.querySelector('[name^="memberRole"]').value,
            phone: group.querySelector('[name^="memberPhone"]').value,
            experience: group.querySelector('[name^="memberExperience"]').value
        };
        teamData.members.push(member);
    });

    // Ekipman bilgilerini topla
    const equipmentGroups = document.querySelectorAll('.equipment-group');
    equipmentGroups.forEach(group => {
        const equipment = {
            name: group.querySelector('[name^="equipmentName"]').value,
            type: group.querySelector('[name^="equipmentType"]').value,
            quantity: group.querySelector('[name^="equipmentQuantity"]').value,
            status: group.querySelector('[name^="equipmentStatus"]').value
        };
        teamData.equipment.push(equipment);
    });

    // Mevcut ekipleri al ve yeni ekibi ekle
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams.push(teamData);
    localStorage.setItem('teams', JSON.stringify(teams));

    // Başarılı kayıt modalını göster
    showSuccessModal();
    
    // 3 saniye sonra otomatik yönlendirme
    setTimeout(redirectToDashboard, 3000);
}

// Form submit olayını dinle
document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit); 