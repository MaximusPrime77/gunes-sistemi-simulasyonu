import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ==========================================
// SHADER TANIMLARI
// ==========================================
const sunVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const sunFragmentShader = `
uniform sampler2D globeTexture;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vec4 texColor = texture2D(globeTexture, vUv);
    float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 1.0));
    vec3 glow = vec3(1.0, 0.5, 0.0) * pow(intensity, 3.0);
    gl_FragColor = vec4(texColor.rgb * 1.2 + glow * (0.8 + 0.2*sin(time)), 1.0);
}
`;

const atmosphereVertexShader = `
varying vec3 vNormal;
void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.05);
}
`;
const atmosphereFragmentShader = `
varying vec3 vNormal;
void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
    gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity;
}
`;

// ==========================================
// 1. EĞİTİM VERİTABANI (ANSİKLOPEDİ SEVİYESİ) 📚
// ==========================================
const planetInfo = {
    "Güneş": {
        type: "Yıldız (G Tipi Anakol)",
        temp: "5.500°C (Yüzey) / 15M°C (Çekirdek)",
        diameter: "1.39 Milyon km (109 x Dünya)",
        day: "27 Dünya Günü (Ekvator)",
        year: "230 Milyon Yıl (Galaktik Tur)",
        gravity: "274 m/s² (Dünya'nın 28 katı)",
        atmosphere: "%74 Hidrojen, %24 Helyum",
        life: "İmkansız",
        funFact: "Güneş o kadar büyüktür ki, Güneş Sistemi'ndeki toplam kütlenin %99.86'sını tek başına oluşturur.",
        desc: "Sistemimizin enerji kaynağıdır. Çekirdeğindeki nükleer füzyon sayesinde her saniye 600 milyon ton hidrojeni helyuma dönüştürür. Bu süreçte açığa çıkan enerji, uzaya ısı ve ışık olarak yayılır. Güneş olmasaydı, Dünya donmuş bir buz küresi olurdu."
    },
    "Merkür": {
        type: "Karasal Gezegen",
        temp: "430°C (Gündüz) / -180°C (Gece)",
        diameter: "4.880 km",
        day: "59 Dünya Günü",
        year: "88 Dünya Günü",
        gravity: "3.7 m/s²",
        atmosphere: "Yok (Çok ince Ekzosfer)",
        life: "Olası Değil",
        funFact: "Merkür'de bir yıl, bir günden (kendi ekseni etrafındaki tam dönüşü) daha kısadır.",
        desc: "Güneş'e en yakın ve sistemin en küçük gezegenidir. Atmosferi olmadığı için ısıyı tutamaz; bu yüzden gece ve gündüz arasındaki sıcaklık farkı inanılmaz boyuttadır. Yüzeyi, milyarlarca yıldır süren meteor bombardımanı nedeniyle kraterlerle kaplıdır."
    },
    "Venüs": {
        type: "Karasal Gezegen",
        temp: "464°C (Kurşunu eritebilir)",
        diameter: "12.104 km",
        day: "243 Dünya Günü (Ters Yön)",
        year: "225 Dünya Günü",
        gravity: "8.87 m/s²",
        atmosphere: "%96 Karbondioksit (Çok Yoğun)",
        life: "Zor (Üst atmosferde mikrop ihtimali)",
        funFact: "Venüs, diğer gezegenlerin aksine doğudan batıya (ters) döner. Yani Güneş batıdan doğar.",
        desc: "Gökyüzündeki en parlak gezegen olduğu için 'Çoban Yıldızı' da denir. Yoğun karbondioksit atmosferi, ısıyı hapseden korkunç bir sera etkisi yaratır. Bu yüzden Güneş'e daha yakın olan Merkür'den bile daha sıcaktır."
    },
    "Dünya": {
        type: "Karasal Gezegen",
        temp: "15°C (Ortalama)",
        diameter: "12.742 km",
        day: "23 Saat 56 Dakika",
        year: "365.25 Gün",
        gravity: "9.80 m/s² (1G)",
        atmosphere: "%78 Azot, %21 Oksijen",
        life: "VAR (Bilinen tek yer)",
        funFact: "Dünya tam bir küre değil, kutuplardan basık bir 'Geoid' şeklindedir.",
        desc: "Evrende yaşam barındırdığı bilinen tek gök cismidir. Yüzeyinin %70'i okyanuslarla kaplıdır, bu da ona uzaydan bakıldığında 'Mavi Bilye' görünümü verir. Güçlü manyetik alanı, bizi Güneş'in zararlı radyasyonundan koruyan bir kalkan görevi görür."
    },
    "Ay": {
        type: "Doğal Uydu",
        temp: "-23°C (Ortalama)",
        diameter: "3.474 km",
        day: "27.3 Gün",
        year: "27.3 Gün (Dünya Çevresinde)",
        gravity: "1.62 m/s² (Dünya'nın 1/6'sı)",
        atmosphere: "Yok",
        life: "Yok",
        funFact: "Ay her yıl Dünya'dan yaklaşık 3.8 cm uzaklaşmaktadır. Gelecekte tam Güneş tutulmaları imkansız olacak.",
        desc: "Dünya'nın tek doğal uydusudur. Oluşumuna dair en güçlü teori, Mars büyüklüğünde bir cismin Dünya'ya çarpması sonucu kopan parçaların birleşmesidir. Okyanuslardaki gelgit olaylarının ana sebebidir."
    },
    "Mars": {
        type: "Karasal Gezegen",
        temp: "-65°C (Ortalama)",
        diameter: "6.779 km",
        day: "24 Saat 37 Dakika",
        year: "687 Dünya Günü",
        gravity: "3.71 m/s²",
        atmosphere: "İnce Karbondioksit",
        life: "Geçmişte olabilir / Araştırılıyor",
        funFact: "Güneş sisteminin en yüksek dağı olan Olympus Mons (21km) buradadır. Everest'in 3 katı büyüklüğündedir.",
        desc: "Yüzeyindeki demir oksit (pas) nedeniyle 'Kızıl Gezegen' olarak bilinir. Kutuplarında donmuş su ve karbondioksit buzulları vardır. Dünyaya en çok benzeyen gezegen olduğu için gelecekteki insanlı kolonizasyonun bir numaralı hedefidir."
    },
    "Jüpiter": {
        type: "Gaz Devi",
        temp: "-110°C (Bulut Tepesi)",
        diameter: "139.820 km (11 x Dünya)",
        day: "9 Saat 56 Dakika",
        year: "11.86 Yıl",
        gravity: "24.79 m/s²",
        atmosphere: "Hidrojen, Helyum",
        life: "İmkansız (Uydusu Europa'da olabilir)",
        funFact: "Jüpiter o kadar büyüktür ki, Güneş Sistemi'ndeki diğer tüm gezegenlerin toplam kütlesinden 2.5 kat daha ağırdır.",
        desc: "Gezegenlerin kralı. Katı bir yüzeyi yoktur, tamamen gaz ve sıvıdan oluşur. Üzerindeki meşhur 'Büyük Kırmızı Leke', Dünya'dan daha büyük olan ve en az 300 yıldır devam eden devasa bir fırtınadır. 90'dan fazla uydusu vardır."
    },
    "Satürn": {
        type: "Gaz Devi",
        temp: "-140°C",
        diameter: "116.460 km",
        day: "10 Saat 34 Dakika",
        year: "29.45 Yıl",
        gravity: "10.44 m/s²",
        atmosphere: "Hidrojen, Helyum",
        life: "İmkansız (Uydusu Enceladus'ta olabilir)",
        funFact: "Satürn'ün yoğunluğu sudan düşüktür. Yeterince büyük bir okyanus bulabilseydiniz, Satürn batmaz, yüzerdi.",
        desc: "Muazzam halka sistemiyle tanınır. Bu halkalar milyarlarca buz, toz ve kaya parçasından oluşur; bazıları kum tanesi kadar küçük, bazıları bir otobüs kadar büyüktür. Jüpiter'den sonraki en büyük gezegendir."
    },
    "Uranüs": {
        type: "Buz Devi",
        temp: "-195°C",
        diameter: "50.724 km",
        day: "17 Saat 14 Dakika",
        year: "84 Yıl",
        gravity: "8.69 m/s²",
        atmosphere: "Hidrojen, Helyum, Metan",
        life: "İmkansız",
        funFact: "Uranüs, yörüngesinde 'yuvarlanarak' ilerler. Ekseni 98 derece yatıktır, bu yüzden kutupları 42 yıl güneş, 42 yıl karanlık görür.",
        desc: "Sistemin en soğuk gezegenidir. Atmosferindeki metan gazı, kırmızı ışığı emip mavi ışığı yansıttığı için soluk turkuaz bir renge sahiptir. Çevresinde 13 adet silik halkası vardır."
    },
    "Neptün": {
        type: "Buz Devi",
        temp: "-200°C",
        diameter: "49.244 km",
        day: "16 Saat 6 Dakika",
        year: "165 Yıl",
        gravity: "11.15 m/s²",
        atmosphere: "Hidrojen, Helyum, Metan",
        life: "İmkansız",
        funFact: "Neptün'de rüzgar hızları saatte 2100 km'ye ulaşabilir. Bu, ses hızından daha hızlıdır.",
        desc: "Güneş'e en uzak ana gezegendir. O kadar uzaktır ki, keşfedildiği 1846 yılından bu yana Güneş etrafındaki ilk turunu ancak 2011 yılında tamamlamıştır. Matematiksel hesaplamalarla yeri tahmin edilerek bulunan ilk gezegendir."
    },
    "Ceres": {
        type: "Cüce Gezegen",
        temp: "-105°C",
        diameter: "946 km",
        day: "9 Saat",
        year: "4.6 Yıl",
        gravity: "0.27 m/s²",
        atmosphere: "Yok (Su buharı izleri)",
        life: "Bilinmiyor",
        funFact: "Asteroit kuşağındaki toplam kütlenin üçte birini tek başına Ceres oluşturur.",
        desc: "Mars ve Jüpiter arasındaki Asteroit Kuşağı'nda yer alan en büyük cisimdir. Kendi yerçekimi sayesinde küresel bir şekil alabilmiş tek asteroittir. Yüzeyinin altında donmuş su okyanusu olabileceği düşünülmektedir."
    },
    "Plüton": {
        type: "Cüce Gezegen",
        temp: "-229°C",
        diameter: "2.376 km",
        day: "6.4 Gün",
        year: "248 Yıl",
        gravity: "0.62 m/s²",
        atmosphere: "İnce Azot, Metan",
        life: "İmkansız",
        funFact: "Plüton'un yüzey alanı, Rusya'nın yüzölçümünden biraz daha küçüktür.",
        desc: "2006 yılına kadar 9. gezegen olarak kabul ediliyordu. Kuiper Kuşağı'nın en bilinen üyesidir. Yüzeyinde kalp şeklinde devasa bir nitrojen buzulu (Sputnik Planitia) bulunur. Uydusu Charon ile ikili bir sistem oluşturur."
    },
    "Eris": {
        type: "Cüce Gezegen",
        temp: "-243°C",
        diameter: "2.326 km",
        day: "25.9 Saat",
        year: "557 Yıl",
        gravity: "0.82 m/s²",
        atmosphere: "Donmuş Metan",
        life: "İmkansız",
        funFact: "Eris o kadar uzaktır ki, oradan bakıldığında Güneş sadece parlak bir yıldız gibi görünür.",
        desc: "Plüton ile hemen hemen aynı boyuttadır ancak daha ağırdır. 2005 yılında keşfi, 'gezegen' tanımının değişmesine ve Plüton'un cüce gezegen sınıfına düşürülmesine neden olmuştur."
    },
    "Halley": {
        type: "Kuyruklu Yıldız (Comet)",
        temp: "Güneş'e yaklaştıkça artar",
        diameter: "11 km (Çekirdek)",
        day: "2.2 Gün (Dönüş)",
        year: "76 Yıl (Yörünge)",
        gravity: "Çok Düşük",
        atmosphere: "Gaz ve Toz (Koma)",
        life: "İmkansız",
        funFact: "Ünlü yazar Mark Twain, Halley'in geçtiği yıl doğmuş ve bir sonraki geçişinde hayatını kaybetmiştir.",
        desc: "Tarihin en ünlü kuyruklu yıldızıdır. Kirli bir kar topunu andıran buzlu yapısı, Güneş'e yaklaştıkça ısınır ve milyonlarca kilometre uzunluğunda muhteşem bir gaz/toz kuyruğu oluşturur. İnsan ömründe çıplak gözle iki kez görülebilen tek kısa periyotlu kuyruklu yıldızdır."
    }
};

