
import * as THREE from 'three';
import { planetInfo } from '../data/database.js';

export function setupUI(scene, camera, controls, planets, sun, asteroidMesh, state) {
    const pauseBtn = document.getElementById('pauseBtn');
    const lockBtn = document.getElementById('lockBtn');
    const scaleBtn = document.getElementById('scaleBtn');
    const orbitBtn = document.getElementById('orbitBtn');

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
        pauseBtn.onclick = function (e) {
            e.stopPropagation();
            state.isPaused = !state.isPaused;
            window.dispatchEvent(new CustomEvent('simulation-settings-changed'));
        };
    }

    if (speedSlider) {
        speedSlider.oninput = function () {
            state.timeScale = parseFloat(this.value);
            if (speedValueEl) speedValueEl.innerText = state.timeScale + "x";
            window.dispatchEvent(new CustomEvent('simulation-settings-changed'));
        };
    }

    if (opacitySlider) {
        const savedOpacity = localStorage.getItem('panelOpacity');
        if (savedOpacity) {
            opacitySlider.value = savedOpacity;
            if (opacityValueEl) opacityValueEl.innerText = savedOpacity + "%";
            document.documentElement.style.setProperty('--panel-opacity', (parseFloat(savedOpacity) / 100).toString());
        } else {
            document.documentElement.style.setProperty('--panel-opacity', '0.85');
        }

        opacitySlider.oninput = function () {
            const val = this.value;
            if (opacityValueEl) opacityValueEl.innerText = val + "%";
            document.documentElement.style.setProperty('--panel-opacity', (parseFloat(val) / 100).toString());
            localStorage.setItem('panelOpacity', val);
            state.panelOpacity = parseInt(val);
            window.dispatchEvent(new CustomEvent('simulation-settings-changed'));
        };
    }
    if (closeBtn) {
        closeBtn.onclick = function () {
            infoPanel.classList.remove('active');
            if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; }
        };
    }

    const onPointerDown = (event) => {
        // Tıklanan eleman UI elemanı mı (kontrol paneli veya bilgi kartı)?
        // Eğer öyleyse hiçbir şey yapma (kapatma).
        if (event.target.closest('#ui-container') || event.target.closest('#info-panel') || event.target.closest('#menu-toggle-btn') || event.target.closest('#close-btn')) {
            return;
        }

        if (event.button === 1) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Raycasting koordinatları canvas'a (controls.domElement) göre hesaplanmalıdır
        const rect = controls.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Gezegene isabet edip etmediğini kontrol et
        let clickedPlanetMesh = null;
        if (intersects.length > 0) {
            for (let i = 0; i < intersects.length; i++) {
                const obj = intersects[i].object;
                if (obj.type === 'Sprite' || obj.type === 'Line' || obj.type === 'LineLoop' || obj.type === 'Points') continue;
                if (obj.userData.name || (obj.parent && obj.parent.userData.name)) {
                    clickedPlanetMesh = obj;
                    break;
                }
            }
        }

        // Eğer boşluğa tıklandıysa (herhangi bir gezegene tıklanmadıysa)
        if (!clickedPlanetMesh) {
            if (event.button === 0) {
                // Bilgi panelini kapat
                state.focusedPlanet = null;
                infoPanel.classList.remove('active');
                if (state.comparisonMesh) { scene.remove(state.comparisonMesh); state.comparisonMesh = null; }
                
                // Kontrol panelini kapat
                if (uiContainer && uiContainer.classList.contains('active')) {
                    uiContainer.classList.remove('active');
                    if (menuToggleBtn) {
                        menuToggleBtn.classList.remove('active');
                        menuToggleBtn.innerHTML = '⚙';
                    }
                }
            }
            return;
        }

        // Buradan sonrası kilit durumuna bağlıdır
        if (state.isLocked) return;

        let name = clickedPlanetMesh.userData.name || clickedPlanetMesh.parent.userData.name;

        // SOL TIK - Bilgi göster VE hologram için focusedPlanet ayarla
        if (event.button === 0) {
            state.focusedPlanet = clickedPlanetMesh; // Hologram kıyaslama için
            showInfo(name);
        }

        if (event.button === 1) { // ORTA TUŞ (Tekerlek Tıklaması)
            state.focusedPlanet = clickedPlanetMesh;
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
    };

    if (controls.domElement) {
        controls.domElement.addEventListener('pointerdown', onPointerDown, { capture: true });
        // Orta tuş tıklamasını auxclick ile yakalamak en güvenli yoldur
        controls.domElement.addEventListener('auxclick', (e) => {
            if (e.button === 1) onPointerDown(e);
        }, { capture: true });
    }

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

    // ==========================================
    // KESİN ETKİLEŞİM VE ORBİTCONTROLS GÜVENLİK YÖNETİMİ
    // ==========================================
    
    // Kontrollerin kilit durumunu eşitleyen fonksiyon
    const syncOrbitControlsState = () => {
        controls.enabled = !state.isLocked;
    };

    const clearDragLock = () => {
        if (controls.domElement) {
            const upEvent = new PointerEvent('pointerup', { bubbles: false, cancelable: true });
            controls.domElement.dispatchEvent(upEvent);
        }
    };

    if (controls.domElement) {
        // Fare canvas üzerinde hareket ederken güvenlik kontrolü yap
        controls.domElement.addEventListener('pointermove', (event) => {
            if (event.buttons === 0) {
                // Fare serbest dolaşırken kilit açık ise kontrolleri etkin tut
                syncOrbitControlsState();
            } else if (event.buttons === 1 && !controls.enabled) {
                // Dışarıdan sol tık basılı olarak girildiyse (dosya sürükleme) controls kapalı kalır
                controls.enabled = false;
            }
        });

        // Fare canvas'tan ayrıldığında veya tık bırakıldığında sürükleme kilidini temizle
        const deactivateControls = () => {
            clearDragLock();
        };

        controls.domElement.addEventListener('pointerleave', deactivateControls);
        controls.domElement.addEventListener('pointerout', deactivateControls);

        // Kararlı Manuel Tekerlek (Wheel) Zoom Entegrasyonu
        controls.domElement.addEventListener('wheel', (event) => {
            if (state.isLocked) return;
            event.preventDefault();
            
            if (zoomSlider) {
                let currentValue = parseFloat(zoomSlider.value);
                const step = 5; // Pürüzsüz zoom adımı
                if (event.deltaY < 0) {
                    currentValue = Math.min(100, currentValue + step);
                } else {
                    currentValue = Math.max(0, currentValue - step);
                }
                zoomSlider.value = currentValue;
                zoomSlider.oninput(); // Slider olayını manuel tetikle
            }
        }, { passive: false });
    }

    // Pencere veya sekme odağını kaybettiğinde de güvenlik için sürüklemeyi sıfırla
    window.addEventListener('blur', clearDragLock);
    window.addEventListener('focusout', clearDragLock);
    document.addEventListener('visibilitychange', clearDragLock);
    window.addEventListener('pointerup', clearDragLock);

    // ==========================================
    // ETKİLEŞİM VE YENİ BUTONLARIN BAĞLANTILARI
    // ==========================================
    if (lockBtn) {
        lockBtn.onclick = function (e) {
            e.stopPropagation();
            state.isLocked = !state.isLocked;
            window.dispatchEvent(new CustomEvent('simulation-settings-changed'));
        };
    }

    if (scaleBtn) {
        scaleBtn.onclick = function (e) {
            e.stopPropagation();
            state.isTrueScale = !state.isTrueScale;
            window.dispatchEvent(new CustomEvent('simulation-settings-changed'));
        };
    }

    if (orbitBtn) {
        orbitBtn.onclick = function (e) {
            e.stopPropagation();
            state.showOrbits = !state.showOrbits;
            window.dispatchEvent(new CustomEvent('simulation-settings-changed'));
        };
    }

    // ==========================================
    // MERKEZİ UI VE KONTROL GÜNCELLEME SİSTEMİ
    // ==========================================
    function updateUIElements() {
        // Kilit Butonu & controls ayarları
        if (lockBtn) {
            if (state.isLocked) {
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.NONE,
                    MIDDLE: THREE.MOUSE.NONE,
                    RIGHT: THREE.MOUSE.NONE
                };
                controls.enableZoom = false;
                lockBtn.innerHTML = "Etkileşim: Kilitli 🔒";
                lockBtn.classList.remove('unlocked');
                syncOrbitControlsState();
            } else {
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.NONE,
                    RIGHT: THREE.MOUSE.DOLLY
                };
                controls.enableZoom = true;
                lockBtn.innerHTML = "Etkileşim: Açık 🔓";
                lockBtn.classList.add('unlocked');
                syncOrbitControlsState();
            }
        }

        // Durdur/Devam Et
        if (pauseBtn) {
            pauseBtn.innerHTML = state.isPaused ? "Devam Et ▶️" : "Durdur ⏸️";
            if (state.isPaused) pauseBtn.classList.add('active');
            else pauseBtn.classList.remove('active');
        }

        // Gerçekçi Ölçek
        if (scaleBtn) {
            scaleBtn.innerHTML = state.isTrueScale ? "Gerçekçi Ölçek: Açık 🔴" : "Gerçekçi Ölçek: Kapalı 🔘";
            if (state.isTrueScale) scaleBtn.classList.add('active');
            else scaleBtn.classList.remove('active');
        }

        // Yörüngeler
        if (orbitBtn) {
            orbitBtn.innerHTML = state.showOrbits ? "Yörüngeler: Gösteriliyor 🔵" : "Yörüngeler: Gizli 👁️‍🗨️";
            if (state.showOrbits) orbitBtn.classList.add('active');
            else orbitBtn.classList.remove('active');
        }

        // Hız Sürükleyicisi
        if (speedSlider) {
            speedSlider.value = state.timeScale;
            if (speedValueEl) speedValueEl.innerText = state.timeScale + "x";
        }

        // Şeffaflık Sürükleyicisi & CSS Değişkeni
        if (opacitySlider) {
            const opacityVal = state.panelOpacity !== undefined ? state.panelOpacity : 85;
            opacitySlider.value = opacityVal;
            if (opacityValueEl) opacityValueEl.innerText = opacityVal + "%";
            document.documentElement.style.setProperty('--panel-opacity', (opacityVal / 100).toString());
        }

        // Yardım Paneli Durum Uyarısı & Opaklıklar
        const warningEl = document.getElementById('help-status-warning');
        const helpItems = document.querySelectorAll('.help-item');
        if (warningEl) {
            if (state.isLocked) {
                warningEl.innerHTML = "⚠️ ETKİLEŞİM KİLİTLİ: Döndürmek ve Odaklanmak için kilidi açın 🔒";
                warningEl.classList.remove('unlocked');
                warningEl.style.background = "rgba(255, 68, 68, 0.1)";
                warningEl.style.color = "#ff6666";
                warningEl.style.borderColor = "rgba(255, 68, 68, 0.2)";
            } else {
                warningEl.innerHTML = "🎮 ETKİLEŞİM AÇIK: Aşağıdaki kontrolleri kullanabilirsiniz 🔓";
                warningEl.classList.add('unlocked');
                warningEl.style.background = "rgba(0, 200, 100, 0.1)";
                warningEl.style.color = "#00ff88";
                warningEl.style.borderColor = "rgba(0, 200, 100, 0.2)";
            }
        }

        helpItems.forEach(item => {
            if (state.isLocked) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });

        // Lively Wallpaper UI Gizleme/Gösterme Desteği
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const uiContainer = document.getElementById('ui-container');
        if (menuToggleBtn && uiContainer) {
            if (state.showUI === false) {
                menuToggleBtn.style.setProperty('display', 'none', 'important');
                uiContainer.style.setProperty('display', 'none', 'important');
            } else {
                menuToggleBtn.style.removeProperty('display');
                uiContainer.style.removeProperty('display');
            }
        }
    }

    // Custom Event Dinleyici Kaydı
    window.addEventListener('simulation-settings-changed', updateUIElements);

    // Başlangıç Durumunu Uygula
    setTimeout(updateUIElements, 50);

    // showInfo fonksiyonunu dışarı aktar (sinematik tur için)
    return showInfo;
}

