// ==========================================
// VARIABLES GLOBALES
// ==========================================
let currentUser = JSON.parse(localStorage.getItem('unicuartos_user')) || null;
let pendingAction = null;
let currentSlide = 0;
let selectedRoomTemp = null;

// ==========================================
// ACORDEÓN DE PREGUNTAS FRECUENTES
// ==========================================
function toggleFaq(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector('i');
  
  const allContents = document.querySelectorAll('.faq-content');
  const allIcons = document.querySelectorAll('#faqAccordion i');
  
  allContents.forEach(item => {
    if (item !== content) {
      item.style.maxHeight = null;
    }
  });
  allIcons.forEach(i => {
    if (i !== icon) {
      i.style.transform = 'rotate(0deg)';
    }
  });

  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    icon.style.transform = 'rotate(0deg)';
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    icon.style.transform = 'rotate(180deg)';
  }
}

// ==========================================
// FUNCIONES DE NAVEGACIÓN Y AUTENTICACIÓN
// ==========================================
function updateAuthNav() {
  const container = document.getElementById('authNavContainer');
  if (!container) return;

  if (currentUser) {
    const isStudent = currentUser.role === 'estudiante';
    const targetPage = isStudent ? 'panel_estudiante.html' : 'panel_propietario.html';
    const roleLabel = 'Mi Panel';
    const roleIcon = isStudent ? 'fa-graduation-cap' : 'fa-house-user';

    container.innerHTML = `
      <div class="flex items-center gap-3">
        <a href="${targetPage}" class="bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-700 hover:to-accent-600 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md transition flex items-center gap-2">
          <i class="fa-solid ${roleIcon}"></i>
          <span>${roleLabel}</span>
        </a>
        <button onclick="handleLogout()" title="Cerrar Sesión" class="text-slate-400 hover:text-rose-500 font-bold text-xs p-2 rounded-full transition">
          <i class="fa-solid fa-right-from-bracket text-base"></i>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button onclick="openModal('accountModal')" class="bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-700 hover:to-accent-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition flex items-center gap-2">
        <i class="fa-solid fa-user text-xs"></i>
        <span>Ingresar</span>
      </button>
    `;
  }
}

function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
  if (id === 'accountModal') {
    document.getElementById('authNotice')?.classList.add('hidden');
    showForgotPassword(false);
  }
}

function requireAuth(action) {
  pendingAction = action;
  if (!currentUser) {
    document.getElementById('authNotice')?.classList.remove('hidden');
    openModal('accountModal');
  } else {
    executePendingAction();
  }
}

function executePendingAction() {
  if (pendingAction === 'room') {
    if (currentUser.role === 'arrendador') {
      openModal('postRoomModal');
    } else {
      showToast('Solo cuentas con perfil de Arrendador pueden publicar cuartos.');
    }
  } else if (pendingAction === 'review') {
    // Cargar publicaciones antes de abrir el modal
    loadListingsForReview();
    openModal('postReviewModal');
  } else if (pendingAction === 'select') {
    openModal('detailModal');
  }
  pendingAction = null;
}

// ==========================================
// AUTENTICACIÓN
// ==========================================
function switchAuthTab(tab) {
  const regForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const regBtn = document.getElementById('tabRegisterBtn');
  const loginBtn = document.getElementById('tabLoginBtn');

  showForgotPassword(false);

  if (tab === 'register') {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    regBtn.className = 'w-1/2 py-2 text-brand-600 border-b-2 border-brand-600';
    loginBtn.className = 'w-1/2 py-2 text-slate-400';
  } else {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginBtn.className = 'w-1/2 py-2 text-brand-600 border-b-2 border-brand-600';
    regBtn.className = 'w-1/2 py-2 text-slate-400';
  }
}

function showForgotPassword(show) {
  const loginForm = document.getElementById('loginForm');
  const forgotForm = document.getElementById('forgotForm');
  const tabsHeader = document.getElementById('authTabsHeader');

  if (show) {
    loginForm.classList.add('hidden');
    tabsHeader.classList.add('hidden');
    forgotForm.classList.remove('hidden');
  } else {
    forgotForm.classList.add('hidden');
    tabsHeader.classList.remove('hidden');
    loginForm.classList.remove('hidden');
  }
}

function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value;
  showToast(`Instrucciones enviadas a ${email}`);
  closeModal('accountModal');
  showForgotPassword(false);
}