// ==========================================
// 2. AYARLAR
// ==========================================
let isPaused = false;
let timeScale = 1;
let absoluteTime = 0;
const planets = [];
let asteroidMesh;
// Comet sistemi değişkeni kaldırıldı
let focusedPlanet = null;
let comparisonMesh = null;
let isTrueScale = false;

const pauseBtn = document.getElementById('pauseBtn');
const scaleBtn = document.getElementById('scaleBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValueEl = document.getElementById('speedValue');
const infoPanel = document.getElementById('info-panel');
const closeBtn = document.getElementById('close-btn');
const planetNameEl = document.getElementById('planet-name');
const planetDetailsEl = document.getElementById('planet-details');

// ==========================================
// 3. SAHNE VE KAMERA
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 100, 180);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.maxDistance = 5000;
controls.minDistance = 1.5;
controls.screenSpacePanning = true;

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('');
const loadTextureSafe = (path) => textureLoader.load(path);

// ==========================================
// 4. EFEKTLER
// ==========================================
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.15; bloomPass.strength = 1.2; bloomPass.radius = 0.5;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ==========================================
// 5. AYDINLATMA
// ==========================================
// ==========================================
// 5. AYDINLATMA & ARKAPLAN
// ==========================================
scene.add(new THREE.Mesh(new THREE.SphereGeometry(10000, 64, 64), new THREE.MeshBasicMaterial({ map: loadTextureSafe('./textures/stars.jpg'), side: THREE.BackSide, color: 0x888888 }))); // Arkaplanı biraz kıstık

