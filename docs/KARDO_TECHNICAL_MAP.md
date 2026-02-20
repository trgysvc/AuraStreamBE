# Kardoapp Deep Analysis & Technical Mapping

## 1. Menü Yapısı (Navigation Map)

### A. Şube & Finans Paneli (HQ Dashboard)
- **Anasayfa (Pano)**: Genel ciro ve operasyonel özet.
- **Şubeler**: Şube bazlı ciro, ödeme yöntemleri (Nakit, KK, Mobil) ve iptal/ikram raporları.
- **Muhasebe Kayıtları**: Gelir-gider takibi.
- **Abonelik**: Kardoapp servis faturaları.

### B. POS Ayarları (The Engine)
- **Menü Yönetimi**: Kategoriler (Sıcak İçecekler, Pasta vb.) ve alt kategoriler (Klasikler, Spesiyaller).
- **Ürün Ayarları**: Opsiyonel ürünler (ekstralar), zorunlu seçim grupları (şeker, süt seçimi vb.).
- **Ödeme & İndirim**: Ödeme yöntemleri tanımlama, indirim türleri (yüzdesel, tutarsal).
- **Donanım**: Tanımlı cihazlar, terminaller ve mutfak yazıcıları yönetimi.
- **Operasyonel Kurallar**:
    - "Ödeme tamamlanınca masayı kapat" otomatiği.
    - "Sipariş girilince yazdır" tetikleyicisi.
    - "Masa değişikliğinde/birleşmesinde yazdır" kuralları.

### C. Personel & Saha Yönetimi
- **Yönetici & Personel**: Rol tanımlama ve personel listesi.
- **Mesai / Mola QR**: Fiziksel takip sistemi.
- **Görevler**: Personele atanan operasyonel iş listeleri.
- **Denetim**: Operasyon anketleri ve denetim soruları (kalite kontrol).

### D. Satış Ekranı (POS Terminal)
- **Masa Planı (Layout)**: Fiziksel masa yerleşimi.
- **Hızlı Satış**: Masa açmadan hızlı ürün geçişi.
- **Paket Servis**: Kurye atama ve adres yönetimi.

---

## 2. Veritabanı Şeması İçin Kritik Çıkarımlar

Kardo'nun başarısı şu veri ilişkilerinde yatıyor:
- **`Tenant` (Şirket)**: Global ayarların ve logonun sahibi.
- **`Branch` (Şube)**: Cironun ve personelin mühürlendiği yer.
- **`Recursive Categories`**: Sınırsız derinlikte menü hiyerarşisi.
- **`Rule Engine (JSONB)`**: Yazıcı davranışları ve POS yönlendirmelerinin saklandığı esnek ayar seti.

---

## 3. AuraFleet İçin Geliştirme Notları (UX Improvement)
- **Next.js Hızı**: Kardo'daki sayfa geçişleri klasik bir web uygulaması gibi, biz bunu "Instant Navigation" (App Router) ile çok daha akıcı hale getirebiliriz.
- **Visual Table Map**: Masaların yerleşimini sürükle-bırak (Drag & Drop) kütüphaneleriyle daha modern bir haritaya dönüştürebiliriz.
- **Unified Sync**: Kardo'daki "Kardo Servisi Gerekli" (Yazıcı iletişimi) kısmını, doğrudan tarayıcı üzerinden çalışan bir `WebSocket-to-USB` köprüsüyle daha hafif kurabiliriz.

---
*Analiz Tamamlandı. Veritabanı tablolarını oluşturmaya hazırız.*