function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const role = document.getElementById('regRole').value;
  
  // Guardar el usuario actual para la sesión
  currentUser = {
    name: name,
    email: email,
    role: role
  };
  localStorage.setItem('unicuartos_user', JSON.stringify(currentUser));
  
  // Guardar el usuario en la lista de todos los usuarios
  let users = JSON.parse(localStorage.getItem('unicuartos_users') || '[]');
  
  // Verificar si el usuario ya existe (por email)
  const existingUser = users.find(u => u.email === email);
  if (!existingUser) {
    users.push({
      name: name,
      email: email,
      role: role,
      registeredAt: new Date().toISOString()
    });
    localStorage.setItem('unicuartos_users', JSON.stringify(users));
  }
  
  closeModal('accountModal');
  updateAuthNav();
  showToast(`¡Bienvenido a UniCuartos, ${currentUser.name}!`);

  if (pendingAction) {
    executePendingAction();
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  currentUser = {
    name: email.split('@')[0],
    email: email,
    role: 'estudiante'
  };
  localStorage.setItem('unicuartos_user', JSON.stringify(currentUser));
  closeModal('accountModal');
  updateAuthNav();
  showToast('Sesión iniciada correctamente.');

  if (pendingAction) {
    executePendingAction();
  }
}

function handleLogout() {
  localStorage.removeItem('unicuartos_user');
  currentUser = null;
  updateAuthNav();
  showToast('Has cerrado sesión exitosamente.');
}

// ==========================================
// CARGA DE DATOS GUARDADOS (SINCRONIZACIÓN)
// ==========================================
function syncPropertiesToCatalog() {
  const properties = JSON.parse(localStorage.getItem('unicuartos_properties') || '[]');
  const catalog = JSON.parse(localStorage.getItem('unicuartos_catalog') || '[]');
  
  const existingIds = new Set(catalog.map(item => item.id));
  
  properties.forEach(prop => {
    if (!existingIds.has(prop.id)) {
      catalog.push({
        id: prop.id,
        title: prop.title,
        price: prop.price,
        type: prop.type,
        location: prop.location,
        desc: prop.requirements || 'Sin descripción',
        image: prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        status: prop.status,
        phone: prop.phone,
        services: prop.services || [],
        address: prop.address || '',
        publisher: prop.publisher || 'Propietario',
        verified: prop.verified || false,
        requirements: prop.requirements || '',
        description: prop.description || prop.requirements || ''
      });
    }
  });
  
  localStorage.setItem('unicuartos_catalog', JSON.stringify(catalog));
}