// Starfield Overlay (Derinlik için)
function createStarfieldOverlay() {
    const geo = new THREE.BufferGeometry();
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 2000;
    for (let i = 0; i < count; i++) sizes[i] = Math.random();

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(geo, mat);
    stars.userData = { type: 'starfield' };
    scene.add(stars);
}
createStarfieldOverlay();

const sunLight = new THREE.PointLight(0xffddaa, 1.5, 0, 0); // Intensity 2.5 -> 1.5 (Göz almaması için kısıldı)
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0001;
scene.add(sunLight);

scene.add(new THREE.AmbientLight(0x404040, 0.4));
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.2));

// ==========================================
// 6. YARDIMCI FONKSİYONLAR
// ==========================================
function createOrbit(radius) {
    const points = []; for (let i = 0; i <= 360; i++) points.push(new THREE.Vector3(Math.cos(i / 360 * Math.PI * 2) * radius, 0, Math.sin(i / 360 * Math.PI * 2) * radius));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbit = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.12 }));
    scene.add(orbit); return orbit;
}

function createDwarfOrbit(radius, tiltX = 0, tiltZ = 0) {
    const points = []; for (let i = 0; i <= 360; i++) points.push(new THREE.Vector3(Math.cos(i / 360 * Math.PI * 2) * radius, 0, Math.sin(i / 360 * Math.PI * 2) * radius));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbit = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.1, dashSize: 1, gapSize: 2 }));
    orbit.rotation.x = tiltX; orbit.rotation.z = tiltZ; scene.add(orbit); return orbit;
}

