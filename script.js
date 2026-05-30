// script.js - загрузка данных из JSON и работа с локальным видео
let allSeries = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        allSeries = await response.json();
        renderCards(allSeries);
        setupFiltersAndSearch();
        console.log("✅ Загружено", allSeries.length, "карточек");
    } catch (error) {
        console.error("❌ Ошибка загрузки данных:", error);
        const container = document.getElementById('catalogContainer');
        container.innerHTML = '<div class="no-results">❌ Ошибка загрузки данных. Убедитесь, что файл data.json существует.</div>';
    }
}

function renderCards(seriesArray) {
    const container = document.getElementById('catalogContainer');
    
    if(seriesArray.length === 0) {
        container.innerHTML = '<div class="no-results">😕 Ничего не найдено. Попробуйте изменить фильтр или поиск.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    seriesArray.forEach(series => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${series.poster}" alt="${series.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <h3>${series.title}</h3>
            <p>${series.year} | ${series.genre}</p>
            <span class="rating">⭐ ${series.rating}</span>
        `;
        card.addEventListener('click', () => openPlayer(series));
        container.appendChild(card);
    });
}

function filterAndSearch() {
    const activeGenreBtn = document.querySelector('.filter-btn.active');
    let genre = activeGenreBtn ? activeGenreBtn.dataset.genre : 'all';
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    let filtered = allSeries.filter(series => {
        let matchGenre = (genre === 'all') || series.genre.toLowerCase().includes(genre.toLowerCase());
        let matchSearch = series.title.toLowerCase().includes(searchTerm);
        return matchGenre && matchSearch;
    });
    
    renderCards(filtered);
}

function setupFiltersAndSearch() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndSearch();
        });
    });
    
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', filterAndSearch);
    }
}

function openPlayer(series) {
    const modal = document.getElementById('playerModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalYearRating = document.getElementById('modalYearRating');
    const videoWrapper = document.querySelector('.video-wrapper');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoSource = document.getElementById('videoSource');
    
    // Останавливаем предыдущее видео, если оно было
    if (videoPlayer) {
        videoPlayer.pause();
    }
    
    // Устанавливаем новый источник видео
    videoSource.src = series.videoSrc;
    videoPlayer.load();
    
    // Запускаем видео с небольшой задержкой
    setTimeout(() => {
        videoPlayer.play().catch(e => console.log("Автовоспроизведение заблокировано:", e));
    }, 100);
    
    // Обновляем информацию
    modalTitle.textContent = series.title;
    modalDescription.textContent = series.description;
    modalYearRating.textContent = `${series.year} | ${series.genre} | ⭐ ${series.rating}`;
    
    // Показываем модальное окно
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('playerModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    modal.style.display = 'none';
    
    // Останавливаем видео при закрытии
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    }
}

// Обработчики событий
const closeBtn = document.querySelector('.close');
if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
}

window.onclick = function(event) {
    const modal = document.getElementById('playerModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('playerModal');
        if (modal.style.display === 'block') {
            closeModal();
        }
    }
});

// Запуск при загрузке страницы
window.addEventListener('load', () => {
    loadData();
});