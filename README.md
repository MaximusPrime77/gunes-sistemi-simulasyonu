# 🌌 GÜNEŞ SİSTEMİ SİMÜLASYONU (Solar System Simulation)

<img width="1919" height="1079" alt="Ekran görüntüsü 2025-12-07 171730" src="https://github.com/user-attachments/assets/682f2384-c7e7-4599-b173-1c597ee88dc2" />

## 🌍 Proje Hakkında / About The Project

**[TR]**
Bu proje, modern web teknolojileri (Three.js & WebGL) kullanılarak geliştirilmiş, etkileşimli ve ultra gerçekçi bir Güneş Sistemi simülasyonudur. Kullanıcılara hem görsel bir şölen sunmayı hem de ansiklopedik bilgilerle eğitmeyi amaçlar. Standart bir modellemenin ötesinde; özel shader'lar, atmosferik ışık kırılımları ve dinamik yörünge mekanikleri içerir. 

Ayrıca **Lively Wallpaper** desteği sayesinde bu simülasyonu Windows masaüstünüzde etkileşimli, canlı bir 3D duvar kağıdı olarak en üst düzey performansla kullanabilirsiniz!

**[EN]**
This project is an interactive and ultra-realistic Solar System simulation developed using modern web technologies (Three.js & WebGL). It aims to provide both a visual feast and educational value with encyclopedic data. Beyond standard modeling, it features custom shaders, atmospheric refractions, and dynamic orbital mechanics.

Thanks to **Lively Wallpaper** support, you can also use this simulation as an interactive, live 3D desktop wallpaper on Windows with ultimate performance!

---

## 🔗 Canlı Demo / Live Demo

Proyeyi aşağıdaki bağlantıdan canlı olarak inceleyebilirsiniz:

👉 **[Simülasyonu Başlat / Start Simulation](https://maximusprime77.github.io/gunes-sistemi-simulasyonu/)**

---

## 🖥️ Lively Wallpaper ile Profesyonel Duvar Kağıdı Kullanımı

Bu proje, Lively Wallpaper üzerinde sıfır çakışma ve maksimum performansla çalışacak şekilde özel olarak tasarlanmıştır.

### 1. Kolay Kurulum
1. **Lively Wallpaper** uygulamasını açın.
2. Proje dizinindeki `index.html` dosyasını sürükleyip Lively Wallpaper kütüphanesine bırakın.

### 2. Doğrudan Lively Üzerinden Özelleştirme (Lively Properties)
Projede yer alan `LivelyProperties.json` entegrasyonu sayesinde, duvar kağıdınıza sağ tıklayıp **"Özelleştir" (Customize)** seçeneğini kullanarak şu ayarları doğrudan Lively arayüzünden değiştirebilirsiniz:
* **Masaüstü Etkileşimini Kilitle**: Masaüstü simgelerini taşırken veya seçim yaparken arka planın dönmesini engeller.
* **Arayüzü Göster**: Sol üstteki ayarlar düğmesini ve kontrol panelini tamamen gizleyerek temiz, minimalist bir uzay manzarası sunar.
* **Zamanı Durdur**: Gezegenlerin yörünge hareketlerini duraklatır.
* **Simülasyon Hızı**: Gezegenlerin dönüş hız çarpanını ayarlar (0x - 3x).
* **Gerçekçi Gezegen Ölçeği**: Gezegen boyutlarını ve yörünge mesafelerini gerçekçi bilimsel oranlara dönüştürür.
* **Yörünge Çizgilerini Göster**: Gezegenlerin yörünge izlerini açar/kapatır.
* **Kontrol Paneli Opaklığı**: Panel şeffaflık yüzdesini ayarlar.

### 3. Akıllı Etkileşim ve Güvenlik Sistemi (On-Demand Activation)
* **Sıfır Masaüstü Çakışması**: Masaüstünde dosya sürüklerken veya başka pencereler arasında geçiş yaparken fare simülasyon alanına girse dahi arka plan kesinlikle dönmez. Çünkü sistem, tıklamanın simülasyon üzerinde başlayıp başlamadığını denetleyen `pointerenter` güvenlik mekanizmasına sahiptir.
* **İstek Üzerine Kontrol**: Kilit açıkken (`Etkileşim: Açık 🔓`), evreni döndürme kontrolleri sadece farenin sol tuşuna bastığınız anda anlık olarak etkinleştirilir. Sol tıkı bıraktığınız veya fareyi ekrandan çıkardığınız anda kontroller tamamen kapatılarak işletim sistemiyle çakışmalar önlenir.
* **Boşluğa Tıklayarak Panelleri Kapatma**: Bilgi kartları veya kontrol merkezi açıkken ekrandaki boş uzay boşluğuna sol tıklayarak tüm panelleri pratik bir şekilde kapatabilirsiniz (bu özellik kilit aktifken de çalışır).

---

## 🚀 Özellikler / Features

### 🎨 Görsel & Teknik Detaylar (Visual & Technical)
* **Three.js & WebGL Altyapısı:** Yüksek performanslı 3D render motoru.
* **Türkçe Karakter Desteği:** Arayüzdeki tüm metinler, başlıklar ve bilgi kartları Türkçe karakterleri (Ş, I, Ğ vb.) kusursuz destekleyen modern **Outfit** font ailesi ile yenilenmiştir.
* **Özel Shader Yazılımları (GLSL):**
    * 🌞 **Güneş:** Hareketli yüzey ve korona (glow) efekti için özel Vertex/Fragment shader'lar.
    * 🌍 **Atmosfer:** Dünya için gerçekçi atmosferik saçılma ve parlama efektleri.
* **Post-Processing:** `UnrealBloomPass` kullanılarak sinematik parlama ve neon efektleri.
* **Yüksek Çözünürlüklü Dokular:** Gezegen yüzeyleri, bulut katmanları ve yıldız haritası.

---

## 🎮 Kontroller / Controls

| Eylem / Action | Kontrol / Input |
| :--- | :--- |
| **Etkileşim Kilidi / Interaction Lock** | Kontrol Panelindeki Kilit Butonu veya Lively Özelleştir Menüsü |
| **Döndür / Rotate** | Sol Tık + Sürükle (Left Click + Drag) *(Kilit açıkken / When Unlocked)* |
| **Yakınlaş / Zoom** | Kontrol Panelindeki **YAKINLAŞTIRMA** Kaydırıcısı (Slider) |
| **Bilgi Al / Info** | Gezegene Sol Tık (Left Click on Planet) |
| **Odaklan / Focus** | Gezegene Orta Tık / Tekerlek Tıklaması (Middle Click on Planet) |
| **Panelleri Kapat / Close Panels** | Boş Uzay Boşluğuna Sol Tık (Left Click on Empty Space) |

---

## 💻 Teknolojiler / Technologies

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat&logo=javascript)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Engine-black?style=flat&logo=three.js)
![HTML5](https://img.shields.io/badge/HTML5-Structure-orange?style=flat&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Styling-blue?style=flat&logo=css3)
![Vite](https://img.shields.io/badge/Vite-Bundler-purple?style=flat&logo=vite)

---

### 👤 Yazar / Author

**MaximusPrime77**
* GitHub: [@MaximusPrime77](https://github.com/MaximusPrime77)

---
*License: MIT*