function createLabel(text) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128; const ctx = c.getContext('2d');
    ctx.font = 'Bold 60px "Segoe UI", sans-serif'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.shadowColor = "black"; ctx.shadowBlur = 8;
    ctx.fillText(text.toUpperCase(), 256, 80);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
    s.scale.set(10, 2.5, 1); return s;
}

function createStarTexture() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const ctx = c.getContext('2d');
    ctx.fillStyle = 'white'; ctx.shadowBlur = 10; ctx.shadowColor = 'white';
    ctx.beginPath(); ctx.ellipse(32, 32, 25, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(32, 32, 2, 25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(32, 32, 6, 0, Math.PI * 2); ctx.fill();
    return new THREE.CanvasTexture(c);
}

function createParticleTexture() {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32; const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'white'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c);
}

// ==========================================
// 7. ASTEROİT & KUYRUKLU YILDIZ
// ==========================================
function createAsteroidBelt() {
    const count = 4000; const geo = new THREE.DodecahedronGeometry(0.2, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8, flatShading: true });
    asteroidMesh = new THREE.InstancedMesh(geo, mat, count); const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2; const r = 36 + Math.random() * 10; const y = (Math.random() - 0.5) * 0.4; // Yükseklik azaltıldı (2 -> 0.4)
        dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        const s = 0.5 + Math.random() * 0.8; dummy.scale.set(s, s, s); dummy.updateMatrix();
        asteroidMesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(asteroidMesh);
}

