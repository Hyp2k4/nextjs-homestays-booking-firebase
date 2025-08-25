# Firebase Setup Guide - Email Verification

## 1. Cấu hình Email Authentication

### Bước 1: Vào Firebase Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Authentication** > **Sign-in method**

### Bước 2: Enable Email/Password Provider
1. Tìm **Email/Password** trong danh sách providers
2. Click vào **Email/Password** để mở cài đặt
3. Toggle **Enable** để bật Email Authentication
4. Toggle **Email link (passwordless sign-in)** nếu muốn
5. Click **Save**

## 2. Cấu hình Authorized Domains

### Bước 1: Thêm Authorized Domains
1. Trong Firebase Console, vào **Authentication** > **Settings**
2. Scroll xuống phần **Authorized domains**
3. Thêm các domain sau:
   - `localhost` (cho development)
   - Domain production của bạn (ví dụ: `yourdomain.com`)
   - `127.0.0.1` (cho development)

## 3. Cấu hình Email Templates

### Bước 1: Customize Email Verification Template
1. Vào **Authentication** > **Templates**
2. Chọn **Email verification**
3. Tùy chỉnh:
   - **Subject**: "Xác thực email tài khoản Homestay Booking"
   - **Message**: Thêm nội dung tiếng Việt
   - **Action URL**: `https://yourdomain.com/auth/verify-email`
4. Click **Save**

### Bước 2: Customize Password Reset Template
1. Chọn **Password reset**
2. Tùy chỉnh:
   - **Subject**: "Đặt lại mật khẩu Homestay Booking"
   - **Message**: Thêm nội dung tiếng Việt
   - **Action URL**: `https://yourdomain.com/auth/reset-password`
3. Click **Save**

## 4. Cấu hình Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Homestays collection
    match /homestays/{homestayId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.hostId || 
         request.auth.uid == request.resource.data.hostId);
    }
    
    // Rooms collection
    match /rooms/{roomId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.hostId || 
         request.auth.uid == request.resource.data.hostId);
    }
  }
}
```

## 5. Environment Variables

### Tạo file `.env.local` trong thư mục `client/`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 6. Troubleshooting

### Lỗi thường gặp:

#### 1. "Email verification required"
**Giải pháp:**
- Kiểm tra spam folder
- Sử dụng nút "Gửi lại email xác thực" trong profile
- Đảm bảo email template đã được cấu hình đúng

#### 4. "Too many requests"
**Giải pháp:**
- Đợi 1 phút trước khi thử lại
- Kiểm tra rate limiting trong Firebase Console

### Testing Email Auth:

#### Development:
1. Sử dụng email thật
2. Kiểm tra email xác thực trong hộp thư
3. Test với nhiều email khác nhau

#### Production:
1. Đảm bảo domain đã được authorize
2. Test với email thật
3. Monitor usage trong Firebase Console

## 7. Monitoring & Analytics

### Firebase Console Monitoring:
1. **Authentication** > **Users**: Xem danh sách users
2. **Authentication** > **Sign-in method**: Monitor sign-in attempts
3. **Firestore** > **Usage**: Monitor database usage

### Logs:
- Check browser console cho client-side errors
- Check Firebase Console logs cho server-side errors

## 8. Security Best Practices

1. **Rate Limiting**: Firebase tự động rate limit
2. **Input Validation**: Code đã validate input
3. **Error Handling**: Đã implement proper error handling
4. **User Permissions**: Firestore rules đã được cấu hình
5. **HTTPS Only**: Đảm bảo production sử dụng HTTPS

## 9. Performance Optimization

1. **Lazy **: Components được lazy load
2. **Caching**: Firebase tự động cache
3. **Offline Support**: Có thể enable offline persistence
4. **Bundle Size**: Chỉ import Firebase modules cần thiết

## 10. Deployment Checklist

- [ ] Enable Email/Password Authentication
- [ ] Add production domain to authorized domains
- [ ] Customize email templates
- [ ] Set up Firestore security rules
- [ ] Configure environment variables
- [ ] Test all authentication flows
- [ ] Monitor error logs
- [ ] Set up analytics (optional)

---

**Lưu ý:** Đảm bảo backup dữ liệu trước khi thay đổi cấu hình Firebase.
