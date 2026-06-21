# 🌌 UZAY SİMÜLASYONU (Space Simulation)

<img width="1919" height="1079" alt="Ekran görüntüsü 2025-12-07 171730" src="https://github.com/user-attachments/assets/682f2384-c7e7-4599-b173-1c597ee88dc2" />

## 🌍 Proje Hakkında / About The Project

**[TR]**
Bu proje, modern web teknolojileri (Three.js & WebGL) kullanılarak geliştirilmiş, etkileşimli ve ultra gerçekçi bir Güneş Sistemi simülasyonudur. Kullanıcılara hem görsel bir şölen sunmayı hem de ansiklopedik bilgilerle eğitmeyi amaçlar. Standart bir modellemenin ötesinde; özel shader'lar, atmosferik ışık kırılımları ve dinamik yörünge mekanikleri içerir. 

Ayrıca **Lively Wallpaper** desteği sayesinde bu simülasyonu Windows masaüstünüzde etkileşimli, canlı bir 3D duvar kağıdı olarak kullanabilirsiniz!

**[EN]**
This project is an interactive and ultra-realistic Solar System simulation developed using modern web technologies (Three.js & WebGL). It aims to provide both a visual feast and educational value with encyclopedic data. Beyond standard modeling, it features custom shaders, atmospheric refractions, and dynamic orbital mechanics.

Thanks to **Lively Wallpaper** support, you can also use this simulation as an interactive, live 3D desktop wallpaper on Windows!

---

## 🔗 Canlı Demo / Live Demo

Projeyi aşağıdaki bağlantıdan canlı olarak inceleyebilirsiniz:

👉 **Simülasyonu Başlat / Start Simulation:**
**[https://maximusprime77.github.io/gunes-sistemi-simulasyonu/](https://maximusprime77.github.io/gunes-sistemi-simulasyonu/)**

---

## 🖥️ Lively Wallpaper ile Masaüstü Duvar Kağıdı Kullanımı

Bu projeyi bilgisayarınızda hareketli 3D duvar kağıdı yapmak çok kolaydır:

1. **Lively Wallpaper** uygulamasını açın.
2. Proje dizinindeki `index.html` dosyasını sürükleyip Lively Wallpaper kütüphanesine bırakın.
3. Masaüstü modunda Windows/Lively'nin fare tekerleği (`wheel`) ve klavye girdilerini engellemesi sorununu aşmak için özel olarak geliştirdiğimiz **Alternatif Zoom** ve **Arayüz Kontrollerini** kullanabilirsiniz:
   - **Yakınlaştırma Barı (Slider)**: Sol üstteki ayarlar ikonuna (⚙) tıklayarak açılan Kontrol Merkezi içerisindeki **YAKINLAŞTIRMA** çubuğunu sürükleyerek pürüzsüzce yakınlaşıp uzaklaşabilirsiniz.
   - **Klavye Kontrolü**: Masaüstüne boş bir yere tıkladıktan sonra klavyeden **`W` / `S`**, **`Yön Tuşları`** veya **`+` / `-`** tuşlarına basarak zoom yapabilirsiniz.
   - **Shift + Sürükleme**: Klavyeden **`Shift`** tuşuna basılı tutarken fareyi sol tık ile **yukarı/aşağı sürükleyerek** dikey yakınlaşma/uzaklaşma yapabilirsiniz.
   - **Şeffaflık Ayarı**: Kontrol panelindeki **ŞEFFAFLIK** sürükleme çubuğu ile panelleri istediğiniz opaklık düzeyinde (cam efekti) ayarlayabilirsiniz. Bu tercihiniz otomatik olarak kaydedilir (`localStorage`).

---

## 🚀 Özellikler / Features

### 🎨 Görsel & Teknik Detaylar (Visual & Technical)
* **Three.js & WebGL Altyapısı:** Yüksek performanslı 3D render motoru.
* **Özel Shader Yazılımları (GLSL):**
    * 🌞 **Güneş:** Hareketli yüzey ve korona (glow) efekti için özel Vertex/Fragment shader'lar.
    * 🌍 **Atmosfer:** Dünya için gerçekçi atmosferik saçılma ve parlama efektleri.
* **Post-Processing:** `UnrealBloomPass` kullanılarak sinematik parlama ve neon efektleri.
* **Yüksek Çözünürlüklü Dokular:** Gezegen yüzeyleri, bulut katmanları ve yıldız haritası.
* **Optimize Edilmiş Gökyüzü:** Gezegenlerin etrafındaki mavi yörünge çizgileri kaldırılarak gerçekçi derin uzay boşluğu tasarlandı. Asteroid kuşağı taş yoğunluğu performansı artıracak ve gerçeğe uyacak şekilde optimize edildi.

### 🔭 Simülasyon Mekanikleri (Simulation Mechanics)
* **Gerçekçi Yörünge Fiziği:** Her gezegenin güneşe uzaklığına göre hesaplanan göreceli dönüş hızları.
* **İnteraktif Kamera Sistemi:** `OrbitControls` ile serbest dolaşım ve gezegenlere otomatik odaklanma (Focus).
* **Masaüstü Entegrasyon Koruması (Focus Fix)**: Duvar kağıdı modundayken başka bir pencereye (örn. Dosya Yöneticisi) geçiş yapıldığında farenin arkada takılı kalmasını ve istem dışı dönmesini önleyen odak kaybı koruması.

---

## 🛠️ Kurulum / Installation

Projeyi kendi bilgisayarınızda geliştirmek veya çalıştırmak için:

1. Bu repoyu klonlayın:
   ```bash
   git clone https://github.com/MaximusPrime77/gunes-sistemi-simulasyonu.git
   ```
2. Proje klasörüne gidin:
   ```bash
   cd gunes-sistemi-simulasyonu
   ```
3. Bir yerel sunucu başlatın (Python örneği):
   ```bash
   python -m http.server
   ```
4. Tarayıcınızda şu adrese gidin: `http://localhost:8000`

### 💻 Masaüstü Uygulaması Olarak Derlemek (Vite + Electron)
Projeyi bağımsız bir `.exe` masaüstü uygulaması olarak derlemek isterseniz:
1. Gerekli bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Uygulamayı paketleyin:
   ```bash
   npm run dist
   ```
   *Çıktılar `release` klasöründe yer alacaktır.*

---

## 🎮 Kontroller / Controls

| Eylem / Action | Kontrol / Input |
| :--- | :--- |
| **Döndür / Rotate** | Sağ Tık + Sürükle (Right Click + Drag) |
| **Yakınlaş / Zoom** | Sürükle (Zoom Slider) / Tekerlek / W-S Tuşları / Shift + Sürükle |
| **Bilgi Al / Info** | Gezegene Sol Tık (Left Click on Planet) |
| **Odaklan / Focus** | Gezegene Orta Tık (Middle Click on Planet) |

---

## 💻 Teknolojiler / Technologies

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat&logo=javascript)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Engine-black?style=flat&logo=three.js)
![HTML5](https://img.shields.io/badge/HTML5-Structure-orange?style=flat&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Styling-blue?style=flat&logo=css3)
![Electron](https://img.shields.io/badge/Electron-Framework-blue?style=flat&logo=electron)
![Vite](https://img.shields.io/badge/Vite-Bundler-purple?style=flat&logo=vite)

---

### 👤 Yazar / Author

**MaximusPrime77**
* GitHub: [@MaximusPrime77](https://github.com/MaximusPrime77)

---
*License: MIT*
