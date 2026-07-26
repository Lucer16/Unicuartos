// Colores y fuentes personalizadas para Tailwind CSS.
tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            heading: ['Outfit', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#f0fdfa',
              100: '#ccfbf1',
              500: '#14b8a6',
              600: '#0d9488',
              700: '#0f766e',
            },
            accent: {
              400: '#38bdf8',
              500: '#0284c7',
              600: '#0369a1',
            }
          }
        }
      }
    }

// Acordeón de preguntas frecuentes
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

// Toda la lógia de funcionamiento en JavaScript
let currentUser = JSON.parse(localStorage.getItem('unicuartos_user')) || null;
    let pendingAction = null;
    let currentSlide = 0;
    let selectedRoomTemp = null;

    // 1. RENDERIZADO Y NAVEGACIÓN DE USUARIO
    function updateAuthNav() {
      const container = document.getElementById('authNavContainer');
      if (!container) return;

      if (currentUser) {
        const isStudent = currentUser.role === 'estudiante';
        const targetPage = isStudent ? 'panel_estudiante.html' : 'panel_propietario.html';
        const roleLabel = isStudent ? 'Mi Panel' : 'Mi Panel';
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

    // 2. CONTROL DE MODALES Y ACCESO ESTRICTO
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
        openModal('postReviewModal');
      }
      pendingAction = null;
    }

    // 3. AUTENTICACIÓN, REGISTRO Y RECUPERACIÓN
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
      currentUser = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        role: document.getElementById('regRole').value
      };
      localStorage.setItem('unicuartos_user', JSON.stringify(currentUser));
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

    // 4. ACCIONES DE ANUNCIOS Y RESEÑAS
    function openDetailModal(title, price, location, type, desc) {
      document.getElementById('mTitle').innerText = title;
      document.getElementById('mPrice').innerText = price;
      document.getElementById('mLoc').innerText = location;
      document.getElementById('mDesc').innerText = desc;
      document.getElementById('mWaLink').href = `https://wa.me/50760000000?text=Hola,%20estoy%20interesado%20en%20el%20anuncio:%20${encodeURIComponent(title)}`;
      selectedRoomTemp = { title, price, location, type };
      openModal('detailModal');
    }

    function selectRoomForStudent() {
      if (!currentUser) {
        closeModal('detailModal');
        requireAuth('select');
        return;
      }
      localStorage.setItem('unicuartos_selected_room', JSON.stringify(selectedRoomTemp));
      showToast('Anuncio guardado en tu perfil.');
      closeModal('detailModal');
    }

    function handlePostRoom(e) {
      e.preventDefault();
      const title = document.getElementById('roomTitle').value;
      const price = document.getElementById('roomPrice').value;
      const type = document.getElementById('roomType').value;
      const location = document.getElementById('roomLocation').value;
      const desc = document.getElementById('roomDesc').value;

      const container = document.getElementById('roomsContainer');
      const newCard = document.createElement('div');
      newCard.className = "room-item bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 transition group flex flex-col";
      newCard.setAttribute('data-location', location);
      newCard.setAttribute('data-price', price);
      newCard.setAttribute('data-type', type);

      newCard.innerHTML = `
        <div class="relative h-52 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <span class="absolute top-3 left-3 bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">Nuevo</span>
          <div class="absolute bottom-3 left-3 bg-slate-900/90 text-white font-black px-3 py-1 rounded-xl text-lg">
            $${price} <span class="text-xs font-normal text-slate-300">/ mes</span>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="font-heading font-bold text-lg text-slate-900">${title}</h3>
            <p class="text-xs text-slate-500 mt-1"><i class="fa-solid fa-location-dot text-brand-600 mr-1"></i> ${location}</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">Directo con Propietario</span>
            <button onclick="openDetailModal('${title}', '$${price} / mes', '${location}', '${type}', '${desc}')" class="text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg">
              Ver Contacto
            </button>
          </div>
        </div>
      `;

      container.prepend(newCard);
      closeModal('postRoomModal');
      showToast('¡Anuncio publicado con éxito!');
      e.target.reset();
    }

    function handlePostReview(e) {
      e.preventDefault();
      const rating = '⭐'.repeat(document.getElementById('reviewRating').value);
      const text = document.getElementById('reviewText').value;

      const container = document.getElementById('reviewsContainer');
      const reviewElem = document.createElement('div');
      reviewElem.className = 'bg-white p-4 rounded-2xl border border-slate-200 space-y-2';
      reviewElem.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="font-bold text-slate-800 text-xs">${currentUser ? currentUser.name : 'Estudiante'}</span>
          <span class="text-amber-400 text-xs">${rating}</span>
        </div>
        <p class="text-xs text-slate-600">"${text}"</p>
      `;
      container.prepend(reviewElem);
      closeModal('postReviewModal');
      showToast('Reseña agregada correctamente.');
    }

    function toggleFavorite(title) {
      showToast(`Guardado en favoritos: ${title}`);
    }

    // 5. FILTROS
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

    // 6. CARRUSEL
    function setSlide(index) {
      const slides = document.querySelectorAll('.hero-slide');
      const dots = document.querySelectorAll('.slider-dot');
      slides.forEach((slide, i) => {
        slide.style.opacity = i === index ? '1' : '0';
        dots[i].className = i === index ? 'slider-dot w-3 h-3 rounded-full bg-white transition' : 'slider-dot w-3 h-3 rounded-full bg-white/40 transition';
      });
      currentSlide = index;
    }

    setInterval(() => {
      currentSlide = (currentSlide + 1) % 3;
      setSlide(currentSlide);
    }, 5000);

    // 7. TOAST NOTIFICACIONES
    function showToast(msg) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      toastMsg.innerText = msg;
      toast.classList.remove('translate-y-20', 'opacity-0');
      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
      }, 3000);
    }

    // Inicialización al cargar la página
    document.addEventListener('DOMContentLoaded', updateAuthNav); 

    //Funciones de la página detalle.html 
let selectedRoom = JSON.parse(localStorage.getItem('unicuartos_selected_room'));

    if (selectedRoom) {
      document.getElementById('detailTitle').innerText = selectedRoom.title;
      document.getElementById('detailPrice').innerText = selectedRoom.price;
      document.getElementById('detailLocation').innerHTML = `<i class="fa-solid fa-location-dot text-teal-600 mr-1"></i> ${selectedRoom.location}`;
      document.getElementById('detailType').innerText = selectedRoom.type;
      document.getElementById('detailDesc').innerText = selectedRoom.desc;
      document.getElementById('detailWaLink').href = `https://wa.me/50760000000?text=Hola,%20estoy%20interesado%20en%20el%20anuncio:%20${encodeURIComponent(selectedRoom.title)}`;
    } else {
      document.querySelector('main').innerHTML = `
        <div class="text-center py-20 space-y-4">
          <h2 class="text-xl font-bold">No se encontró información del cuarto.</h2>
          <a href="index.html" class="inline-block bg-teal-400 text-slate-900 font-bold px-6 py-2.5 rounded-full text-xs">Volver al inicio</a>
        </div>
      `;
    }

    function selectRoomForStudent() {
      let currentUser = JSON.parse(localStorage.getItem('unicuartos_user'));
      if (!currentUser) {
        alert('Debes iniciar sesión para guardar un cuarto en tu perfil.');
        return;
      }
      alert('¡Anuncio guardado en tu perfil correctamente!');
    }

