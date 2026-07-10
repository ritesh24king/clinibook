// --- GLOBAL STATE ---
let currentUser = null;
let authToken = null; // JWT-token van de ingelogde gebruiker
const API_URL = ''; // Local relative API URL
let activeTelemedDocId = ''; // Selected Doctor in chat sidebar
let activeInsPatientId = ''; // Selected Patient in insurance sidebar
let callTimerInterval = null; // Calling timer
let notifications = []; // Active alerts array

// --- DOM ELEMENTS ---
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app-container');

// Toast-meldingen (was in de oorspronkelijke code nooit gedeclareerd —
// hierdoor crashte elke aanroep van showToast() met "toastMessage is not
// defined", wat op zijn beurt andere functies kon laten afbreken)
const toastNotification = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');

// Forms
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');

const registerForm = document.getElementById('register-form');
const regNameInput = document.getElementById('reg-name-input');
const regEmailInput = document.getElementById('reg-email-input');
const regPasswordInput = document.getElementById('reg-password-input');
const regPasswordConfirmInput = document.getElementById('reg-password-confirm-input');
const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');
const demoHelperBox = document.getElementById('demo-helper-box');

// Navs
const patientNav = document.getElementById('patient-nav');
const doctorNav = document.getElementById('doctor-nav');
const insuranceNav = document.getElementById('insurance-nav');
const userDisplayName = document.getElementById('user-display-name');
const userDisplayRole = document.getElementById('user-display-role');
const btnLogout = document.getElementById('btn-logout');

// Bell Notifications Center
const bellWrapper = document.getElementById('bell-wrapper');
const btnBell = document.getElementById('btn-bell');
const bellBadge = document.getElementById('bell-badge');
const bellDropdown = document.getElementById('bell-dropdown');
const bellNotificationsList = document.getElementById('bell-notifications-list');
const btnClearNotifications = document.getElementById('btn-clear-notifications');

// Navigation Tabs
const navDash = document.getElementById('nav-dash');
const navAfspraak = document.getElementById('nav-afspraak');
const navTelemed = document.getElementById('nav-telemed');
const navDocDash = document.getElementById('nav-doc-dash');
const navDocInbox = document.getElementById('nav-doc-inbox');
const navDocRx = document.getElementById('nav-doc-rx');
const navDocAdmin = document.getElementById('nav-doc-admin');
const navInsDash = document.getElementById('nav-ins-dash');

// Views
const viewDashboard = document.getElementById('view-dashboard');
const viewAfspraak = document.getElementById('view-afspraak');
const viewTelemed = document.getElementById('view-telemed');
const viewDocDashboard = document.getElementById('view-doc-dashboard');
const viewDocInbox = document.getElementById('view-doc-inbox');
const viewDocRx = document.getElementById('view-doc-rx');
const viewDocAdmin = document.getElementById('view-doc-admin');
const viewInsDashboard = document.getElementById('view-ins-dashboard');

// Booking Controls
const selectClinic = document.getElementById('select-clinic');
const selectDoctor = document.getElementById('select-doctor');
const appointmentDate = document.getElementById('appointment-date');
const slotsGrid = document.getElementById('slots-grid');
const selectedTimeslotInput = document.getElementById('selected-timeslot');
const appointmentForm = document.getElementById('appointment-form');

// Patient Dash
const welcomeName = document.getElementById('welcome-name');
const statPatientApts = document.getElementById('stat-patient-apts');
const statPatientRx = document.getElementById('stat-patient-rx');
const statPatientClinics = document.getElementById('stat-patient-clinics');
const patientTimeline = document.getElementById('patient-timeline');
const prescriptionsList = document.getElementById('prescriptions-list');

// Doctor Dash
const statDocPending = document.getElementById('stat-doc-pending');
const statDocApproved = document.getElementById('stat-doc-approved');
const statDocDoctors = document.getElementById('stat-doc-doctors');
const statDocPrescriptions = document.getElementById('stat-doc-prescriptions');
const clinicLoadTable = document.getElementById('clinic-load-table').querySelector('tbody');
const doctorLoadTable = document.getElementById('doctor-load-table').querySelector('tbody');

// Doctor Inbox
const incomingAppointmentsTable = document.getElementById('incoming-appointments-table').querySelector('tbody');
const badgeInboxCount = document.getElementById('badge-inbox-count');

// Doctor RX Form (Extended)
const rxSelectPatient = document.getElementById('rx-select-patient');
const rxMedication = document.getElementById('rx-medication');
const rxDosage = document.getElementById('rx-dosage');
const rxInstructions = document.getElementById('rx-instructions');
const rxValidity = document.getElementById('rx-validity');
const rxPhotoUpload = document.getElementById('rx-photo-upload');
const prescriptionForm = document.getElementById('prescription-form');

// Admin additions
const addClinicForm = document.getElementById('add-clinic-form');
const addDoctorForm = document.getElementById('add-doctor-form');
const newDocClinic = document.getElementById('new-doc-clinic');
const addPharmacyForm = document.getElementById('add-pharmacy-form');

// Notification preferences
const preferencesForm = document.getElementById('preferences-form');
const prefEmail = document.getElementById('pref-email');
const prefSms = document.getElementById('pref-sms');
const prefPush = document.getElementById('pref-push');
const prefTime = document.getElementById('pref-time');

// Insurer workspace
const insPatientList = document.getElementById('ins-patient-list');
const insDossierWorkspace = document.getElementById('ins-dossier-workspace');
const insDossierContent = document.getElementById('ins-dossier-content');
const insPromptSelect = document.getElementById('ins-prompt-select');
const insPatientName = document.getElementById('ins-patient-name');
const insPatientEmail = document.getElementById('ins-patient-email');
const insTimelineView = document.getElementById('ins-timeline-view');
const insDossierNotesList = document.getElementById('ins-dossier-notes-list');
const addDossierNoteForm = document.getElementById('add-dossier-note-form');
const newDossierNote = document.getElementById('new-dossier-note');
const storageBar = document.getElementById('storage-bar');
const storageUtilizationText = document.getElementById('storage-utilization-text');

// Telemedicine UI panels
const doctorChatsList = document.getElementById('doctor-chats-list');
const telemedWorkspace = document.getElementById('telemed-workspace');
const telemedPromptSelect = document.getElementById('telemed-prompt-select');
const telemedDocName = document.getElementById('telemed-doc-name');
const telemedDocSpecialty = document.getElementById('telemed-doc-specialty');
const btnAudioCall = document.getElementById('btn-audio-call');
const btnVideoCall = document.getElementById('btn-video-call');

