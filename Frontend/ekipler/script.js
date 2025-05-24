document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    // Add event listener for the save button after DOM is loaded
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
});

function loadTeams() {
    const teamsGrid = document.querySelector('.teams-grid');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    // Örnek kartları temizle
    teamsGrid.innerHTML = '';
    
    if (teams.length === 0) {
        teamsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 20px;">Henüz kayıtlı ekip bulunmamaktadır.</div>';
        return;
    }

    teams.forEach(team => {
        const card = createTeamCard(team);
        teamsGrid.appendChild(card);
    });
}

function createTeamCard(team) {
    const card = document.createElement('div');
    card.className = `team-card ${team.teamStatus === 'busy' ? 'busy' : ''}`;
    
    // Durum sınıfını belirle
    const statusClass = {
        'aktif': 'status-active',
        'pasif': 'status-inactive',
        'tatil': 'status-inactive',
        'egitim': 'status-training',
        'busy': 'status-busy'
    }[team.teamStatus] || 'status-active';

    // Durum metnini belirle
    const statusText = {
        'aktif': 'Aktif',
        'pasif': 'Pasif',
        'tatil': 'Tatil',
        'egitim': 'Eğitimde',
        'busy': 'Görevde'
    }[team.teamStatus] || 'Aktif';

    // Kurum rozetini belirle
    const badgeClass = `badge-${team.organization}`;

    card.innerHTML = `
        <div class="team-header">
            <h3>${team.teamName}</h3>
            <span class="team-status ${statusClass}">${statusText}</span>
        </div>
        <div class="team-body">
            <div class="team-info">
                <span class="organization-badge ${badgeClass}">${team.organization.toUpperCase()}</span>
                <p><i class="fas fa-users"></i> ${team.members.length} Üye</p>
                <p><i class="fas fa-map-marker-alt"></i> ${team.location.city}, ${team.location.district}</p>
                <p><i class="fas fa-phone"></i> ${team.phone}</p>
            </div>
            <div class="team-location">
                <h4>${team.teamStatus === 'busy' ? 'Mevcut Görev' : 'Mevcut Konum'}</h4>
                ${team.teamStatus === 'busy' && team.currentTask ? 
                    `<p>Bina: ${team.currentTask.building}</p>
                     <p>Atanma: ${new Date(team.currentTask.assignedAt).toLocaleString()}</p>` :
                    `<p>Boşta - Görev Bekliyor</p>`
                }
            </div>
        </div>
        <div class="team-actions">
            <button class="btn-primary" onclick="showTeamDetails('${team.id}')">Detaylar</button>
            ${team.teamStatus === 'busy' ? 
                `<button class="btn-secondary" onclick="openTaskModal('${team.id}', 'update')">Görev Güncelle</button>` :
                `<button class="btn-secondary" onclick="openTaskModal('${team.id}', 'assign')">Görev Ata</button>`
            }
        </div>
    `;
    
    return card;
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
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // 5 saniye sonra otomatik kapanma
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Modal işlemleri
function showTeamDetails(teamId) {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const team = teams.find(t => t.id === parseInt(teamId));
    
    if (team) {
        const modal = document.getElementById('teamDetailModal');
        const content = document.getElementById('modalContent');
        
        content.innerHTML = `
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Genel Bilgiler</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <h4>Ekip Adı</h4>
                        <p>${team.teamName}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Kurum</h4>
                        <p>${team.organization.toUpperCase()}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Ekip Türü</h4>
                        <p>${team.teamType}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Durum</h4>
                        <span class="status-badge ${team.teamStatus}">${getStatusText(team.teamStatus)}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-users"></i> Ekip Üyeleri</h3>
                <div class="member-list">
                    ${team.members.map(member => `
                        <div class="member-card">
                            <h4>${member.name}</h4>
                            <p><i class="fas fa-user-tag"></i> ${member.role}</p>
                            ${member.phone ? `<p><i class="fas fa-phone"></i> ${member.phone}</p>` : ''}
                            ${member.experience ? `<p><i class="fas fa-clock"></i> ${member.experience} yıl tecrübe</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-tools"></i> Ekipmanlar</h3>
                <div class="equipment-list">
                    ${team.equipment.map(eq => `
                        <div class="equipment-card">
                            <h4>${eq.name}</h4>
                            <p><i class="fas fa-tag"></i> ${eq.type}</p>
                            <p><i class="fas fa-hashtag"></i> ${eq.quantity} adet</p>
                            <p><i class="fas fa-info-circle"></i> ${eq.status}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-map-marker-alt"></i> Konum Bilgileri</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <h4>Şehir</h4>
                        <p>${team.location.city}</p>
                    </div>
                    <div class="detail-item">
                        <h4>İlçe</h4>
                        <p>${team.location.district}</p>
                    </div>
                    ${team.location.address ? `
                        <div class="detail-item">
                            <h4>Adres</h4>
                            <p>${team.location.address}</p>
                        </div>
                    ` : ''}
                    ${team.location.coordinates ? `
                        <div class="detail-item">
                            <h4>Koordinatlar</h4>
                            <p>${team.location.coordinates}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${team.teamStatus === 'busy' && team.currentTask ? `
                <div class="detail-section">
                    <h3><i class="fas fa-tasks"></i> Mevcut Görev</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <h4>Görev Yeri</h4>
                            <p>${team.currentTask.building}</p>
                        </div>
                        <div class="detail-item">
                            <h4>Görev Başlangıcı</h4>
                            <p>${new Date(team.currentTask.assignedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
        
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('teamDetailModal');
    modal.style.display = 'none';
}

function getStatusText(status) {
    const statusMap = {
        'aktif': 'Aktif',
        'pasif': 'Pasif',
        'tatil': 'Tatil',
        'egitim': 'Eğitimde',
        'busy': 'Görevde'
    };
    return statusMap[status] || status;
}

// ----- Task Modal Functions -----
const taskModal = document.getElementById('taskModal');
const taskModalTitle = document.getElementById('taskModalTitle');
const buildingInput = document.getElementById('buildingInput');
const taskIdInput = document.getElementById('taskIdInput');

function openTaskModal(teamId, mode) {
    taskIdInput.value = teamId;
    if (mode === 'assign') {
        taskModalTitle.textContent = 'Görev Ata';
        buildingInput.value = ''; // Clear input for assignment
    } else if (mode === 'update') {
        taskModalTitle.textContent = 'Görev Güncelle';
        // Find the team and pre-fill the building input
        const teams = JSON.parse(localStorage.getItem('teams') || '[]');
        const team = teams.find(t => t.id === parseInt(teamId));
        if (team && team.currentTask) {
            buildingInput.value = team.currentTask.building;
        }
    }
    taskModal.style.display = 'flex';
}

function closeTaskModal() {
    taskModal.style.display = 'none';
}

function saveTask() {
    const teamId = parseInt(taskIdInput.value);
    const building = buildingInput.value.trim();
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const teamIndex = teams.findIndex(t => t.id === teamId);

    if (teamIndex !== -1 && building) {
        teams[teamIndex].currentTask = {
            building: building,
            assignedAt: new Date().toISOString()
        };
        // Determine status based on action/current status, default to 'busy'
        if (taskModalTitle.textContent === 'Görev Ata') {
            teams[teamIndex].teamStatus = 'busy';
        } else if (taskModalTitle.textContent === 'Görev Güncelle' && teams[teamIndex].teamStatus !== 'busy') {
            // If updating and status wasn't busy, assume it becomes busy
            teams[teamIndex].teamStatus = 'busy';
        }
        // If it was already busy and updating, keep it busy

        localStorage.setItem('teams', JSON.stringify(teams));
        loadTeams();
        showNotification(
            taskModalTitle.textContent === 'Görev Ata' ? 'Görev Atandı' : 'Görev Güncellendi',
            `${teams[teamIndex].teamName} ekibine/ekibinin görevi "${building}" başarıyla ${taskModalTitle.textContent === 'Görev Ata' ? 'atandı' : 'güncellendi'}.`,
            'success'
        );
        closeTaskModal();
    } else if (!building) {
        showNotification('Hata', 'Lütfen görev yapılacak bina adını girin.', 'error');
    }
}


// Modal dışına tıklandığında kapatma
document.getElementById('teamDetailModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Close task modal when clicking outside
document.getElementById('taskModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeTaskModal();
    }
});

// ESC tuşu ile modal kapatma
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal(); // Keep for detail modal
        closeTaskModal(); // Add for task modal
    }
});

// Filtreleme fonksiyonları
document.getElementById('organizationFilter').addEventListener('change', filterTeams);
document.getElementById('statusFilter').addEventListener('change', filterTeams);
document.getElementById('regionFilter').addEventListener('change', filterTeams);

function filterTeams() {
    const organization = document.getElementById('organizationFilter').value;
    const status = document.getElementById('statusFilter').value;
    const region = document.getElementById('regionFilter').value;

    const teams = document.querySelectorAll('.team-card');
    
    teams.forEach(team => {
        let show = true;
        
        if (organization && !team.querySelector('.organization-badge').classList.contains(`badge-${organization}`)) {
            show = false;
        }
        
        if (status && !team.querySelector('.team-status').classList.contains(`status-${status}`)) {
            show = false;
        }
        
        // Bölge filtresi için location bilgisini kontrol et
        if (region) {
            const location = team.querySelector('.team-location p').textContent.toLowerCase();
            if (!location.includes(region)) {
                show = false;
            }
        }

        team.style.display = show ? 'block' : 'none';
    });
} 