// Función del panel estudiante
// Datos de ejemplo
    let myReviews = [
      {
        id: 1,
        listing: "Habitación Amueblada en El Cangrejo",
        faculty: "Fac. de Ciencias Exactas",
        rating: 5,
        comment: "Súper buena ubicación. Camino solo 5 minutos a la facultad. El área es tranquila de noche y hay un super cerca.",
        date: "2026-02-15"
      },
      {
        id: 2,
        listing: "Cuarto Universitario en Vía Transístmica",
        faculty: "Fac. de Medicina",
        rating: 4,
        comment: "Muy económico y práctico para cruzar la calle e ingresar a la universidad. El ruido de los buses a veces molesta de día, pero vale la pena.",
        date: "2026-01-20"
      }
    ];

    let myFavorites = [
      {
        id: 101,
        title: "Habitación Amueblada en El Cangrejo",
        price: 220,
        location: "El Cangrejo",
        address: "Calle Eusebio A. Morales",
        type: "Individual",
        phone: "50760000000",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 102,
        title: "Estudio Anexo en La Cresta",
        price: 280,
        location: "La Cresta",
        address: "La Cresta, Panamá",
        type: "Individual",
        phone: "50761111111",
        image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
      }
    ];

    let myRoomieAds = [
      {
        id: 201,
        title: "Busco Roomie para compartir apto en El Cangrejo",
        budget: 160,
        location: "El Cangrejo",
        phone: "50762222222",
        career: "Fac. de Informática",
        details: "Estudiante de 3er año busca compañero/a ordenado. El apto ya incluye internet y línea blanca.",
        date: "2026-02-18"
      }
    ];

    // Cambiar entre pestañas
    function switchSection(sec) {
      const revSec = document.getElementById('reviewsSection');
      const favSec = document.getElementById('favoritesSection');
      const rmSec = document.getElementById('roomiesSection');

      const revBtn = document.getElementById('tabReviewsBtn');
      const favBtn = document.getElementById('tabFavsBtn');
      const rmBtn = document.getElementById('tabRoomieBtn');

      const activeStyle = "pb-3 text-brand-600 border-b-2 border-brand-600 transition flex items-center gap-2 whitespace-nowrap";
      const inactiveStyle = "pb-3 text-slate-400 hover:text-slate-600 transition flex items-center gap-2 whitespace-nowrap";

      revSec.classList.add('hidden');
      favSec.classList.add('hidden');
      rmSec.classList.add('hidden');

      revBtn.className = inactiveStyle;
      favBtn.className = inactiveStyle;
      rmBtn.className = inactiveStyle;

      if (sec === 'reviews') {
        revSec.classList.remove('hidden');
        revBtn.className = activeStyle;
      } else if (sec === 'favorites') {
        favSec.classList.remove('hidden');
        favBtn.className = activeStyle;
      } else if (sec === 'roomies') {
        rmSec.classList.remove('hidden');
        rmBtn.className = activeStyle;
      }
    }

    // Renderizar Reseñas
    function renderReviews() {
      const container = document.getElementById('reviewsGrid');
      document.getElementById('reviewCount').innerText = myReviews.length;
      container.innerHTML = '';

      if (myReviews.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No has publicado reseñas aún.</div>`;
        return;
      }

      myReviews.forEach((r, index) => {
        const stars = "⭐".repeat(r.rating);
        const card = `
          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <span class="font-bold text-xs text-slate-900 block line-clamp-1">${r.listing}</span>
                  <span class="text-[10px] text-slate-400 font-medium">${r.faculty} • ${r.date}</span>
                </div>
                <span class="text-amber-400 text-xs font-bold whitespace-nowrap">${stars}</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                "${r.comment}"
              </p>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onclick="openReviewModal(${index})" class="text-xs text-slate-600 hover:text-brand-600 font-bold px-3 py-1 rounded-lg transition">
                <i class="fa-solid fa-pen mr-1"></i> Editar
              </button>
              <button onclick="deleteReview(${index})" class="text-xs text-rose-500 hover:text-rose-700 font-bold px-3 py-1 rounded-lg transition">
                <i class="fa-solid fa-trash mr-1"></i> Eliminar
              </button>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
      });
    }

    // Renderizar Favoritos
    function renderFavorites() {
      const container = document.getElementById('favoritesGrid');
      document.getElementById('favCount').innerText = myFavorites.length;
      container.innerHTML = '';

      if (myFavorites.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No tienes cuartos guardados en favoritos.</div>`;
        return;
      }

      myFavorites.forEach((f, index) => {
        const card = `
          <div class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div class="relative h-44 bg-slate-200">
                <img src="${f.image}" class="w-full h-full object-cover">
                <span class="absolute top-3 right-3 bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  $${f.price} / mes
                </span>
              </div>
              <div class="p-4 space-y-2">
                <h3 class="font-heading font-bold text-sm text-slate-900 line-clamp-1">${f.title}</h3>
                <p class="text-xs text-slate-500"><i class="fa-solid fa-location-dot text-brand-600 mr-1"></i> ${f.address}</p>
              </div>
            </div>

            <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <a href="https://wa.me/${f.phone}" target="_blank" class="flex-1 text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl transition">
                <i class="fa-brands fa-whatsapp mr-1"></i> Contactar
              </a>
              <button onclick="removeFavorite(${index})" class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center text-xs transition" title="Quitar de favoritos">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
      });
    }

    // Renderizar Anuncios de Roomie
    function renderRoomies() {
      const container = document.getElementById('roomiesGrid');
      document.getElementById('roomieCount').innerText = myRoomieAds.length;
      container.innerHTML = '';

      if (myRoomieAds.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No tienes anuncios de roomie activos.</div>`;
        return;
      }

      myRoomieAds.forEach((item, index) => {
        const card = `
          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-heading font-bold text-sm text-slate-900">${item.title}</h3>
                <span class="bg-indigo-50 text-indigo-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap">
                  Max: $${item.budget}/mes
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-medium">
                <i class="fa-solid fa-location-dot mr-1"></i>${item.location} • ${item.career || 'Estudiante'} • ${item.date}
              </p>
              <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                ${item.details}
              </p>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <a href="https://wa.me/${item.phone}" target="_blank" class="text-xs text-emerald-600 font-bold hover:underline">
                <i class="fa-brands fa-whatsapp mr-1"></i> Contacto activo
              </a>
              <button onclick="deleteRoomie(${index})" class="text-xs text-rose-500 hover:text-rose-700 font-bold px-3 py-1 rounded-lg transition">
                <i class="fa-solid fa-trash mr-1"></i> Eliminar
              </button>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
      });
    }

    // Modales Control
    function openReviewModal(index = -1) {
      document.getElementById('reviewForm').reset();
      
      if (index >= 0) {
        document.getElementById('modalTitle').innerText = "Editar Reseña";
        document.getElementById('editIndex').value = index;

        const r = myReviews[index];
        document.getElementById('rListing').value = r.listing;
        document.getElementById('rFaculty').value = r.faculty;
        document.getElementById('rRating').value = r.rating;
        document.getElementById('rComment').value = r.comment;
      } else {
        document.getElementById('modalTitle').innerText = "Escribir Reseña";
        document.getElementById('editIndex').value = -1;
      }

      document.getElementById('reviewModal').classList.remove('hidden');
    }

    function openRoomieModal() {
      document.getElementById('roomieForm').reset();
      document.getElementById('roomieModal').classList.remove('hidden');
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    // Guardar Reseña
    function saveReview(e) {
      e.preventDefault();
      const index = parseInt(document.getElementById('editIndex').value);

      const data = {
        id: index >= 0 ? myReviews[index].id : Date.now(),
        listing: document.getElementById('rListing').value,
        faculty: document.getElementById('rFaculty').value,
        rating: parseInt(document.getElementById('rRating').value),
        comment: document.getElementById('rComment').value,
        date: new Date().toISOString().split('T')[0]
      };

      if (index >= 0) {
        myReviews[index] = data;
      } else {
        myReviews.unshift(data);
      }

      renderReviews();
      closeModal('reviewModal');
    }

    // Guardar Anuncio Roomie
    function saveRoomie(e) {
      e.preventDefault();

      const data = {
        id: Date.now(),
        title: document.getElementById('rmTitle').value,
        budget: document.getElementById('rmBudget').value,
        location: document.getElementById('rmLocation').value,
        phone: document.getElementById('rmPhone').value,
        career: document.getElementById('rmCareer').value,
        details: document.getElementById('rmDetails').value,
        date: new Date().toISOString().split('T')[0]
      };

      myRoomieAds.unshift(data);
      renderRoomies();
      closeModal('roomieModal');
      switchSection('roomies'); // Cambia a la pestaña de roomies tras publicar
    }

    function deleteReview(index) {
      if (confirm('¿Eliminar esta reseña?')) {
        myReviews.splice(index, 1);
        renderReviews();
      }
    }

    function deleteRoomie(index) {
      if (confirm('¿Eliminar este anuncio de búsqueda de roomie?')) {
        myRoomieAds.splice(index, 1);
        renderRoomies();
      }
    }

    function removeFavorite(index) {
      myFavorites.splice(index, 1);
      renderFavorites();
    }

    // Inicialización
    renderReviews();
    renderFavorites();
    renderRoomies();

// Lógica del panel propietario

 // Estado inicial con datos de ejemplo
    let properties = [
      {
        id: 1,
        title: "Habitación Amueblada en El Cangrejo",
        status: "Disponible",
        location: "El Cangrejo",
        address: "Calle Eusebio A. Morales, Edif. Aurora Apto 2B",
        price: 220,
        type: "Individual",
        phone: "60000000",
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
        services: ["Luz, Agua y WiFi incluido", "Amoblado", "Baño individual", "Aire Acondicionado"],
        requirements: "Copia de cédula/pasaporte, matrícula universitaria vigente y depósito equivalente a medio mes."
      },
      {
        id: 2,
        title: "Cuarto Compartido - Vía Transístmica",
        status: "Alquilado",
        location: "Transístmica",
        address: "Vía Transístmica frente a la Puerta Principal",
        price: 140,
        type: "Compartido",
        phone: "61111111",
        images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
        services: ["Luz, Agua y WiFi incluido", "Baño compartido", "Acceso a Cocina"],
        requirements: "Solo estudiantes activos. Pago puntual los 30 de cada mes."
      }
    ];

    let currentImages = [];

    // Cambiar entre Dashboard y Página de Formulario
    function showFormPage(index = -1) {
      document.getElementById('mainDashboard').classList.add('hidden');
      document.getElementById('formPage').classList.remove('hidden');
      window.scrollTo(0, 0);

      document.getElementById('propertyForm').reset();
      currentImages = [];
      document.getElementById('imagePreviewContainer').innerHTML = '';
      validatePrice();

      if (index >= 0) {
        // Modo Edición
        document.getElementById('pageTitle').innerText = "Editar Anuncio";
        document.getElementById('editIndex').value = index;
        
        const p = properties[index];
        document.getElementById('pTitle').value = p.title;
        document.getElementById('pStatus').value = p.status;
        document.getElementById('pLocation').value = p.location;
        document.getElementById('pAddress').value = p.address;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pType').value = p.type;
        document.getElementById('pPhone').value = p.phone;
        document.getElementById('pRequirements').value = p.requirements;

        // Checkboxes de servicios
        document.querySelectorAll('input[name="services"]').forEach(cb => {
          cb.checked = p.services.includes(cb.value);
        });

        // Imágenes existentes
        currentImages = [...p.images];
        renderImagePreviews();
        validatePrice();
      } else {
        // Modo Nuevo
        document.getElementById('pageTitle').innerText = "Publicar Nuevo Cuarto";
        document.getElementById('editIndex').value = -1;
      }
    }

    function showDashboard() {
      document.getElementById('formPage').classList.add('hidden');
      document.getElementById('mainDashboard').classList.remove('hidden');
      window.scrollTo(0, 0);
    }

    // Validar restricción de precio ($350 máx)
    function validatePrice() {
      const priceInput = document.getElementById('pPrice');
      const warning = document.getElementById('priceWarning');
      const submitBtn = document.getElementById('btnSubmit');
      const val = parseFloat(priceInput.value);

      if (val > 350) {
        warning.classList.remove('hidden');
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        warning.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }

    // Renderizar listado de anuncios
    function renderProperties() {
      const container = document.getElementById('propertyGrid');
      container.innerHTML = '';

      if (properties.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No tienes publicaciones aún. Haz clic en "Publicar Nuevo Cuarto".</div>`;
        return;
      }

      properties.forEach((p, index) => {
        const isAvailable = p.status === 'Disponible';
        const badgeColor = isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white';

        const card = `
          <div class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <!-- Imagen + Estado -->
              <div class="relative h-48 bg-slate-200 overflow-hidden">
                <img src="${p.images[0] || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}" class="w-full h-full object-cover">
                <span class="absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full ${badgeColor}">
                  ${p.status}
                </span>
                <span class="absolute top-3 right-3 bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  $${p.price} / mes
                </span>
              </div>

              <!-- Contenido de la tarjeta -->
              <div class="p-5 space-y-3">
                <h3 class="font-heading font-bold text-base text-slate-900 line-clamp-1">${p.title}</h3>
                
                <p class="text-xs text-slate-500 flex items-start gap-1.5">
                  <i class="fa-solid fa-location-dot text-brand-600 mt-0.5"></i>
                  <span><strong>${p.location}:</strong> ${p.address}</span>
                </p>

                <!-- Requisitos enfatizados en Celeste -->
                <div class="bg-sky-50 p-3 rounded-2xl border border-sky-200 text-[11px] text-sky-950">
                  <strong class="text-sky-900 block mb-0.5 font-bold">📋 Requisitos:</strong>
                  <p class="line-clamp-2 leading-relaxed">${p.requirements || 'Sin requisitos específicos.'}</p>
                </div>

                <!-- Servicios -->
                <div class="flex flex-wrap gap-1">
                  ${p.services.map(s => `<span class="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-teal-100">${s}</span>`).join('')}
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button onclick="toggleStatus(${index})" class="text-xs font-bold px-3 py-1.5 rounded-xl border transition ${isAvailable ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}">
                <i class="fa-solid fa-arrows-rotate mr-1"></i> ${isAvailable ? 'Marcar Alquilado' : 'Marcar Disponible'}
              </button>

              <div class="flex gap-1">
                <button onclick="showFormPage(${index})" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 flex items-center justify-center text-xs transition" title="Editar">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button onclick="deleteProperty(${index})" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center text-xs transition" title="Eliminar">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
      });
    }

    // Cambiar estado rápido
    function toggleStatus(index) {
      properties[index].status = properties[index].status === 'Disponible' ? 'Alquilado' : 'Disponible';
      renderProperties();
    }

    // Manejar subida de imágenes (archivos locales a base64 para vista previa)
    function handleImageUpload(e) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
          currentImages.push(evt.target.result);
          renderImagePreviews();
        };
        reader.readAsDataURL(file);
      });
    }

    function renderImagePreviews() {
      const preview = document.getElementById('imagePreviewContainer');
      preview.innerHTML = '';
      currentImages.forEach((src, idx) => {
        preview.innerHTML += `
          <div class="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img src="${src}" class="w-full h-full object-cover">
            <button type="button" onclick="removeImage(${idx})" class="absolute top-1 right-1 bg-slate-900/80 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">✕</button>
          </div>
        `;
      });
    }

    function removeImage(idx) {
      currentImages.splice(idx, 1);
      renderImagePreviews();
    }

    // Guardar (Crear / Editar)
    function saveProperty(e) {
      e.preventDefault();
      const price = parseInt(document.getElementById('pPrice').value);
      
      if (price > 350) {
        alert("El precio debe ser de $350 o menos.");
        return;
      }

      const index = parseInt(document.getElementById('editIndex').value);
      const checkedServices = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);

      const data = {
        id: index >= 0 ? properties[index].id : Date.now(),
        title: document.getElementById('pTitle').value,
        status: document.getElementById('pStatus').value,
        location: document.getElementById('pLocation').value,
        address: document.getElementById('pAddress').value,
        price: price,
        type: document.getElementById('pType').value,
        phone: document.getElementById('pPhone').value,
        images: currentImages.length > 0 ? currentImages : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
        services: checkedServices,
        requirements: document.getElementById('pRequirements').value
      };

      if (index >= 0) {
        properties[index] = data;
      } else {
        properties.unshift(data);
      }

      renderProperties();
      showDashboard();
    }

    // Eliminar anuncio
    function deleteProperty(index) {
      if (confirm('¿Estás seguro de que deseas eliminar este anuncio?')) {
        properties.splice(index, 1);
        renderProperties();
      }
    }

    // Inicializar al cargar
    renderProperties();

// Función de Blog

[
  {
    "id": "que-revisar-antes-de-rentar",
    "titulo": "¿Qué revisar antes de rentar un cuarto universitario?",
    "categoria": "Guía del Estudiante",
    "fecha": "26 de Julio, 2026",
    "tiempo": "5 min",
    "resumen": "Encontrar el lugar ideal va más allá del precio..."
  },
  {
    "id": "contratos-de-alquiler",
    "titulo": "Claves en un contrato de alquiler",
    "categoria": "Legal",
    "fecha": "30 de Julio, 2026",
    "tiempo": "4 min",
    "resumen": "Aprende a identificar cláusulas abusivas..."
  }
]