// Workspace Subtabs
const tabChatLink = document.getElementById('tab-chat-link');
const tabQaLink = document.getElementById('tab-qa-link');
const paneChat = document.getElementById('pane-chat');
const paneQa = document.getElementById('pane-qa');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatMessageForm = document.getElementById('chat-message-form');
const chatTextInput = document.getElementById('chat-text-input');
const qaQuestionForm = document.getElementById('qa-question-form');
const qaQuestionText = document.getElementById('qa-question-text');
const qaList = document.getElementById('qa-list');

// Call simulation
const callOverlay = document.getElementById('call-overlay');
const callDoctorTitle = document.getElementById('call-doctor-title');
const callStatusLabel = document.getElementById('call-status-label');
const callTimer = document.getElementById('call-timer');
const videoFeedsContainer = document.getElementById('video-feeds-container');
const localWebcamVideo = document.getElementById('local-webcam');
const btnHangup = document.getElementById('btn-hangup');

// Modals
const approveModal = document.getElementById('approve-modal');
const modalPatientName = document.getElementById('modal-patient-name');
const modalReportText = document.getElementById('modal-report-text');
const modalAptId = document.getElementById('modal-apt-id');
const btnModalConfirm = document.getElementById('btn-modal-confirm');

const imageModal = document.getElementById('image-modal');
const modalPreviewImg = document.getElementById('modal-preview-img');

const forwardModal = document.getElementById('forward-modal');
const forwardSelectPharmacy = document.getElementById('forward-select-pharmacy');
const forwardRxId = document.getElementById('forward-rx-id');
const btnForwardSubmit = document.getElementById('btn-forward-submit');

const storageModal = document.getElementById('storage-modal');


// ==================== HELPER FUNCTIONS ====================

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toastNotification.classList.remove('hidden');
    toastNotification.style.borderLeftColor = isError ? 'var(--danger)' : 'var(--primary)';
    
    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, 4500);
}

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            const errData = await response.json();
            // Sessie verlopen of ongeldig token -> stuur terug naar login
            if (response.status === 401) {
                handleSessionExpired();
            }
            throw new Error(errData.error || 'Er is iets fout gegaan.');
        }
        return await response.json();
    } catch (err) {
        showToast(err.message, true);
        throw err;
    }
}

function handleSessionExpired() {
    currentUser = null;
    authToken = null;
    sessionStorage.removeItem('clinibook_user');
    sessionStorage.removeItem('clinibook_token');
    appContainer.classList.add('hidden');
    loginPage.classList.remove('hidden');
}

function formatDate(dateStr) {
    if (!dateStr) return 'N.v.t.';
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}


// ==================== NOTIFICATIONS / BELL LOGIC ====================

function addNotification(text) {
    notifications.unshift({
        id: Date.now(),
        text,
        time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    });
    updateBellUI();
    showToast(`🔔 Melding: ${text}`);
}

function updateBellUI() {
    bellNotificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
        bellNotificationsList.innerHTML = '<span class="empty-notifications">Geen nieuwe meldingen.</span>';
        bellBadge.classList.add('hidden');
        return;
    }

    bellBadge.textContent = notifications.length;
    bellBadge.classList.remove('hidden');

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = 'bell-notification-item';
        item.innerHTML = `
            <div style="font-weight: 500; margin-bottom: 0.15rem;">${notif.text}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); text-align: right;">${notif.time}</div>
        `;
        bellNotificationsList.appendChild(item);
    });
}

btnBell.addEventListener('click', (e) => {
    e.stopPropagation();
    bellDropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => {
    bellDropdown.classList.add('hidden');
});

btnClearNotifications.addEventListener('click', (e) => {
    e.stopPropagation();
    notifications = [];
    updateBellUI();
});

// Trigger simulated reminder notifications on login
function triggerPatientReminders() {
    setTimeout(() => {
        addNotification("Uw afspraak met Dr. Amrita Ramdin nadert over 2 uur! (Huisarts - 18-06-2026 om 09:30)");
    }, 3000);
}


// ==================== VIEW SWITCHER ====================

function switchView(viewName) {
    const views = [viewDashboard, viewAfspraak, viewTelemed, viewDocDashboard, viewDocInbox, viewDocRx, viewDocAdmin, viewInsDashboard];
    views.forEach(v => v.classList.add('hidden'));

    const navBtns = [navDash, navAfspraak, navTelemed, navDocDash, navDocInbox, navDocRx, navDocAdmin, navInsDash];
    navBtns.forEach(btn => btn.classList.remove('active'));

    if (viewName === 'dashboard') {
        viewDashboard.classList.remove('hidden');
        navDash.classList.add('active');
        loadPatientDashboard();
    } else if (viewName === 'afspraak') {
        viewAfspraak.classList.remove('hidden');
        navAfspraak.classList.add('active');
        loadBookingForm();
    } else if (viewName === 'telemed') {
        viewTelemed.classList.remove('hidden');
        navTelemed.classList.add('active');
        loadTelemedSidebar();
    } else if (viewName === 'doc-dashboard') {
        viewDocDashboard.classList.remove('hidden');
        navDocDash.classList.add('active');
        loadDoctorDashboard();
    } else if (viewName === 'doc-inbox') {
        viewDocInbox.classList.remove('hidden');
        navDocInbox.classList.add('active');
        loadDoctorInbox();
    } else if (viewName === 'doc-rx') {
        viewDocRx.classList.remove('hidden');
        navDocRx.classList.add('active');
        loadDoctorRxForm();
    } else if (viewName === 'doc-admin') {
        viewDocAdmin.classList.remove('hidden');
        navDocAdmin.classList.add('active');
        loadDoctorAdminForm();
    } else if (viewName === 'ins-dashboard') {
        viewInsDashboard.classList.remove('hidden');
        navInsDash.classList.add('active');
        loadInsuranceDashboard();
    }
}

if (navDash) navDash.addEventListener('click', () => switchView('dashboard'));
if (navAfspraak) navAfspraak.addEventListener('click', () => switchView('afspraak'));
if (navTelemed) navTelemed.addEventListener('click', () => switchView('telemed'));
if (navDocDash) navDocDash.addEventListener('click', () => switchView('doc-dashboard'));
if (navDocInbox) navDocInbox.addEventListener('click', () => switchView('doc-inbox'));
if (navDocRx) navDocRx.addEventListener('click', () => switchView('doc-rx'));
if (navDocAdmin) navDocAdmin.addEventListener('click', () => switchView('doc-admin'));
if (navInsDash) navInsDash.addEventListener('click', () => switchView('ins-dashboard'));


// ==================== AUTHENTICATION LOGIC ====================

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const result = await apiCall('/api/auth/login', 'POST', { email, password });
        currentUser = result.user;
        authToken = result.token;
        sessionStorage.setItem('clinibook_user', JSON.stringify(currentUser));
        sessionStorage.setItem('clinibook_token', authToken);
        setupAppForUser();
        showToast(`Welkom, ${currentUser.name}!`);
    } catch (err) {}
});