function loadStoredListingsAndReviews() {
  syncPropertiesToCatalog();
  
  // A. Cargar publicaciones de cuartos desde el catálogo
  const savedRooms = JSON.parse(localStorage.getItem('unicuartos_catalog') || '[]');
  const container = document.getElementById('roomsContainer');
  
  if (container) {
    container.innerHTML = '';
    
    // Mostrar solo 6 anuncios (3 columnas x 2 filas)
    const displayRooms = savedRooms.slice(0, 6);
    
    displayRooms.forEach(room => {
      const newCard = document.createElement('div');
      newCard.className = "room-item bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 transition group flex flex-col cursor-pointer";
      newCard.setAttribute('data-location', room.location);
      newCard.setAttribute('data-price', room.price.toString().replace(/[^0-9]/g, ''));
      newCard.setAttribute('data-type', room.type);
      newCard.setAttribute('data-id', room.id);

      const isVerified = room.verified || false;
      const verifiedBadge = isVerified ? 
        `<span class="absolute top-3 left-3 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">✓ Verificado</span>` :
        '';

      // Verificar si está en favoritos
      const favorites = JSON.parse(localStorage.getItem('unicuartos_favorites') || '[]');
      const isFav = favorites.some(f => f.id == room.id);
      const favIconClass = isFav ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart';

      newCard.innerHTML = `
        <div class="relative h-52 overflow-hidden bg-slate-200">
          <img src="${room.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'">
          ${verifiedBadge}
          <span class="absolute top-3 left-3 ${isVerified ? 'hidden' : ''} bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">Nuevo</span>
          <button onclick="event.stopPropagation(); toggleFavoriteFromCard('${room.id}', this)" class="absolute top-3 right-3 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center shadow transition favorite-btn" data-room-id="${room.id}">
            <i class="${favIconClass} text-sm"></i>
          </button>
          <div class="absolute bottom-3 left-3 bg-slate-900/90 text-white font-black px-3 py-1 rounded-xl text-lg">
            $${room.price} <span class="text-xs font-normal text-slate-300">/ mes</span>
          </div>
          ${room.status === 'Alquilado' ? `<span class="absolute bottom-3 right-3 bg-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">Alquilado</span>` : ''}
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="font-heading font-bold text-lg text-slate-900">${room.title}</h3>
            <p class="text-xs text-slate-500 mt-1"><i class="fa-solid fa-location-dot text-brand-600 mr-1"></i> ${room.location}</p>
            ${room.publisher ? `<p class="text-[10px] text-slate-400 mt-0.5"><i class="fa-solid fa-user mr-1"></i> Publicado por: ${room.publisher}</p>` : ''}
          </div>
          <div class="flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
            ${room.services && room.services.length > 0 ? room.services.slice(0, 2).map(s => `<span class="bg-slate-100 px-2 py-1 rounded"><i class="fa-solid fa-check text-teal-600 mr-1"></i> ${s}</span>`).join('') : ''}
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium"><i class="fa-solid fa-walking text-brand-600 mr-1"></i> ${room.address || 'Cerca de la UP'}</span>
            <a href="producto.html?room=${room.id}" class="text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg inline-block">
              Ver Información
            </a>
          </div>
        </div>
      `;
      
      // Click en la tarjeta para ir al detalle
      newCard.addEventListener('click', function(e) {
        // Evitar que se active si se hizo click en el botón de favorito o en el enlace
        if (e.target.closest('.favorite-btn') || e.target.closest('a')) return;
        window.location.href = `producto.html?room=${room.id}`;
      });
      
      container.appendChild(newCard);
    });
    
    // Actualizar estados de favoritos
    updateAllFavoriteButtons();
  }

  // B. Cargar reseñas guardadas usando renderModernReviews
  renderModernReviews();
}

// ==========================================
// FAVORITOS (CORAZÓN ROJO) - FUNCIÓN PRINCIPAL
// ==========================================
function toggleFavoriteFromCard(roomId, buttonElement) {
  if (!currentUser) {
    showToast('Inicia sesión para guardar favoritos.');
    return;
  }
  
  if (currentUser.role !== 'estudiante') {
    showToast('Solo los estudiantes pueden guardar favoritos.');
    return;
  }
  
  const catalog = JSON.parse(localStorage.getItem('unicuartos_catalog') || '[]');
  const room = catalog.find(r => r.id == roomId);
  
  if (!room) {
    showToast('No se encontró el cuarto.');
    return;
  }
  
  let favorites = JSON.parse(localStorage.getItem('unicuartos_favorites') || '[]');
  const existsIndex = favorites.findIndex(fav => fav.id == roomId);
  
  const icon = buttonElement.querySelector('i');
  
  if (existsIndex === -1) {
    favorites.push({
      id: room.id,
      title: room.title,
      price: `$${room.price} / mes`,
      location: room.location,
      type: room.type,
      phone: room.phone || '50760000000',
      image: room.image
    });
    localStorage.setItem('unicuartos_favorites', JSON.stringify(favorites));
    icon.className = 'fa-solid fa-heart text-sm text-rose-500';
    showToast('❤️ Cuarto guardado en favoritos');
  } else {
    favorites.splice(existsIndex, 1);
    localStorage.setItem('unicuartos_favorites', JSON.stringify(favorites));
    icon.className = 'fa-regular fa-heart text-sm';
    showToast('Cuarto removido de favoritos');
  }
  
  // Actualizar el contador en el panel del estudiante si está abierto
  if (typeof renderStudentFavorites === 'function') {
    renderStudentFavorites();
  }
}

function updateAllFavoriteButtons() {
  const favorites = JSON.parse(localStorage.getItem('unicuartos_favorites') || '[]');
  const favoriteIds = new Set(favorites.map(f => f.id));
  
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const roomId = btn.getAttribute('data-room-id');
    const icon = btn.querySelector('i');
    if (roomId && favoriteIds.has(parseInt(roomId))) {
      icon.className = 'fa-solid fa-heart text-sm text-rose-500';
    } else if (icon) {
      icon.className = 'fa-regular fa-heart text-sm';
    }
  });
}

// ==========================================
// MODAL DE DETALLE Y FAVORITOS
// ==========================================
function openDetailModal(roomId) {
  const catalog = JSON.parse(localStorage.getItem('unicuartos_catalog') || '[]');
  const room = catalog.find(r => r.id == roomId);
  
  if (!room) {
    showToast('No se encontró el cuarto.');
    return;
  }
  
  document.getElementById('mTitle').innerText = room.title;
  document.getElementById('mPrice').innerText = `$${room.price} / mes`;
  document.getElementById('mLoc').innerText = `${room.location} - ${room.address || 'Cerca de la UP'}`;
  document.getElementById('mDesc').innerHTML = `
    <strong>Descripción:</strong> ${room.desc || room.requirements || 'Sin descripción'}<br>
    <strong>Publicado por:</strong> ${room.publisher || 'Propietario'}<br>
    ${room.status ? `<strong>Estado:</strong> ${room.status}` : ''}
  `;
  document.getElementById('mWaLink').href = `https://wa.me/${room.phone || '50760000000'}?text=Hola,%20estoy%20interesado%20en%20el%20anuncio:%20${encodeURIComponent(room.title)}`;
  
  selectedRoomTemp = room;
  
  updateModalFavoriteButtonState(room.id);
  openModal('detailModal');
}

function selectRoomForStudent() {
  if (!currentUser) {
    closeModal('detailModal');
    requireAuth('select');
    return;
  }
  
  if (!selectedRoomTemp) {
    showToast('No hay cuarto seleccionado.');
    return;
  }
  
  let favorites = JSON.parse(localStorage.getItem('unicuartos_favorites') || '[]');
  const existsIndex = favorites.findIndex(fav => fav.id == selectedRoomTemp.id);
  
  if (existsIndex === -1) {
    favorites.push({
      id: selectedRoomTemp.id,
      title: selectedRoomTemp.title,
      price: `$${selectedRoomTemp.price} / mes`,
      location: selectedRoomTemp.location,
      type: selectedRoomTemp.type,
      phone: selectedRoomTemp.phone || '50760000000',
      image: selectedRoomTemp.image
    });
    localStorage.setItem('unicuartos_favorites', JSON.stringify(favorites));
    showToast('❤️ Cuarto guardado en tus favoritos');
  } else {
    favorites.splice(existsIndex, 1);
    localStorage.setItem('unicuartos_favorites', JSON.stringify(favorites));
    showToast('Cuarto removido de tus favoritos');
  }
  
  updateModalFavoriteButtonState(selectedRoomTemp.id);
  updateAllFavoriteButtons();
}

function updateModalFavoriteButtonState(roomId) {
  const favBtnIcon = document.getElementById('modalFavIcon');
  const favBtnText = document.getElementById('modalFavText');
  
  if (!favBtnIcon) return;
  
  let favorites = JSON.parse(localStorage.getItem('unicuartos_favorites') || '[]');
  const isFav = favorites.some(fav => fav.id == roomId);
  
  if (isFav) {
    favBtnIcon.style.color = '#e11d48';
    favBtnIcon.className = 'fa-solid fa-heart text-sm transition-colors';
    if (favBtnText) favBtnText.innerText = '❤️ Guardado en Favoritos';
  } else {
    favBtnIcon.style.color = '#94a3b8';
    favBtnIcon.className = 'fa-regular fa-heart text-sm transition-colors';
    if (favBtnText) favBtnText.innerText = '🤍 Elegir este anuncio para mi perfil';
  }
}

function toggleFavorite(title) {
  showToast(`Acción rápida en favoritos: ${title}`);
}

