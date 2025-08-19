rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /homestays/{homestayId} {
      // Cho phép đọc nếu homestay active hoặc là chủ sở hữu
      allow read: if resource.data.isActive || 
                   request.auth.uid == resource.data.hostId;
      
      // Chỉ host hoặc admin được chỉnh sửa
      allow write: if request.auth.uid == resource.data.hostId ||
                   request.auth.token.admin == true;
    }
  }
}