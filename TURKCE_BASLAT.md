# 🌙 RüyaGünlük - Türkçe Başlangıç Rehberi

## ✅ Tamamlandı!

Uygulamanız tamamen **Türkçeleştirildi**! 🎉

Tüm arayüz metinleri, butonlar, mesajlar ve etiketler artık Türkçedir.

## 🚀 Hızlı Başlangıç (5 dakika)

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Geliştirme modunda başlat
npm run tauri dev
```

Tauri penceresi açılacak ve uygulamayı göreceksiniz!

## 📋 Türkçeleştirilmiş Özellikler

### 🏠 Ana Sayfa (Home)
- ✅ Başlık: "RüyaGünlük"
- ✅ "Kişisel rüya günlüğünüz"
- ✅ "Yeni Rüya" butonu
- ✅ "Rüya ara..." arama kutusu
- ✅ Tüm ruh halleri: Mutlu, Üzgün, Korkunç, Romantik, Garip, Nötr
- ✅ "Tüm Rüyalar" / "Seçili Gün" seçimi
- ✅ Rüya listesi
- ✅ "Düzenle" ve "Sil" seçenekleri

### ✏️ Rüya Düzenleme Modalı
- ✅ "Yeni Rüya" / "Rüyayı Düzenle" başlıkları
- ✅ "Rüya Başlığı" ve "Rüya Açıklaması"
- ✅ "Tarih & Saat" seçimi
- ✅ "Ruh Hali" seçimi
- ✅ "Yoğunluk" (1-5 yıldız)
- ✅ "Bilinçli Rüya" checkbox
- ✅ "Etiketler" yönetimi
- ✅ "Kaydet" / "İptal Et" butonları

### 📖 Rüya Detayı
- ✅ "Geri" butonu
- ✅ "Düzenle" / "Sil" seçenekleri
- ✅ "Ruh Hali", "Yoğunluk", "Bilinçli Rüya" gösterimi
- ✅ "İçerik" kısmı
- ✅ "Etiketler" listesi
- ✅ "Oluşturulma" ve "Son güncelleme" tarihleri (Türkçe format)

### ⚙️ Ayarlar (Settings)
- ✅ "Ayarlar" başlığı
- ✅ **Yedek Bölümü:**
  - "Yedek & İçe Aktar" başlığı
  - "Dışarı Aktar" butonu
  - "İçe Aktar" butonu
  - Dosya adı: `rüyagunluk-yedek.json`

- ✅ **Güvenlik Bölümü:**
  - "PIN Kilidi" başlığı
  - "PIN kilidi etkin" / "PIN kilidi devre dışı" durumları
  - "Yeni PIN (4-6 haneli)" etiketi
  - "PIN'i Onayla" etiketi
  - "PIN Kilidi Etkinleştir" butonu
  - "PIN Kilidi Devre Dışı Bırak" butonu

- ✅ **Bilgi Bölümü:**
  - "RüyaGünlük Hakkında"
  - Versiyon bilgisi

### 🔒 PIN Kilidi
- ✅ "RüyaGünlük" başlığı
- ✅ "Kilidi açmak için PIN'inizi girin" mesajı
- ✅ PIN giriş alanı
- ✅ "Kilidi Aç" butonu
- ✅ "Doğrulanıyor..." yükleme mesajı
- ✅ Hata mesajları (Türkçe)

### 📅 Takvim
- ✅ Ay gösterimi (Türkçe format)
- ✅ Haftanın günleri: Paz, Pzt, Sal, Çar, Per, Cum, Cmt

## 🛠️ Yapı Değişiklikleri

```json
tauri.conf.json:
- "productName": "RüyaGünlük"
- "identifier": "com.ruyagunluk.app"
- "title": "RüyaGünlük"

index.html:
- <html lang="tr">
- <title>RüyaGünlük - Rüya Günlüğü</title>
```

## 📦 Üretime Hazırlık

macOS ve Windows için paketleme:

```bash
# İkisini de derle
npm run tauri build

# Çıktılar:
# macOS: src-tauri/target/release/bundle/dmg/RüyaGünlük.dmg
#        src-tauri/target/release/bundle/macos/RüyaGünlük.app
# Windows: src-tauri/target/release/RüyaGünlük.msi
```

## ✨ Özet

- 🇹🇷 **Tüm metinler Türkçedir**
- 💾 **Tüm veriler cihazda yerel olarak saklanır**
- 🔐 **PIN koruması (Argon2 hash)**
- 📱 **macOS ve Windows desteği**
- 📋 **JSON yedekleme/içe aktarma**
- 🎨 **Güzel Türkçe UI**

Keyifli kullanımlar! 🎉