// ==========================================
// PUBLICAR NUEVO CUARTO (PROPIETARIO)
// ==========================================
function handlePostRoom(e) {
  e.preventDefault();
  const title = document.getElementById('roomTitle').value;
  const price = document.getElementById('roomPrice').value;
  const type = document.getElementById('roomType').value;
  const location = document.getElementById('roomLocation').value;
  const desc = document.getElementById('roomDesc').value;
  const phone = document.getElementById('roomPhone').value;

  const publisher = currentUser ? currentUser.name : 'Propietario';

  const newRoomData = {
    id: Date.now(),
    title,
    price,
    type,
    location,
    desc,
    phone: phone,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    status: 'Disponible',
    publisher: publisher,
    verified: false,
    services: [],
    address: location,
    requirements: desc,
    description: desc
  };

  let catalog = JSON.parse(localStorage.getItem('unicuartos_catalog') || '[]');
  catalog.unshift(newRoomData);
  localStorage.setItem('unicuartos_catalog', JSON.stringify(catalog));
  
  let properties = JSON.parse(localStorage.getItem('unicuartos_properties') || '[]');
  properties.unshift({
    id: newRoomData.id,
    title: title,
    price: price,
    type: type,
    location: location,
    address: location,
    requirements: desc,
    phone: phone,
    images: [newRoomData.image],
    status: 'Disponible',
    services: [],
    publisher: publisher,
    verified: false,
    description: desc
  });
  localStorage.setItem('unicuartos_properties', JSON.stringify(properties));

  loadStoredListingsAndReviews();
  closeModal('postRoomModal');
  showToast('¡Anuncio publicado con éxito!');
  e.target.reset();
}

// ==========================================
// PUBLICAR RESEÑA
// ==========================================
function handlePostReview(e) {
  e.preventDefault();
  const ratingValue = parseInt(document.getElementById('reviewRating').value);
  const text = document.getElementById('reviewComment').value;

  const newReview = {
    id: Date.now(),
    listing: "Reseña General del Sector / Zona",
    faculty: currentUser ? currentUser.name : 'Estudiante UP',
    rating: ratingValue,
    comment: text,
    date: new Date().toISOString().split('T')[0],
    verified: false
  };

  let reviews = JSON.parse(localStorage.getItem('unicuartos_reviews') || '[]');
  reviews.unshift(newReview);
  localStorage.setItem('unicuartos_reviews', JSON.stringify(reviews));

  renderModernReviews();
  closeModal('postReviewModal');
  showToast('✅ Reseña publicada correctamente');
  e.target.reset();
  
  selectedRating = 0;
  document.querySelectorAll('.rating-star').forEach(star => {
    star.className = 'rating-star fa-regular fa-star text-2xl text-slate-300';
  });
  document.getElementById('ratingLabel').textContent = 'Selecciona';
  document.getElementById('ratingLabel').className = 'text-xs font-bold text-slate-400 ml-2';
}

// ==========================================
// FILTROS DE BÚSQUEDA
// ==========================================
function filterRooms() {
  const loc = document.getElementById('filterLocation').value;
  const price = document.getElementById('filterPrice').value;
  const type = document.getElementById('filterType').value;

  const rooms = document.querySelectorAll('.room-item');
  rooms.forEach(room => {
    const rLoc = room.getAttribute('data-location');
    const rPrice = parseInt(room.getAttribute('data-price'));
    const rType = room.getAttribute('data-type');

    let matchLoc = (loc === 'todos' || rLoc === loc);
    let matchPrice = (price === 'todos' || rPrice <= parseInt(price));
    let matchType = (type === 'todos' || rType === type);

    room.style.display = (matchLoc && matchPrice && matchType) ? 'flex' : 'none';
  });
}

function quickFilter(val) {
  const rooms = document.querySelectorAll('.room-item');
  rooms.forEach(room => {
    if (val === 'todos') {
      room.style.display = 'flex';
    } else {
      const rLoc = room.getAttribute('data-location');
      const rType = room.getAttribute('data-type');
      room.style.display = (rLoc === val || rType === val) ? 'flex' : 'none';
    }
  });
}

// ==========================================
// CARRUSEL / SLIDER
// ==========================================
function setSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  
  if (!slides.length || !dots.length) return;
  
  slides.forEach((slide, i) => {
    slide.style.opacity = i === index ? '1' : '0';
    if (dots[i]) {
      dots[i].className = i === index ? 'slider-dot w-3 h-3 rounded-full bg-white transition' : 'slider-dot w-3 h-3 rounded-full bg-white/40 transition';
    }
  });
  currentSlide = index;
}

let sliderInterval = setInterval(() => {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 0) {
    currentSlide = (currentSlide + 1) % slides.length;
    setSlide(currentSlide);
  }
}, 5000);

// ==========================================
// TOAST NOTIFICACIONES
// ==========================================
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  
  toastMsg.innerText = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// ==========================================