// Kuyruklu yıldız kaldırıldı (User isteği)

// ==========================================
// 8. GEZEGEN OLUŞTURUCULAR
// ==========================================
function createPlanetSystem(config) {
    const { name, size, texture, distance, speed, ring, color } = config;
    const mat = new THREE.MeshStandardMaterial({
        map: loadTextureSafe(`./textures/${texture}`),
        color: 0xffffff,
        roughness: 0.4, metalness: 0.1,
        emissive: 0x222222, emissiveMap: loadTextureSafe(`./textures/${texture}`), emissiveIntensity: 0.3
    });

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64), mat);
    mesh.userData = { name: name, artisticSize: size, artisticDist: distance, trueSize: size * 0.3, trueDist: distance * 8 };

    if (ring) {
        const rGeo = new THREE.RingGeometry(ring.inner, ring.outer, 128);
        const pos = rGeo.attributes.position; const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) { v3.fromBufferAttribute(pos, i); rGeo.attributes.uv.setXY(i, v3.length() < (ring.inner + ring.outer) / 2 ? 0 : 1, 1); }
        const rMat = new THREE.MeshStandardMaterial({ map: loadTextureSafe(`./textures/${ring.tex}`), side: THREE.DoubleSide, transparent: true, opacity: 0.9, color: 0xffffff });
        const rMesh = new THREE.Mesh(rGeo, rMat); rMesh.rotation.x = -Math.PI / 2; mesh.add(rMesh);
        mesh.userData.ring = rMesh;
    }
    const label = createLabel(name); label.position.set(0, size + 2, 0); mesh.add(label); mesh.userData.label = label;

    if (name === "Dünya") {
        const clouds = new THREE.Mesh(new THREE.SphereGeometry(size + 0.02, 64, 64), new THREE.MeshStandardMaterial({ map: loadTextureSafe('./textures/clouds.jpg'), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
        mesh.add(clouds); mesh.userData.clouds = clouds;

        // ATMOSFER GLOW
        const atmoGeo = new THREE.SphereGeometry(size + 0.15, 64, 64);
        const atmoMat = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader, fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true
        });
        const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
        mesh.add(atmosphere);

        const moon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ map: loadTextureSafe('./textures/moon.jpg'), roughness: 0.6 }));
        moon.userData = { name: "Ay", isMoon: true, parentPlanet: mesh, moonAngle: 0, moonDist: 4 };
        scene.add(moon); planets.push({ mesh: moon, type: 'moon' });
    }
    const orbit = createOrbit(distance);
    planets.push({ mesh: mesh, distance: distance, speed: speed, name: name, type: 'planet', orbit: orbit });
    scene.add(mesh);
}

