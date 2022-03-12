# Cac buoc thuc hien
1. npm install
2. npm start  => để chạy server lên
3. goto: https://console.cloud.google.com/apis/api/drive.googleapis.com/credentials?project=asim-demo, enable Google drive api 
4. tạo mới một credential cho một webapplication
    4.1 tại phần Authorized redirect URIs, add thêm đường dẫn : http://localhost:3501/auth
    4.2 download file credential về và  lưu vào thành file "credentialweb2.json"
5. bật post man lên và browse api: http://localhost:3501/api/authorize
6. lấy response trả về ở bước 5 và bật trình duyệt lên dán vào và enter
7. làm theo hướng dẫn để ra kết quả là một file token mới => lúc này sẽ được thêm một file tokenweb2.json
8. sau bước 7 là ta đã có đủ thông tin để đi authen google drive.

// upload file len google drive từ nơi khác:

9. call api1: lấy token tạm thời cho việc authen bằng cách fetch google drive nó sẽ trả về response, trong response sẽ có header Authorization.