// Demo-accounts snel invullen: klik op een knop i.p.v. handmatig overtypen
document.querySelectorAll('.btn-demo-fill').forEach(btn => {
    btn.addEventListener('click', () => {
        emailInput.value = btn.dataset.email;
        passwordInput.value = btn.dataset.password;
    });
});

// Wisselen tussen het login- en registratieformulier
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    demoHelperBox.classList.add('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    demoHelperBox.classList.remove('hidden');
});

// Nieuw patiëntaccount registreren
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = regNameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value;
    const passwordConfirm = regPasswordConfirmInput.value;

    if (password !== passwordConfirm) {
        showToast("Wachtwoorden komen niet overeen.", true);
        return;
    }

    try {
        const result = await apiCall('/api/auth/register', 'POST', { name, email, password });
        // Meteen inloggen na succesvolle registratie, net als bij het loginformulier
        currentUser = result.user;
        authToken = result.token;
        sessionStorage.setItem('clinibook_user', JSON.stringify(currentUser));
        sessionStorage.setItem('clinibook_token', authToken);
        registerForm.reset();
        setupAppForUser();
        showToast(`Welkom bij CliniBook SR, ${currentUser.name}!`);
    } catch (err) {}
});

btnLogout.addEventListener('click', function() {
    currentUser = null;
    authToken = null;
    sessionStorage.removeItem('clinibook_user');
    sessionStorage.removeItem('clinibook_token');
    
    appContainer.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    loginForm.reset();
    registerForm.classList.add('hidden');
    registerForm.reset();
    demoHelperBox.classList.remove('hidden');
    notifications = [];
    updateBellUI();
    showToast('U bent succesvol uitgelogd.');
});

function setupAppForUser() {
    userDisplayName.textContent = currentUser.name;
    userDisplayRole.textContent = currentUser.role === 'doctor' ? 'Arts / Specialist' : (currentUser.role === 'insurance' ? 'Verzekeraar (SZF)' : 'Patiënt');
    
    loginPage.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // Setup navigation links by role
    patientNav.classList.add('hidden');
    doctorNav.classList.add('hidden');
    insuranceNav.classList.add('hidden');

    if (currentUser.role === 'doctor') {
        doctorNav.classList.remove('hidden');
        updateInboxBadge();
        switchView('doc-dashboard');
    } else if (currentUser.role === 'insurance') {
        insuranceNav.classList.remove('hidden');
        switchView('ins-dashboard');
    } else {
        patientNav.classList.remove('hidden');
        triggerPatientReminders();
        switchView('dashboard');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const savedUser = sessionStorage.getItem('clinibook_user');
    const savedToken = sessionStorage.getItem('clinibook_token');
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        setupAppForUser();
    }
});


// ==================== PATIENT DASHBOARD LOGIC ====================

async function loadPatientDashboard() {
    try {
        welcomeName.textContent = currentUser.name.split(' ')[0];
        
        const [appointments, prescriptions, reports, clinics, prefs] = await Promise.all([
            apiCall(`/api/appointments?patientId=${currentUser.id}`),
            apiCall(`/api/prescriptions?patientId=${currentUser.id}`),
            apiCall(`/api/reports/patient?patientId=${currentUser.id}`),
            apiCall('/api/clinics'),
            apiCall(`/api/patients/${currentUser.id}/notification-preferences`)
        ]);

        statPatientApts.textContent = appointments.filter(a => a.status === 'approved' || a.status === 'pending').length;
        statPatientRx.textContent = prescriptions.length;
        statPatientClinics.textContent = clinics.length;

        // Sync preferences inputs
        prefEmail.checked = prefs.channels.includes('email');
        prefSms.checked = prefs.channels.includes('sms');
        prefPush.checked = prefs.channels.includes('push');
        prefTime.value = prefs.reminderTime;

        renderTimeline(appointments, prescriptions, reports);
        renderPrescriptions(prescriptions);
    } catch (err) {}
}