function createDwarfPlanet(config) {
    const { name, size, texture, color, distance, speed, tiltX, tiltZ } = config;
    let mat;
    if (texture) {
        mat = new THREE.MeshStandardMaterial({ map: loadTextureSafe(`./textures/${texture}`), roughness: 0.8, color: 0xffffff });
    } else {
        mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    }
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 32), mat);
    mesh.userData = { name: name, artisticSize: size, artisticDist: distance, trueSize: size * 0.3, trueDist: distance * 8 };

    const label = createLabel(name); label.scale.set(6, 1.5, 1); label.position.set(0, size + 1, 0); mesh.add(label); mesh.userData.label = label;
    const orbit = createDwarfOrbit(distance, tiltX, tiltZ);
    planets.push({ mesh: mesh, distance: distance, speed: speed, name: name, type: 'dwarf', orbitRef: orbit });
    scene.add(mesh);
}

// ==========================================
// 9. NESNELERİ YARAT
// ==========================================
const sunMat = new THREE.ShaderMaterial({
    uniforms: {
        globeTexture: { value: loadTextureSafe('./textures/sun.jpg') },
        time: { value: 0 }
    },
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader
});
const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), sunMat);
sun.userData = { name: "Güneş", artisticSize: 5 }; scene.add(sun); sun.add(createLabel("Güneş").position.set(0, 7.5, 0));

createPlanetSystem({ name: "Merkür", size: 0.38, texture: "mercury.jpg", distance: 10, speed: 0.04, color: 0xaaaaaa });
createPlanetSystem({ name: "Venüs", size: 0.95, texture: "venus.jpg", distance: 16, speed: 0.025, color: 0xeecb8b });
createPlanetSystem({ name: "Dünya", size: 1.0, texture: "earth.jpg", distance: 24, speed: 0.018, color: 0x2233ff });
createPlanetSystem({ name: "Mars", size: 0.53, texture: "mars.jpg", distance: 32, speed: 0.012, color: 0xc1440e });
createAsteroidBelt();
createDwarfPlanet({ name: "Ceres", size: 0.6, texture: "ceres.jpg", color: 0xaaaaaa, distance: 40, speed: 0.01, tiltX: 0.1, tiltZ: 0 }); // Boyut artırıldı 0.25 -> 0.6
createPlanetSystem({ name: "Jüpiter", size: 4.0, texture: "jupiter.jpg", distance: 55, speed: 0.006, color: 0xc99039 });
createPlanetSystem({ name: "Satürn", size: 3.5, texture: "saturn.jpg", distance: 80, speed: 0.004, color: 0xe3e0c0, ring: { inner: 4.2, outer: 7.5, tex: "saturn_ring.png" } });
createPlanetSystem({ name: "Uranüs", size: 1.8, texture: "uranus.jpg", distance: 100, speed: 0.003, color: 0x4fd0e7 });
createPlanetSystem({ name: "Neptün", size: 1.7, texture: "neptune.jpg", distance: 120, speed: 0.002, color: 0x4b70dd });
createDwarfPlanet({ name: "Plüton", size: 0.6, texture: "pluto.jpg", color: 0xccaacc, distance: 145, speed: 0.0015, tiltX: 0.3, tiltZ: 0.1 }); // Boyut artırıldı 0.3 -> 0.6
createDwarfPlanet({ name: "Eris", size: 0.6, texture: "eris.jpg", color: 0xffffff, distance: 170, speed: 0.001, tiltX: -0.2, tiltZ: 0.2 }); // Boyut artırıldı 0.3 -> 0.6

// ==========================================
// 10. ÖZELLİKLER (HOLOGRAM & ÖLÇEK)
// ==========================================
function toggleComparison() {
    if (!focusedPlanet) return;
    if (comparisonMesh) { scene.remove(comparisonMesh); comparisonMesh = null; return; }

    const geo = new THREE.SphereGeometry(1.0, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.3 });
    comparisonMesh = new THREE.Mesh(geo, mat);
    scene.add(comparisonMesh);
}

