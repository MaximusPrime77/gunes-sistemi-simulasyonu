
import * as THREE from 'three';
import { planetInfo } from '../data/database.js';

export function setupUI(scene, camera, controls, planets, sun, asteroidMesh, state) {
    const pauseBtn = document.getElementById('pauseBtn');

    const speedSlider = document.getElementById('speedSlider');
    const speedValueEl = document.getElementById('speedValue');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValueEl = document.getElementById('opacityValue');
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomValueEl = document.getElementById('zoomValue');
    const infoPanel = document.getElementById('info-panel');
    const closeBtn = document.getElementById('close-btn');
    const planetNameEl = document.getElementById('planet-name');
    const planetDetailsEl = document.getElementById('planet-details');

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function toggleComparison() {
        if (!state.focusedPlanet) return;
        if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; return; }

        const geo = new THREE.SphereGeometry(1.0, 32, 32);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.3 });
        state.comparisonMesh = new THREE.Mesh(geo, mat);
        scene.add(state.comparisonMesh);
    }



    function showInfo(name) {
        if (name && planetInfo[name]) {
            const data = planetInfo[name];
            planetNameEl.innerText = name;

            // Zengin veri tablosu formatı
            planetDetailsEl.innerHTML = `
                <table class="info-table">
                    <tr><td class="label">Tür</td><td class="value">${data.type}</td></tr>
                    <tr><td class="label">Çap</td><td class="value">${data.diameter}</td></tr>
                    <tr><td class="label">Sıcaklık</td><td class="value">${data.temp}</td></tr>
                    <tr><td class="label">Yerçekimi</td><td class="value">${data.gravity || '—'}</td></tr>
                    <tr><td class="label">Kaçış Hızı</td><td class="value">${data.escapeVelocity || '—'}</td></tr>
                    <tr><td class="label">Gün Uzunluğu</td><td class="value">${data.day}</td></tr>
                    <tr><td class="label">Yıl Uzunluğu</td><td class="value">${data.year}</td></tr>
                    <tr><td class="label">Atmosfer</td><td class="value">${data.atmosphere || '—'}</td></tr>
                    <tr><td class="label">Keşif</td><td class="value">${data.discoveryDate || 'Tarih öncesi'}</td></tr>
                    <tr><td class="label">Uydu Sayısı</td><td class="value">${data.moons !== undefined ? data.moons : '—'}</td></tr>
                    <tr><td class="label">Yaşam</td><td class="value" style="color:#ffaa00">${data.life}</td></tr>
                </table>
                
                <button id="compareBtn">🌍 Dünya ile Kıyasla</button>
                
                <div class="info-description">
                    <p>${data.desc}</p>
                </div>
                
                <div class="info-funfact">
                    💡 <em>${data.funFact}</em>
                </div>
            `;
            infoPanel.classList.add('active');
            const compareBtn = document.getElementById('compareBtn');
            if (compareBtn) compareBtn.onclick = toggleComparison;


        }
    }

    if (pauseBtn) {
        pauseBtn.onclick = function () {
            state.isPaused = !state.isPaused;
            this.innerHTML = state.isPaused ? "Devam Et ▶️" : "Durdur ⏸️";
        };
    }

    if (speedSlider) {
        speedSlider.oninput = function () {
            state.timeScale = parseFloat(this.value);
            if (speedValueEl) speedValueEl.innerText = state.timeScale + "x";
        };
    }

    if (opacitySlider) {
        const savedOpacity = localStorage.getItem('panelOpacity');
        if (savedOpacity) {
            opacitySlider.value = savedOpacity;
            if (opacityValueEl) opacityValueEl.innerText = savedOpacity + "%";
            document.documentElement.style.setProperty('--panel-opacity', (parseFloat(savedOpacity) / 100).toString());
        } else {
            // Varsayılan değer
            document.documentElement.style.setProperty('--panel-opacity', '0.85');
        }

        opacitySlider.oninput = function () {
            const val = this.value;
            if (opacityValueEl) opacityValueEl.innerText = val + "%";
            document.documentElement.style.setProperty('--panel-opacity', (parseFloat(val) / 100).toString());
            localStorage.setItem('panelOpacity', val);
        };
    }
    if (closeBtn) {
        closeBtn.onclick = function () {
            infoPanel.classList.remove('active');
            if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; }
        };
    }

    window.addEventListener('pointerdown', (event) => {
        if (event.target.closest('#info-panel') || event.target.closest('#ui-container')) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length === 0) {
            if (event.button === 0) {
                state.focusedPlanet = null;
                infoPanel.classList.remove('active');
                if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; }
            }
            return;
        }

        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            if (obj.type === 'Sprite' || obj.type === 'Line' || obj.type === 'LineLoop' || obj.type === 'Points') continue;

            if (obj.userData.name || (obj.parent && obj.parent.userData.name)) {
                let name = obj.userData.name || obj.parent.userData.name;

                // SOL TIK - Bilgi göster VE hologram için focusedPlanet ayarla
                if (event.button === 0) {
                    state.focusedPlanet = obj; // Hologram kıyaslama için
                    showInfo(name);
                }

                if (event.button === 1) { // ORTA TUŞ
                    state.focusedPlanet = obj;
                    const targetPos = new THREE.Vector3();
                    state.focusedPlanet.getWorldPosition(targetPos);

                    // KAMERAYI IŞINLA (YAKLAŞ)
                    const currentScale = state.focusedPlanet.scale.x;
                    const realRadius = (state.focusedPlanet.userData.artisticSize || 1) * currentScale;

                    const dist = realRadius * 5 + 2;
                    const offset = new THREE.Vector3(dist, dist * 0.5, dist);

                    camera.position.copy(targetPos).add(offset);
                    controls.target.copy(targetPos);

                    showInfo(name);
                }
                break;
            }
        }
    });

    // ==========================================
    // KONTROL PANELİ TOGGLE (AÇMA / KAPAMA)
    // ==========================================
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const uiContainer = document.getElementById('ui-container');

    if (menuToggleBtn && uiContainer) {
        menuToggleBtn.onclick = function (e) {
            e.stopPropagation();
            const isActive = uiContainer.classList.toggle('active');
            menuToggleBtn.classList.toggle('active');
            menuToggleBtn.innerHTML = isActive ? '✕' : '⚙';
        };
    }

    // ==========================================
    // MANUEL YAKINLAŞMA/UZAKLAŞMA (ZOOM) ÇÖZÜMLERİ
    // ==========================================
    
    // Alternatif 1: Kontrol Panelindeki YAKINLAŞMA Sliderı
    if (zoomSlider) {
        const min = controls.minDistance || 1.5;
        const max = 350; // Güneş sistemi için ideal maksimum uzaklık limiti

        // Slider kaydırıldığında zoom düzeyini ayarla
        zoomSlider.oninput = function () {
            const pct = parseFloat(this.value) / 100;
            const newDistance = min + (max - min) * (1 - pct); // 100% yakınken mesafe = min, 0% uzakken mesafe = max
            
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            
            camera.position.copy(controls.target).sub(direction.setLength(newDistance));
            controls.update();
            
            if (zoomValueEl) zoomValueEl.innerText = this.value + "%";
        };

        // Diğer yöntemlerle (tekerlek, orta tık) zoom yapıldığında sliderı senkronize et
        controls.addEventListener('change', () => {
            const distance = camera.position.distanceTo(controls.target);
            const normalized = Math.max(0, Math.min(1, (distance - min) / (max - min)));
            const pct = Math.round((1 - normalized) * 100);
            zoomSlider.value = pct;
            if (zoomValueEl) zoomValueEl.innerText = pct + "%";
        });
    }

    // Alternatif 2: Fare Tekerleği (Wheel) ile Zoom
    window.addEventListener('wheel', (event) => {
        const zoomScale = 0.90;
        if (event.deltaY < 0) {
            controls.dollyIn(zoomScale);
        } else {
            controls.dollyOut(zoomScale);
        }
        controls.update();
    }, { passive: true });

    // Alternatif 3: Klavye Tuşları ile Zoom (W / S / Up / Down / + / -)
    let isShiftDown = false;
    let lastMouseY = 0;

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') isShiftDown = true;

        const keyZoomScale = 0.90;
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === '+') {
            controls.dollyIn(keyZoomScale);
            controls.update();
        } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown' || e.key === '-') {
            controls.dollyOut(keyZoomScale);
            controls.update();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') isShiftDown = false;
    });

    // Alternatif 4: Shift + Sol Tık ve Fareyi Sürükleyerek Zoom
    window.addEventListener('pointerdown', (e) => {
        lastMouseY = e.clientY;
    });

    window.addEventListener('pointermove', (event) => {
        if (isShiftDown && event.buttons === 1) { // Shift basılı ve Sol Tık ile sürükleme
            const deltaY = event.clientY - lastMouseY;
            const dragZoomScale = 0.95;
            if (deltaY < 0) {
                // Yukarı sürükleme -> Yakınlaş
                controls.dollyIn(dragZoomScale);
            } else if (deltaY > 0) {
                // Aşağı sürükleme -> Uzaklaş
                controls.dollyOut(dragZoomScale);
            }
            controls.update();
        }
        lastMouseY = event.clientY;
    });

    // ==========================================
    // FOCUS KAYBINDA SÜRÜKLEME KİLİDİNİ ÇÖZ (lost focus drag lock)
    // ==========================================
    const clearDragLock = () => {
        const upEvent = new PointerEvent('pointerup', { bubbles: true, cancelable: true });
        window.dispatchEvent(upEvent);
        document.dispatchEvent(upEvent);
        if (controls.domElement) controls.domElement.dispatchEvent(upEvent);
        isShiftDown = false;
    };

    window.addEventListener('blur', clearDragLock);
    window.addEventListener('focusout', clearDragLock);
    document.addEventListener('visibilitychange', clearDragLock);

    // showInfo fonksiyonunu dışarı aktar (sinematik tur için)
    return showInfo;
}