function renderTimeline(appointments, prescriptions, reports) {
    patientTimeline.innerHTML = '';
    const timelineItems = [];

    appointments.forEach(apt => {
        timelineItems.push({
            type: 'appointment',
            date: apt.date,
            title: `Consult: ${apt.doctorName} (${apt.specialty})`,
            time: apt.timeSlot,
            status: apt.status,
            body: `Klacht: "${apt.reason}"`,
            rawDate: new Date(`${apt.date}T${apt.timeSlot}`)
        });
    });

    prescriptions.forEach(rx => {
        // Expiration check
        const isExpired = new Date(rx.validUntil) < new Date();
        const expiredBadge = isExpired ? '<span class="badge badge-danger" style="margin-left: 0.5rem;">Verlopen</span>' : '';
        const photoBtn = rx.photoData ? `<button onclick="openImageModal('${rx.id}')" class="btn-action-rx" style="margin-left:0.5rem; padding: 0.2rem 0.5rem; font-size:0.72rem;">📸 Originele scan</button>` : '';

        timelineItems.push({
            type: 'prescription',
            date: rx.date,
            title: `Medicatie: ${rx.medication} ${expiredBadge}`,
            body: `Dosering: ${rx.dosage}. Instructies: ${rx.instructions}<br><strong>Geldig tot:</strong> ${formatDate(rx.validUntil)} ${rx.sentToPharmacyName ? '<br>🟢 Verzonden naar: <em>' + rx.sentToPharmacyName + '</em>' : ''}`,
            id: rx.id,
            photoData: rx.photoData,
            rawDate: new Date(rx.date)
        });
    });

    reports.forEach(rep => {
        timelineItems.push({
            type: 'report',
            date: rep.date,
            title: `Medisch Verslag van ${rep.doctorName}`,
            body: `Bevindingen: "${rep.content}"`,
            rawDate: new Date(rep.date)
        });
    });

    timelineItems.sort((a, b) => b.rawDate - a.rawDate);

    if (timelineItems.length === 0) {
        patientTimeline.innerHTML = '<p class="empty-state-text">U heeft nog geen medische historie.</p>';
        return;
    }

    timelineItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'timeline-item';
        
        let iconClass = 'apt';
        let statusBadge = '';

        if (item.type === 'prescription') {
            iconClass = 'rx';
        } else if (item.type === 'report') {
            iconClass = 'rep';
        } else if (item.type === 'appointment') {
            if (item.status === 'pending') {
                iconClass = 'pending';
                statusBadge = '<span class="badge badge-pending">In afwachting</span>';
            } else if (item.status === 'approved') {
                statusBadge = '<span class="badge badge-success">Goedgekeurd</span>';
            } else {
                statusBadge = '<span class="badge badge-danger">Geweigerd</span>';
            }
        }

        const scanBtnHtml = (item.type === 'prescription' && item.photoData) ? `<button onclick="openImageModal('${item.id}')" class="btn-action-rx" style="font-size:0.75rem; padding: 0.3rem 0.6rem; background:#f5f3ff; color:#7c3aed; border-color: rgba(124, 92, 246, 0.2);">📸 Originele Foto</button>` : '';

        itemEl.innerHTML = `
            <div class="timeline-dot ${iconClass}"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <span class="timeline-title">${item.title}</span>
                    <span class="timeline-date">${formatDate(item.date)} ${item.time ? 'om ' + item.time : ''}</span>
                </div>
                <div class="timeline-body">
                    <p style="margin-bottom: 0.5rem;">${item.body}</p>
                    ${statusBadge}
                    ${item.type === 'prescription' ? `
                        <div class="rx-actions-flex" style="margin-top: 0.5rem;">
                            <button onclick="downloadPrescriptionPdf('${item.id}')" class="btn-download-pdf">📥 Download PDF</button>
                            ${scanBtnHtml}
                            ${!item.sentToPharmacyName ? `<button onclick="openForwardModal('${item.id}')" class="btn-action-rx">✈️ Naar Apotheek sturen</button>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        patientTimeline.appendChild(itemEl);
    });
}

function renderPrescriptions(prescriptions) {
    prescriptionsList.innerHTML = '';
    if (prescriptions.length === 0) {
        prescriptionsList.innerHTML = '<p class="empty-state-text">Geen actieve recepten gevonden.</p>';
        return;
    }

    prescriptions.forEach(rx => {
        const isExpired = new Date(rx.validUntil) < new Date();
        const expiredHtml = isExpired ? '<span class="badge badge-danger" style="margin-top:0.25rem;">Verlopen</span>' : '';
        const forwardBtnHtml = !rx.sentToPharmacyName 
            ? `<button onclick="openForwardModal('${rx.id}')" class="btn-action-rx" style="width:100%; font-size:0.75rem; padding:0.4rem; margin-top:0.5rem;">✈️ Naar Apotheek sturen</button>`
            : `<div style="font-size:0.75rem; color:var(--success); font-weight:600; margin-top:0.5rem;">🟢 Verzonden naar ${rx.sentToPharmacyName}</div>`;

        const card = document.createElement('div');
        card.className = 'rx-card';
        card.innerHTML = `
            <div class="rx-info">
                <h4>${rx.medication}</h4>
                <p>Door ${rx.doctorName} op ${formatDate(rx.date)}</p>
                <p style="font-size: 0.8rem; color: #475569;">Geldig tot: ${formatDate(rx.validUntil)}</p>
                ${expiredHtml}
            </div>
            <div class="rx-actions-flex" style="flex-direction:column; gap:0.25rem; align-items:flex-end;">
                <button onclick="downloadPrescriptionPdf('${rx.id}')" class="btn-download-pdf">📥 PDF</button>
                ${rx.photoData ? `<button onclick="openImageModal('${rx.id}')" class="btn-action-rx" style="font-size:0.72rem; padding: 0.2rem 0.5rem;">📸 Scan</button>` : ''}
            </div>
            ${forwardBtnHtml}
        `;
        prescriptionsList.appendChild(card);
    });
}

function downloadPrescriptionPdf(prescriptionId) {
    window.open(`/api/prescriptions/${prescriptionId}/pdf`, '_blank');
}


// ==================== PATIENT NOTIFICATION PREFERENCES ====================

preferencesForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const channels = [];
    if (prefEmail.checked) channels.push('email');
    if (prefSms.checked) channels.push('sms');
    if (prefPush.checked) channels.push('push');
    
    const reminderTime = prefTime.value;

    try {
        await apiCall(`/api/patients/${currentUser.id}/notification-preferences`, 'POST', {
            channels,
            reminderTime
        });
        showToast('Notificatie instellingen succesvol bijgewerkt!');
    } catch (err) {}
});


// ==================== APPOINTMENT BOOKING FORM ====================

async function loadBookingForm() {
    appointmentForm.reset();
    selectDoctor.disabled = true;
    appointmentDate.disabled = true;
    slotsGrid.innerHTML = '<span class="slots-placeholder">Selecteer eerst een poli, arts en datum om tijden te laden.</span>';
    selectedTimeslotInput.value = '';

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    appointmentDate.min = `${yyyy}-${mm}-${dd}`;

    try {
        const clinics = await apiCall('/api/clinics');
        selectClinic.innerHTML = '<option value="">-- Selecteer een poli --</option>';
        clinics.forEach(cli => {
            selectClinic.innerHTML += `<option value="${cli.id}">${cli.name}</option>`;
        });
    } catch (err) {}
}

selectClinic.addEventListener('change', async function() {
    const clinicId = this.value;
    selectDoctor.innerHTML = '<option value="">-- Selecteer een arts --</option>';
    selectDoctor.disabled = true;
    appointmentDate.disabled = true;
    slotsGrid.innerHTML = '<span class="slots-placeholder">Selecteer eerst een poli, arts en datum om tijden te laden.</span>';
    selectedTimeslotInput.value = '';

    if (!clinicId) return;

    try {
        const doctors = await apiCall('/api/doctors');
        const filteredDocs = doctors.filter(d => d.clinicId === clinicId);
        
        if (filteredDocs.length === 0) {
            selectDoctor.innerHTML = '<option value="">Geen artsen beschikbaar</option>';
            return;
        }

        selectDoctor.innerHTML = '<option value="">-- Selecteer een arts --</option>';
        filteredDocs.forEach(doc => {
            selectDoctor.innerHTML += `<option value="${doc.id}">${doc.name} (${doc.specialty})</option>`;
        });
        selectDoctor.disabled = false;
    } catch (err) {}
});

selectDoctor.addEventListener('change', function() {
    appointmentDate.disabled = !this.value;
    appointmentDate.value = '';
    slotsGrid.innerHTML = '<span class="slots-placeholder">Selecteer een datum om tijden te laden.</span>';
    selectedTimeslotInput.value = '';
});

appointmentDate.addEventListener('change', loadAvailableTimeSlots);

async function loadAvailableTimeSlots() {
    const doctorId = selectDoctor.value;
    const date = appointmentDate.value;
    selectedTimeslotInput.value = '';

    if (!doctorId || !date) return;

    slotsGrid.innerHTML = '<span class="slots-placeholder">Tijden laden...</span>';

    try {
        const availability = await apiCall(`/api/doctors/${doctorId}/availability?date=${date}`);
        slotsGrid.innerHTML = '';

        if (availability.totalSlots.length === 0) {
            slotsGrid.innerHTML = '<span class="slots-placeholder">Arts werkt niet op deze dag.</span>';
            return;
        }

        availability.totalSlots.forEach(slot => {
            const isBooked = availability.bookedSlots.includes(slot);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `slot-btn ${isBooked ? 'booked' : 'available'}`;
            btn.textContent = slot;
            
            if (!isBooked) {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.slot-btn.selected').forEach(el => el.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedTimeslotInput.value = slot;
                });
            } else {
                btn.disabled = true;
            }
            slotsGrid.appendChild(btn);
        });

    } catch (err) {
        slotsGrid.innerHTML = '<span class="slots-placeholder">Fout bij laden.</span>';
    }
}

appointmentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const doctorId = selectDoctor.value;
    const date = appointmentDate.value;
    const timeSlot = selectedTimeslotInput.value;
    const reason = document.getElementById('appointment-reason').value.trim();

    if (!timeSlot) {
        showToast('Kies a.u.b. een tijdslot.', true);
        return;
    }

    try {
        await apiCall('/api/appointments', 'POST', {
            patientId: currentUser.id,
            patientName: currentUser.name,
            doctorId,
            date,
            timeSlot,
            reason
        });

        showToast('Afspraak succesvol in behandeling gezet!');
        switchView('dashboard');
    } catch (err) {}
});


// ==================== PATIENT TELEMEDICINE (CHAT & CALLS) ====================

async function loadTelemedSidebar() {
    doctorChatsList.innerHTML = '';
    telemedWorkspace.classList.add('hidden');
    telemedPromptSelect.classList.remove('hidden');
    activeTelemedDocId = '';

    try {
        const doctors = await apiCall('/api/doctors');
        doctors.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'chat-user-item';
            item.innerHTML = `
                <h4>${doc.name}</h4>
                <p>${doc.specialty} • Polikliniek</p>
            `;
            item.addEventListener('click', () => {
                document.querySelectorAll('.chat-user-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                openTelemedWorkspace(doc.id, doc.name, doc.specialty);
            });
            doctorChatsList.appendChild(item);
        });
    } catch (err) {}
}

async function openTelemedWorkspace(docId, docName, docSpecialty) {
    activeTelemedDocId = docId;
    telemedDocName.textContent = docName;
    telemedDocSpecialty.textContent = docSpecialty;
    
    telemedPromptSelect.classList.add('hidden');
    telemedWorkspace.classList.remove('hidden');
    
    // Switch to Chat tab by default
    switchWorkspaceTab('chat');
}

// Inner tabs workspace switcher
function switchWorkspaceTab(tabName) {
    tabChatLink.classList.remove('active');
    tabQaLink.classList.remove('active');
    paneChat.classList.add('hidden');
    paneQa.classList.add('hidden');

    if (tabName === 'chat') {
        tabChatLink.add = tabChatLink.classList.add('active');
        paneChat.classList.remove('hidden');
        loadChatMessages();
    } else {
        tabQaLink.classList.add('active');
        paneQa.classList.remove('hidden');
        loadQaMessages();
    }
}

tabChatLink.addEventListener('click', () => switchWorkspaceTab('chat'));
tabQaLink.addEventListener('click', () => switchWorkspaceTab('qa'));

// Chat log loader
async function loadChatMessages() {
    chatMessagesContainer.innerHTML = '';
    try {
        const chats = await apiCall(`/api/chats?patientId=${currentUser.id}&doctorId=${activeTelemedDocId}`);
        chats.forEach(chat => {
            const isPatient = chat.sender === 'patient';
            const bubble = document.createElement('div');
            bubble.className = `chat-bubble ${isPatient ? 'patient' : 'doctor'}`;
            
            const timeFormatted = new Date(chat.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
            bubble.innerHTML = `
                <div>${chat.message}</div>
                <span class="chat-bubble-time">${timeFormatted}</span>
            `;
            chatMessagesContainer.appendChild(bubble);
        });
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    } catch (err) {}
}

chatMessageForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const msg = chatTextInput.value.trim();
    if (!msg) return;

    chatTextInput.value = '';
    
    try {
        // Save patient message
        await apiCall('/api/chats', 'POST', {
            patientId: currentUser.id,
            doctorId: activeTelemedDocId,
            sender: 'patient',
            message: msg
        });

        // Instantly reload chat
        await loadChatMessages();

        // Simulate Doctor reply loading dots / typing sound
        setTimeout(async () => {
            await loadChatMessages();
            addNotification(`Nieuw bericht ontvangen van ${telemedDocName.textContent}!`);
        }, 1200);

    } catch (err) {}
});

// Q&A questions loader
async function loadQaMessages() {
    qaList.innerHTML = '';
    try {
        const questions = await apiCall(`/api/questions?patientId=${currentUser.id}`);
        const filteredQ = questions.filter(q => q.doctorId === activeTelemedDocId);

        if (filteredQ.length === 0) {
            qaList.innerHTML = '<p class="empty-state-text">U heeft nog geen schriftelijke vragen gesteld aan deze arts.</p>';
            return;
        }

        filteredQ.forEach(q => {
            const item = document.createElement('div');
            item.className = 'qa-item';
            
            const answerHtml = q.answer 
                ? `<div class="qa-answer"><strong>Antwoord (${formatDate(q.answeredDate)}):</strong> ${q.answer}</div>`
                : `<div class="qa-pending">⏳ In afwachting van antwoord arts...</div>`;

            item.innerHTML = `
                <div class="qa-question">Vraag (${formatDate(q.date)}): "${q.question}"</div>
                ${answerHtml}
            `;
            qaList.appendChild(item);
        });
    } catch (err) {}
}

qaQuestionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const question = qaQuestionText.value.trim();
    if (!question) return;

    try {
        await apiCall('/api/questions', 'POST', {
            patientId: currentUser.id,
            patientName: currentUser.name,
            doctorId: activeTelemedDocId,
            question
        });

        showToast('Medische vraag succesvol ingediend!');
        qaQuestionText.value = '';
        loadQaMessages();
    } catch (err) {}
});

// Telemedicine simulated call handling
let webcamStream = null;

function initiateCall(isVideo) {
    callDoctorTitle.textContent = telemedDocName.textContent;
    callStatusLabel.textContent = "VERBINDEN...";
    callTimer.classList.add('hidden');
    videoFeedsContainer.classList.add('hidden');
    callOverlay.classList.remove('hidden');

    // Mute/Speaker indicators reset
    let callTime = 0;
    
    // Simulate connection after 2.5 seconds
    setTimeout(() => {
        callStatusLabel.textContent = isVideo ? "MEDISCH VIDEO CONSULT" : "AUDIO CONSULT";
        callTimer.classList.remove('hidden');
        
        // Start call timer
        clearInterval(callTimerInterval);
        callTimerInterval = setInterval(() => {
            callTime++;
            const mm = String(Math.floor(callTime / 60)).padStart(2, '0');
            const ss = String(callTime % 60).padStart(2, '0');
            callTimer.textContent = `${mm}:${ss}`;
        }, 1000);

        if (isVideo) {
            videoFeedsContainer.classList.remove('hidden');
            // Try initialization of actual browser camera preview
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    webcamStream = stream;
                    localWebcamVideo.srcObject = stream;
                })
                .catch(err => {
                    console.log("Webcam permission denied or unavailable, showing avatar preview.");
                });
        }
    }, 2500);
}

if (btnAudioCall) btnAudioCall.addEventListener('click', () => initiateCall(false));
if (btnVideoCall) btnVideoCall.addEventListener('click', () => initiateCall(true));

function hangupCall() {
    clearInterval(callTimerInterval);
    callOverlay.classList.add('hidden');
    
    // Stop webcam tracks
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    localWebcamVideo.srcObject = null;
    showToast('Consultatie beëindigd.');
}

if (btnHangup) btnHangup.addEventListener('click', hangupCall);


// ==================== DOCTOR DASHBOARD & STATS LOGIC ====================

async function loadDoctorDashboard() {
    try {
        const reports = await apiCall('/api/reports');
        const summary = reports.summary;

        statDocPending.textContent = summary.pendingAppointments;
        statDocApproved.textContent = summary.approvedAppointments;
        statDocDoctors.textContent = summary.totalDoctors;
        statDocPrescriptions.textContent = summary.totalPrescriptions;

        clinicLoadTable.innerHTML = '';
        reports.clinicLoads.forEach(cli => {
            clinicLoadTable.innerHTML += `
                <tr>
                    <td style="font-weight:600;">${cli.clinicName}</td>
                    <td><span class="badge badge-success" style="font-size:0.9rem;">${cli.count} afspraken</span></td>
                    <td>Actief</td>
                </tr>
            `;
        });

        doctorLoadTable.innerHTML = '';
        reports.appointmentsPerDoctor.forEach(doc => {
            doctorLoadTable.innerHTML += `
                <tr>
                    <td style="font-weight:600;">${doc.doctorName}</td>
                    <td>${doc.specialty}</td>
                    <td><strong>${doc.count} consulten</strong></td>
                </tr>
            `;
        });
    } catch (err) {}
}


// ==================== DOCTOR INBOX LOGIC ====================

async function updateInboxBadge() {
    try {
        const appointments = await apiCall('/api/appointments');
        const pending = appointments.filter(a => a.status === 'pending');
        let myPending = pending;
        if (currentUser.doctorId) {
            myPending = pending.filter(a => a.doctorId === currentUser.doctorId);
        }

        if (myPending.length > 0) {
            badgeInboxCount.textContent = myPending.length;
            badgeInboxCount.classList.remove('hidden');
        } else {
            badgeInboxCount.classList.add('hidden');
        }
    } catch (err) {}
}

async function loadDoctorInbox() {
    incomingAppointmentsTable.innerHTML = '';
    
    try {
        const appointments = await apiCall('/api/appointments');
        let filteredApts = appointments;
        if (currentUser.doctorId) {
            filteredApts = appointments.filter(a => a.doctorId === currentUser.doctorId);
        }

        filteredApts.sort((a,b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.date) - new Date(a.date);
        });

        if (filteredApts.length === 0) {
            incomingAppointmentsTable.innerHTML = '<tr><td colspan="5" class="empty-state-text" style="text-align:center;">Geen afspraken geregistreerd.</td></tr>';
            return;
        }

        filteredApts.forEach(apt => {
            const row = document.createElement('tr');
            let actionHtml = '';
            if (apt.status === 'pending') {
                actionHtml = `
                    <div class="action-cell">
                        <button onclick="openApproveModal('${apt.id}', '${apt.patientName}')" class="btn-action btn-approve">✓ Accepteren</button>
                        <button onclick="updateAptStatus('${apt.id}', 'rejected')" class="btn-action btn-reject">✗ Weigeren</button>
                    </div>
                `;
            } else if (apt.status === 'approved') {
                actionHtml = '<span class="badge badge-success">✓ Goedgekeurd</span>';
            } else {
                actionHtml = '<span class="badge badge-danger">✗ Geweigerd</span>';
            }

            row.innerHTML = `
                <td style="font-weight:600;">${apt.patientName}</td>
                <td>${apt.doctorName} (${apt.specialty})</td>
                <td><strong>${formatDate(apt.date)}</strong> om <strong>${apt.timeSlot}</strong></td>
                <td><em style="color:#64748b;">"${apt.reason}"</em></td>
                <td>${actionHtml}</td>
            `;
            incomingAppointmentsTable.appendChild(row);
        });
    } catch (err) {}
}

function openApproveModal(appointmentId, patientName) {
    modalAptId.value = appointmentId;
    modalPatientName.textContent = patientName;
    modalReportText.value = '';
    approveModal.classList.remove('hidden');
}

function closeModal() {
    approveModal.classList.add('hidden');
}

if (btnModalConfirm) {
    btnModalConfirm.addEventListener('click', async function() {
        const id = modalAptId.value;
        const reportText = modalReportText.value.trim();
        
        closeModal();
        try {
            await apiCall(`/api/appointments/${id}/status`, 'POST', {
                status: 'approved',
                doctorReport: reportText || null
            });
            showToast('Afspraak is goedgekeurd!');
            loadDoctorInbox();
            updateInboxBadge();
        } catch (err) {}
    });
}

async function updateAptStatus(id, status) {
    if (confirm(`Weet u zeker dat u deze afspraak wilt ${status === 'rejected' ? 'weigeren' : 'goedkeuren'}?`)) {
        try {
            await apiCall(`/api/appointments/${id}/status`, 'POST', { status });
            showToast(`Afspraak status bijgewerkt.`);
            loadDoctorInbox();
            updateInboxBadge();
        } catch (err) {}
    }
}


// ==================== DOCTOR RX WRITING LOGIC ====================

let uploadedBase64Photo = null;

async function loadDoctorRxForm() {
    prescriptionForm.reset();
    rxSelectPatient.innerHTML = '<option value="">-- Kies patiënt --</option>';
    uploadedBase64Photo = null;

    // Set default expiration date to 3 months from now
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + 3);
    const yyyy = expDate.getFullYear();
    const mm = String(expDate.getMonth() + 1).padStart(2, '0');
    const dd = String(expDate.getDate()).padStart(2, '0');
    rxValidity.value = `${yyyy}-${mm}-${dd}`;

    try {
        const patients = await apiCall('/api/patients');
        patients.forEach(pat => {
            rxSelectPatient.innerHTML += `<option value="${pat.id}">${pat.name} (${pat.email})</option>`;
        });
    } catch (err) {}
}

// Convert handwritten prescription image to Base64
if (rxPhotoUpload) {
    rxPhotoUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) {
            uploadedBase64Photo = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedBase64Photo = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

prescriptionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const patientId = rxSelectPatient.value;
    const medication = rxMedication.value.trim();
    const dosage = rxDosage.value.trim();
    const instructions = rxInstructions.value.trim();
    const validUntil = rxValidity.value;

    // currentUser.doctorId hoort altijd gezet te zijn voor een ingelogde arts
    // (zie routes/auth.js). Is dat toch niet zo, dan is het account niet
    // correct gekoppeld aan een dokter-record — beter een duidelijke
    // foutmelding tonen dan stilzwijgend een ongeldig ID versturen.
    if (!currentUser.doctorId) {
        showToast('Jouw account is niet gekoppeld aan een artsenprofiel. Neem contact op met de beheerder.', true);
        return;
    }

    try {
        const result = await apiCall('/api/prescriptions', 'POST', {
            patientId,
            doctorId: currentUser.doctorId,
            medication,
            dosage,
            instructions,
            validUntil,
            photoData: uploadedBase64Photo
        });

        showToast('Medisch recept succesvol gegenereerd!');
        prescriptionForm.reset();
        uploadedBase64Photo = null;
        
        // Auto trigger download
        downloadPrescriptionPdf(result.id);
    } catch (err) {}
});


// ==================== ADMIN & PHARMACY REGISTRATION LOGIC ====================

async function loadDoctorAdminForm() {
    addClinicForm.reset();
    addDoctorForm.reset();
    addPharmacyForm.reset();
    
    try {
        const clinics = await apiCall('/api/clinics');
        newDocClinic.innerHTML = '<option value="">-- Kies polikliniek --</option>';
        clinics.forEach(cli => {
            newDocClinic.innerHTML += `<option value="${cli.id}">${cli.name}</option>`;
        });
    } catch (err) {}
}

addClinicForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('new-clinic-name').value.trim();
    const description = document.getElementById('new-clinic-desc').value.trim();

    try {
        await apiCall('/api/clinics', 'POST', { name, description });
        showToast(`Polikliniek "${name}" toegevoegd!`);
        addClinicForm.reset();
        loadDoctorAdminForm();
    } catch (err) {}
});

addDoctorForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('new-doc-name').value.trim();
    const specialty = document.getElementById('new-doc-specialty').value.trim();
    const clinicId = newDocClinic.value;
    
    const checkboxes = document.querySelectorAll('input[name="workdays"]:checked');
    const availability = {};
    checkboxes.forEach(cb => {
        availability[cb.value] = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
    });

    try {
        const result = await apiCall('/api/doctors', 'POST', {
            name,
            specialty,
            clinicId,
            availability
        });

        alert(`Arts "${name}" toegevoegd!\n\nCredentials:\nEmail: ${result.credentials.email}\nWachtwoord: 123456`);
        addDoctorForm.reset();
        loadDoctorAdminForm();
    } catch (err) {}
});

addPharmacyForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('new-phar-name').value.trim();
    const address = document.getElementById('new-phar-address').value.trim();
    const phone = document.getElementById('new-phar-phone').value.trim();

    try {
        await apiCall('/api/pharmacies', 'POST', { name, address, phone });
        showToast(`Apotheek "${name}" toegevoegd aan het portaalnetwerk!`);
        addPharmacyForm.reset();
    } catch (err) {}
});


// ==================== INSURANCE CONTROL PORTAL LOGIC ====================

async function loadInsuranceDashboard() {
    insPatientList.innerHTML = '';
    insDossierContent.classList.add('hidden');
    insPromptSelect.classList.remove('hidden');
    activeInsPatientId = '';

    try {
        const patients = await apiCall('/api/patients');
        patients.forEach(pat => {
            const item = document.createElement('div');
            item.className = 'ins-patient-item';
            item.innerHTML = `
                <h4>${pat.name}</h4>
                <p>Verzekerde E-mail: ${pat.email}</p>
            `;
            item.addEventListener('click', () => {
                document.querySelectorAll('.ins-patient-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                openPatientDossier(pat.id, pat.name, pat.email);
            });
            insPatientList.appendChild(item);
        });
    } catch (err) {}
}

async function openPatientDossier(patientId, name, email) {
    activeInsPatientId = patientId;
    insPatientName.textContent = name;
    insPatientEmail.textContent = email;
    
    insPromptSelect.classList.add('hidden');
    insDossierContent.classList.remove('hidden');
    
    await loadDossierData();
}

async function loadDossierData() {
    insTimelineView.innerHTML = '';
    insDossierNotesList.innerHTML = '';
    
    try {
        const dossier = await apiCall(`/api/patients/${activeInsPatientId}/dossier`);

        // Render storage visualizer
        // Calculate database sizes based on base64 uploads
        let totalBase64Bytes = 0;
        dossier.prescriptions.forEach(rx => {
            if (rx.photoData) totalBase64Bytes += rx.photoData.length;
        });
        
        const kilobytes = (totalBase64Bytes / 1024).toFixed(2);
        storageUtilizationText.textContent = `${kilobytes} KB / 100 GB (Simulatie)`;
        // Set bar width proportional
        const percent = Math.min((totalBase64Bytes / (1024 * 1024)) * 100, 100); // map up to 1MB
        storageBar.style.width = `${Math.max(percent, 1.5)}%`;

        // Render medical timeline records
        const timelineItems = [];

        dossier.appointments.forEach(apt => {
            timelineItems.push({
                type: 'appointment',
                date: apt.date,
                title: `Consultation: ${apt.doctorName} (${apt.specialty})`,
                body: `Symptomen: "${apt.reason}"<br>Status: <strong>${apt.status}</strong>`,
                rawDate: new Date(`${apt.date}T${apt.timeSlot}`)
            });
        });

        dossier.prescriptions.forEach(rx => {
            const photoBtn = rx.photoData ? `<button onclick="openImageModal('${rx.id}')" class="btn-action-rx" style="margin-top:0.25rem;">📸 Bekijk Foto-upload</button>` : '';
            timelineItems.push({
                type: 'prescription',
                date: rx.date,
                title: `Recept: ${rx.medication}`,
                body: `Dosering: ${rx.dosage}. Geldig tot: ${formatDate(rx.validUntil)}<br>${photoBtn}`,
                rawDate: new Date(rx.date)
            });
        });

        dossier.reports.forEach(rep => {
            timelineItems.push({
                type: 'report',
                date: rep.date,
                title: `Medisch Verslag van ${rep.doctorName}`,
                body: `Diagnose: "${rep.content}"`,
                rawDate: new Date(rep.date)
            });
        });

        timelineItems.sort((a,b) => b.rawDate - a.rawDate);

        if (timelineItems.length === 0) {
            insTimelineView.innerHTML = '<span class="empty-state-text">Geen dossiergeschiedenis gevonden.</span>';
        } else {
            timelineItems.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'timeline-item';
                let iconClass = item.type === 'prescription' ? 'rx' : (item.type === 'report' ? 'rep' : 'apt');
                itemEl.innerHTML = `
                    <div class="timeline-dot ${iconClass}"></div>
                    <div class="timeline-content" style="padding:0.75rem 1rem;">
                        <div class="timeline-header">
                            <span class="timeline-title" style="font-size:0.85rem;">${item.title}</span>
                            <span class="timeline-date" style="font-size:0.7rem;">${formatDate(item.date)}</span>
                        </div>
                        <div class="timeline-body" style="font-size:0.8rem;">${item.body}</div>
                    </div>
                `;
                insTimelineView.appendChild(itemEl);
            });
        }

        // Render insurer logs
        if (dossier.dossierNotes.length === 0) {
            insDossierNotesList.innerHTML = '<span class="empty-state-text">Geen logs geregistreerd.</span>';
        } else {
            // Sort descending
            dossier.dossierNotes.reverse().forEach(note => {
                const card = document.createElement('div');
                card.className = 'dossier-note-card';
                card.innerHTML = `
                    <h6>Auteur: ${note.author} (${formatDate(note.date)})</h6>
                    <p>"${note.note}"</p>
                `;
                insDossierNotesList.appendChild(card);
            });
        }

    } catch (err) {}
}

addDossierNoteForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const note = newDossierNote.value.trim();
    if (!note) return;

    try {
        await apiCall(`/api/patients/${activeInsPatientId}/dossier/notes`, 'POST', {
            author: currentUser.name,
            note
        });

        showToast('Notitie succesvol toegevoegd aan patiëntendossier!');
        newDossierNote.value = '';
        await loadDossierData();
    } catch (err) {}
});


// ==================== MODAL PREVIEWS & INTERACTIVE LOGICS ====================

// Handwritten scan viewer modal
async function openImageModal(prescriptionId) {
    try {
        const rxList = await apiCall(`/api/prescriptions`);
        const rx = rxList.find(p => p.id === prescriptionId);
        
        if (rx && rx.photoData) {
            modalPreviewImg.src = rx.photoData;
            imageModal.classList.remove('hidden');
        } else {
            showToast('Dit recept heeft geen geüploade foto-scan.', true);
        }
    } catch (err) {}
}

function closeImageModal() {
    imageModal.classList.add('hidden');
    modalPreviewImg.src = '';
}

// Forward to Pharmacy modal
async function openForwardModal(prescriptionId) {
    forwardRxId.value = prescriptionId;
    forwardSelectPharmacy.innerHTML = '<option value="">-- Selecteer apotheek --</option>';
    
    try {
        const pharmacies = await apiCall('/api/pharmacies');
        pharmacies.forEach(phar => {
            forwardSelectPharmacy.innerHTML += `<option value="${phar.id}">${phar.name} (${phar.address})</option>`;
        });
        forwardModal.classList.remove('hidden');
    } catch (err) {}
}

function closeForwardModal() {
    forwardModal.classList.add('hidden');
}

btnForwardSubmit.addEventListener('click', async function() {
    const rxId = forwardRxId.value;
    const pharId = forwardSelectPharmacy.value;
    
    if (!pharId) {
        showToast('Selecteer een apotheek uit de lijst.', true);
        return;
    }

    closeForwardModal();
    try {
        await apiCall(`/api/prescriptions/${rxId}/send-to-pharmacy`, 'POST', { pharmacyId: pharId });
        showToast('Recept succesvol digitaal verzonden naar de apotheek!');
        
        // Reload dashboard
        loadPatientDashboard();
    } catch (err) {}
});

// Storage Modal
function openStorageModal() {
    storageModal.classList.remove('hidden');
}

function closeStorageModal() {
    storageModal.classList.add('hidden');
}