function toggleTrueScale() {
    isTrueScale = !isTrueScale;
    scaleBtn.classList.toggle('active');
    scaleBtn.innerHTML = isTrueScale ? "Gerçek Ölçek: AÇIK 🔭" : "Gerçek Ölçek: KAPALI 📏";

    planets.forEach(p => {
        const targetSize = isTrueScale ? p.mesh.userData.trueSize : p.mesh.userData.artisticSize;
        const targetDist = isTrueScale ? p.mesh.userData.trueDist : p.mesh.userData.artisticDist;
        p.mesh.scale.setScalar(targetSize / p.mesh.userData.artisticSize);
        p.distance = targetDist;
        if (p.orbit) p.orbit.scale.setScalar(isTrueScale ? 8 : 1);
        if (p.orbitRef) p.orbitRef.scale.setScalar(isTrueScale ? 8 : 1);
        if (isTrueScale) { if (p.mesh.userData.label) p.mesh.userData.label.visible = false; }
        else { if (p.mesh.userData.label) p.mesh.userData.label.visible = true; }
    });
    if (isTrueScale) { sun.scale.setScalar(0.5); asteroidMesh.visible = false; }
    else { sun.scale.setScalar(1); asteroidMesh.visible = true; }

    if (comparisonMesh) { scene.remove(comparisonMesh); comparisonMesh = null; }
}

// ==========================================
// 11. ETKİLEŞİM (YENİ ODAKLANMA SİSTEMİ)
// ==========================================
if (pauseBtn) { pauseBtn.onclick = function () { isPaused = !isPaused; this.innerHTML = isPaused ? "Devam Et ▶️" : "Durdur ⏸️"; }; }
if (scaleBtn) { scaleBtn.onclick = toggleTrueScale; }
if (speedSlider) { speedSlider.oninput = function () { timeScale = parseFloat(this.value); if (speedValueEl) speedValueEl.innerText = timeScale + "x"; }; }
if (closeBtn) { closeBtn.onclick = function () { infoPanel.classList.remove('active'); if (comparisonMesh) { scene.remove(comparisonMesh); comparisonMesh = null; } }; }

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function showInfo(name) {
    if (name && planetInfo[name]) {
        const data = planetInfo[name];
        planetNameEl.innerText = name;
        planetDetailsEl.innerHTML = `
            <div class="data-row"><span class="label">Tür:</span> <span class="value">${data.type}</span></div>
            <div class="data-row"><span class="label">Çap:</span> <span class="value">${data.diameter}</span></div>
            <div class="data-row"><span class="label">Sıcaklık:</span> <span class="value">${data.temp}</span></div>
            <div class="data-row"><span class="label">Yaşam:</span> <span class="value" style="color:#ffaa00">${data.life}</span></div>
            <button id="compareBtn" style="margin-top:10px; width:100%; background:linear-gradient(90deg, #1CB5E0, #000851); border:none; padding:8px; color:white; border-radius:5px; cursor:pointer;">Dünya ile Kıyasla (Hologram)</button>
            <hr style="border-color:#555; margin:10px 0;">
            <p style="color:#ddd; font-size:13px;">${data.desc}</p>
            <div style="margin-top:10px; background:rgba(255,255,255,0.1); padding:8px; border-radius:5px; font-size:12px; font-style:italic; color:#aaddff;">💡 ${data.funFact}</div>
        `;
        infoPanel.classList.add('active');
        document.getElementById('compareBtn').onclick = toggleComparison;
    }
}

