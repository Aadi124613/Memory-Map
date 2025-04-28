// Initialize the map
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Show/Hide memory form
const addMemoryBtn = document.getElementById('addMemoryBtn');
const memoryForm = document.getElementById('memoryForm');
let selectedLat = null;
let selectedLng = null;

addMemoryBtn.addEventListener('click', () => {
    memoryForm.classList.toggle('hidden');
});

// Click on map to select coordinates
map.on('click', (e) => {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    document.getElementById('lat').value = selectedLat.toFixed(5);
    document.getElementById('lng').value = selectedLng.toFixed(5);
});

// Save memory
const saveMemoryBtn = document.getElementById('saveMemory');
saveMemoryBtn.addEventListener('click', () => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const photoInput = document.getElementById('photo');

    if (!title || !description || isNaN(lat) || isNaN(lng)) {
        alert('Please fill all fields correctly.');
        return;
    }

    let photoURL = '';

    if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoURL = e.target.result;
            createMemory(title, description, lat, lng, photoURL);
        }
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        createMemory(title, description, lat, lng, '');
    }
});

function createMemory(title, description, lat, lng, photoURL) {
    const marker = L.marker([lat, lng]).addTo(map);

    let popupContent = `<b>${title}</b><br>${description}`;
    if (photoURL) {
        popupContent += `<br><img src="${photoURL}" style="width:100px;margin-top:5px;border-radius:8px;">`;
    }
    marker.bindPopup(popupContent);

    saveMemoryToLocalStorage({ title, description, lat, lng, photoURL });

    // Reset form
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('lat').value = '';
    document.getElementById('lng').value = '';
    document.getElementById('photo').value = '';
    memoryForm.classList.add('hidden');
}

function saveMemoryToLocalStorage(memory) {
    let memories = JSON.parse(localStorage.getItem('memories')) || [];
    memories.push(memory);
    localStorage.setItem('memories', JSON.stringify(memories));
}

function loadMemoriesFromLocalStorage() {
    let memories = JSON.parse(localStorage.getItem('memories')) || [];
    memories.forEach(mem => {
        const marker = L.marker([mem.lat, mem.lng]).addTo(map);
        let popupContent = `<b>${mem.title}</b><br>${mem.description}`;
        if (mem.photoURL) {
            popupContent += `<br><img src="${mem.photoURL}" style="width:100px;margin-top:5px;border-radius:8px;">`;
        }
        marker.bindPopup(popupContent);
    });
}

// Load memories on page load
window.onload = loadMemoriesFromLocalStorage;

// Search functionality
document.getElementById('searchInput').addEventListener('input', function() {
    let searchText = this.value.toLowerCase();
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            const popup = layer.getPopup();
            if (popup && popup.getContent().toLowerCase().includes(searchText)) {
                layer.setOpacity(1);
            } else {
                layer.setOpacity(0.2);
            }
        }
    });
});

// Dark mode toggle
const darkModeBtn = document.getElementById('darkModeBtn');
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});
