# 📱 Hướng dẫn đổi Logo App

## 🎯 Chuẩn bị file logo

Để thay đổi logo app, bạn cần chuẩn bị các file sau trong thư mục `resources/`:

### **1. Icon (Logo App)**

Đặt file logo với tên: `icon.png`

- **Kích thước**: 1024x1024 px (tối thiểu)
- **Format**: PNG với nền trong suốt
- **Yêu cầu**: Logo nên để trong vùng an toàn 80% giữa ảnh để tránh bị cắt trên các thiết bị

### **2. Splash Screen (Màn hình chờ)**

Đặt file splash với tên: `splash.png`

- **Kích thước**: 2732x2732 px (tối thiểu)
- **Format**: PNG
- **Yêu cầu**: Nội dung chính nên nằm trong vùng an toàn 1200x1200 px ở giữa

## 📁 Cấu trúc thư mục

```
resources/
  ├── icon.png          (1024x1024 px - Logo chính)
  ├── splash.png        (2732x2732 px - Màn hình chờ)
  └── README.md         (File này)
```

## 🚀 Cách generate logo mới

### **Bước 1**: Đặt file `icon.png` và `splash.png` vào thư mục `resources/`

### **Bước 2**: Chạy lệnh generate

```bash
npm run generate-assets
```

Lệnh này sẽ tự động tạo tất cả các kích thước icon và splash screen cần thiết cho Android.

### **Bước 3**: Sync lại Capacitor (nếu cần)

```bash
npx cap sync android
```

### **Bước 4**: Build lại app

```bash
npm run build
npx cap copy android
npx cap open android
```

## 📝 Lưu ý

- Logo sẽ được generate tự động ở nhiều kích thước khác nhau (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Nếu muốn tùy chỉnh thêm, có thể edit trực tiếp trong `android/app/src/main/res/mipmap-*/`
- Logo hiện tại của app nằm trong: `android/app/src/main/res/mipmap-*/ic_launcher.png`

## 🎨 Tips thiết kế logo

1. **Đơn giản**: Logo nên đơn giản, dễ nhận diện ở kích thước nhỏ
2. **Tương phản cao**: Đảm bảo logo nổi bật trên cả nền sáng và tối
3. **Không có text nhỏ**: Tránh text quá nhỏ vì sẽ khó đọc
4. **Vùng an toàn**: Để nội dung chính trong vùng 80% giữa để tránh bị cắt bởi hình tròn hoặc bo góc

## 🔧 Cấu hình nâng cao

Nếu muốn custom thêm, có thể tạo file `assets.config.json` trong thư mục gốc:

```json
{
  "iconBackgroundColor": "#1a1a1a",
  "iconBackgroundColorDark": "#1a1a1a",
  "splashBackgroundColor": "#1a1a1a",
  "splashBackgroundColorDark": "#1a1a1a",
  "android": {
    "iconForegroundScale": 0.8,
    "splashShowSpinner": true
  }
}
```
