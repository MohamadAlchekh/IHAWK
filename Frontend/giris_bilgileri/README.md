# IHAWK Ekip Kayıt Formu

Bu proje, arama kurtarma ekiplerinin sisteme kayıt olabilmesi için geliştirilmiş bir web formudur.

## Özellikler

- Modern ve kullanıcı dostu arayüz
- Dinamik ekip üyesi ve ekipman ekleme
- Form doğrulama
- Responsive tasarım
- Telefon numarası ve koordinat formatı kontrolü

## Kurulum ve Çalıştırma

1. Python'un bilgisayarınızda kurulu olduğundan emin olun
2. Projeyi bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/your-username/IHAWK.git
   ```
3. `Frontend/giris_bilgileri` klasörüne gidin
4. `start.bat` dosyasını çalıştırın
5. Tarayıcınızda http://localhost:8000 adresini açın

## Geliştirme

- `index.html`: Ana form yapısı
- `styles.css`: Özel CSS stilleri
- `script.js`: Form işlevselliği ve veri yönetimi

## Backend Entegrasyonu

Backend entegrasyonu için `script.js` dosyasında yorum satırı olarak bırakılan fetch kodu kullanılabilir. Backend API'si hazır olduğunda bu kodu aktif hale getirin.

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun 