// Автообновление: проверяем версию файла каждые 30 секунд
(function autoReload() {
    const CHECK_INTERVAL = 30000; // 30 секунд
    let lastModified = null;

    async function checkForUpdate() {
        try {
            const response = await fetch(location.href, { method: 'HEAD', cache: 'no-cache' });
            const modified = response.headers.get('last-modified');
            if (lastModified === null) {
                lastModified = modified;
            } else if (modified !== lastModified) {
                location.reload();
            }
        } catch (e) {
            // Нет соединения — пропускаем
        }
    }

    setInterval(checkForUpdate, CHECK_INTERVAL);
})();

// Инициализация кастомных аудиоплееров
document.querySelectorAll('.custom-player').forEach(player => {
    const audioId = player.getAttribute('data-audio-id');
    const audio = document.getElementById(audioId);
    const playBtn = player.querySelector('.play-btn');
    const progressBar = player.querySelector('.progress-bar');
    const progressContainer = player.querySelector('.progress-container');
    const timeDisplay = player.querySelector('.player-time');

    // Форматирование времени в M:SS
    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // Показываем длительность после загрузки метаданных
    audio.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });

    // Play / Pause — останавливаем все остальные плееры
    playBtn.addEventListener('click', () => {
        document.querySelectorAll('audio').forEach(a => {
            if (a !== audio) {
                a.pause();
                const otherPlayer = document.querySelector(`[data-audio-id="${a.id}"]`);
                if (otherPlayer) otherPlayer.classList.remove('playing');
            }
        });

        if (audio.paused) {
            audio.play();
            player.classList.add('playing');
        } else {
            audio.pause();
            player.classList.remove('playing');
        }
    });

    // Обновление прогресс-бара и таймера
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percentage + '%';
            timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });

    // Перемотка по клику на прогресс-бар
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / rect.width;
        if (!isNaN(audio.duration)) {
            audio.currentTime = percentage * audio.duration;
        }
    });

    // Сброс плеера после окончания трека
    audio.addEventListener('ended', () => {
        player.classList.remove('playing');
        progressBar.style.width = '0%';
        audio.currentTime = 0;
    });
});