window.addEventListener('pointerdown', (event) => {
    if (event.target.closest('#info-panel') || event.target.closest('#ui-container')) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length === 0) {
        if (event.button === 0) { focusedPlanet = null; infoPanel.classList.remove('active'); if (comparisonMesh) { scene.remove(comparisonMesh); comparisonMesh = null; } }
        return;
    }

    for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.type === 'Sprite' || obj.type === 'Line' || obj.type === 'LineLoop' || obj.type === 'Points') continue;

        if (obj.userData.name || (obj.parent && obj.parent.userData.name)) {
            let name = obj.userData.name || obj.parent.userData.name;
            if (event.button === 0) showInfo(name);
            if (event.button === 1) { // ORTA TUŞ
                focusedPlanet = obj;
                const targetPos = new THREE.Vector3();
                focusedPlanet.getWorldPosition(targetPos);

                // KAMERAYI IŞINLA (YAKLAŞ)
                // Şu anki scale'i al (TrueScale veya Normal)
                const currentScale = focusedPlanet.scale.x;
                const realRadius = (focusedPlanet.userData.artisticSize || 1) * currentScale;

                // Gezegenden 5 yarıçap kadar uzakta, hafif yukarıda dur
                const dist = realRadius * 5 + 2;
                const offset = new THREE.Vector3(dist, dist * 0.5, dist);

                camera.position.copy(targetPos).add(offset);
                controls.target.copy(targetPos); // Merkezi gezegene al

                showInfo(name);
            }
            break;
        }
    }
});

// ==========================================
// 12. ANİMASYON DÖNGÜSÜ
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        const speed = timeScale;
        absoluteTime += 0.01 * speed;

        // Shader Time Update
        if (sun.material.uniforms) sun.material.uniforms.time.value += 0.02;

        sun.rotation.y += 0.002 * speed;
        if (asteroidMesh) asteroidMesh.rotation.y += 0.002 * speed;

        // Comet animasyon kodu kaldırıldı

        planets.forEach(p => {
            if (p.type === 'planet') {
                const x = Math.cos(absoluteTime * p.speed * 10) * p.distance;
                const z = Math.sin(absoluteTime * p.speed * 10) * p.distance;
                p.mesh.position.set(x, 0, z);
                p.mesh.rotation.y += 0.02 * speed;
                if (p.mesh.userData.clouds) p.mesh.userData.clouds.rotation.y += 0.025 * speed;
            }
            if (p.type === 'dwarf') {
                const angle = absoluteTime * p.speed * 10;
                const rx = p.orbitRef.rotation.x; const rz = p.orbitRef.rotation.z;
                let x = Math.cos(angle) * p.distance; let z = Math.sin(angle) * p.distance;
                let y1 = -z * Math.sin(rx); let z1 = z * Math.cos(rx);
                let x2 = x * Math.cos(rz) - (-z * Math.sin(rx)) * Math.sin(rz);
                let y2 = x * Math.sin(rz) + (-z * Math.sin(rx)) * Math.cos(rz);
                p.mesh.position.set(x2, y2, z1); p.mesh.rotation.y += 0.02 * speed;
            }
            if (p.type === 'moon') {
                const parent = p.mesh.userData.parentPlanet;
                const dist = p.mesh.userData.moonDist;
                p.mesh.userData.moonAngle += 0.05 * speed;
                p.mesh.position.set(parent.position.x + Math.cos(p.mesh.userData.moonAngle) * dist, 0, parent.position.z + Math.sin(p.mesh.userData.moonAngle) * dist);
                p.mesh.rotation.y += 0.01 * speed;
            }
        });
    }

    if (focusedPlanet && comparisonMesh) {
        const targetPos = new THREE.Vector3();
        focusedPlanet.getWorldPosition(targetPos);
        const currentScale = focusedPlanet.scale.x;
        const planetRadius = (focusedPlanet.userData.artisticSize || 1) * currentScale;
        const earthRadius = 1.0 * (isTrueScale ? 0.3 : 1.0);
        const offset = planetRadius + earthRadius + 2.0;
        comparisonMesh.position.copy(targetPos).x += offset;
        comparisonMesh.scale.setScalar(isTrueScale ? 0.3 : 1.0);
    }

    if (focusedPlanet) {
        const targetPos = new THREE.Vector3();
        focusedPlanet.getWorldPosition(targetPos);
        controls.target.copy(targetPos);
    }

    controls.update();
    composer.render();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();