// RENDERIZAR RESEÑAS MODERNAS (SOLO 6)
// ==========================================
function renderModernReviews() {
  const container = document.getElementById('reviewsContainer');
  const countDisplay = document.getElementById('reviewsCountDisplay');
  const noMsg = document.getElementById('noReviewsMsg');
  const pagination = document.getElementById('reviewsPagination');
  
  if (!container) return;
  
  const allReviews = JSON.parse(localStorage.getItem('unicuartos_reviews') || '[]');
  const totalReviews = allReviews.length;
  
  // Mostrar solo las primeras 6 reseñas
  const reviews = allReviews.slice(0, 6);
  
  if (countDisplay) countDisplay.textContent = totalReviews;
  
  // Mostrar/ocultar el botón de "Ver todas"
  if (pagination) {
    if (totalReviews > 6) {
      pagination.classList.remove('hidden');
    } else {
      pagination.classList.add('hidden');
    }
  }
  
  if (reviews.length === 0) {
    container.innerHTML = '';
    if (noMsg) noMsg.classList.remove('hidden');
    if (pagination) pagination.classList.add('hidden');
    return;
  }
  
  if (noMsg) noMsg.classList.add('hidden');
  
  const ratingLabels = ['', 'Muy Malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
  
  container.innerHTML = reviews.map((review, index) => {
    const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const verifiedBadge = review.verified ? 
      '<span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full"><i class="fa-solid fa-check-circle"></i> Verificada</span>' : 
      '<span class="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium"><i class="fa-regular fa-clock"></i> Pendiente</span>';
    
    const ratingLabel = ratingLabels[review.rating] || '';
    const initial = review.faculty ? review.faculty.charAt(0).toUpperCase() : 'E';
    const facultyText = review.faculty || 'Estudiante UP';
    
    return `
      <div class="review-card-modern bg-white rounded-2xl p-6 shadow-sm">
        <div class="relative">
          <i class="fa-solid fa-quote-right review-quote-icon"></i>
          
          <div class="flex items-start gap-4 mb-4">
            <div class="review-avatar w-12 h-12 rounded-full flex items-center justify-center text-brand-600 font-heading font-bold text-lg flex-shrink-0">
              ${initial}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-heading font-bold text-sm text-slate-900">${facultyText}</p>
              <p class="text-[10px] text-slate-400 flex items-center gap-2">
                <span>${review.date || ''}</span>
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                ${verifiedBadge}
              </p>
            </div>
          </div>
          
          <p class="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3">
            "${review.comment}"
          </p>
          
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <div class="flex items-center gap-1">
              <span class="text-xs font-bold text-amber-400">${stars}</span>
              <span class="text-[10px] text-slate-400">${ratingLabel}</span>
            </div>
            <span class="text-[10px] font-medium text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full truncate max-w-[160px]">
              <i class="fa-solid fa-tag mr-1"></i>
              ${review.listing && review.listing !== 'Reseña General del Sector / Zona' ? review.listing : 'Reseña general'}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// CARGAR PUBLICACIONES EN EL SELECTOR
// ==========================================
function loadListingsForReview() {
  console.log('Cargando publicaciones para reseñas...');
  
  let properties = JSON.parse(localStorage.getItem('unicuartos_properties') || '[]');
  
  if (properties.length === 0) {
    let catalog = JSON.parse(localStorage.getItem('unicuartos_catalog') || '[]');
    properties = catalog.map(c => ({
      id: c.id,
      title: c.title,
      price: c.price,
      location: c.location,
      images: c.image ? [c.image] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80']
    }));
    if (properties.length > 0) {
      localStorage.setItem('unicuartos_properties', JSON.stringify(properties));
    }
  }
  
  const select = document.getElementById('reviewListing');
  if (!select) {
    console.error('No se encontró el elemento reviewListing');
    return;
  }
  
  // Limpiar opciones existentes (excepto la primera)
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  if (properties.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '-- No hay publicaciones disponibles --';
    option.disabled = true;
    select.appendChild(option);
    console.log('No hay publicaciones disponibles');
  } else {
    properties.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      const title = room.title || 'Publicación sin título';
      const price = room.price || '0';
      const location = room.location || 'Ubicación no especificada';
      option.textContent = `${title} ($${price}/mes - ${location})`;
      select.appendChild(option);
    });
    console.log(`Cargadas ${properties.length} publicaciones`);
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  updateAuthNav();
  loadStoredListingsAndReviews();
  updateAllFavoriteButtons();
  setSlide(0);
});