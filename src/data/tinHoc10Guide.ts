export interface ErrorTypeInfo {
  type: string;
  vietnameseName: string;
  badgeColor: string;
  commonCause: string;
  curriculumLesson: string;
  example: string;
  socraticHint: string;
}

export const TIN_HOC_10_ERROR_TYPES: ErrorTypeInfo[] = [
  {
    type: 'SyntaxError',
    vietnameseName: 'Lỗi cú pháp',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    commonCause: 'Viết sai quy tắc ngữ pháp của Python (quên dấu hai chấm :, đóng/mở ngoặc đơn () thiếu, dùng nhầm dấu = trong if,...).',
    curriculumLesson: 'Bài 19, 20, 29 (Nhận biết lỗi chương trình)',
    example: 'for i in range(5)  # Thiếu dấu :',
    socraticHint: 'Hãy quan sát dấu câu ở cuối câu lệnh cấu trúc hoặc các cặp ngoặc đơn đóng mở.',
  },
  {
    type: 'IndentationError',
    vietnameseName: 'Lỗi thụt lề (thụt dòng)',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    commonCause: 'Khối lệnh con bên trong if, else, for, while, def không thụt lùi đều đặn (thường là 4 dấu cách hoặc 1 phím Tab).',
    curriculumLesson: 'Bài 19, 20 (Quy ước thụt lề trong Python)',
    example: 'if a > 0:\nprint("Dương") # Chưa thụt lề',
    socraticHint: 'Dòng lệnh này trực thuộc khối lệnh nào và nó cần được lùi vào mấy khoảng trắng?',
  },
  {
    type: 'NameError',
    vietnameseName: 'Lỗi tên biến / hàm không tồn tại',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    commonCause: 'Gọi tên biến hoặc hàm chưa được khởi tạo, hoặc viết sai chính tả, sai hoa/thường (Tong vs tong).',
    curriculumLesson: 'Bài 17: Biến và lệnh gán',
    example: 'print(x) # Khi chưa có x = ...',
    socraticHint: 'Tên biến xuất hiện ở đây đã được tạo hoặc gán giá trị ở các dòng phía trước chưa, và các chữ hoa/thường đã khớp nhau chưa?',
  },
  {
    type: 'TypeError',
    vietnameseName: 'Lỗi kiểu dữ liệu không tương thích',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    commonCause: 'Thực hiện phép toán giữa hai kiểu dữ liệu không tương thích (ví dụ cộng chuỗi str với số nguyên int sau khi dùng input()).',
    curriculumLesson: 'Bài 18: Các lệnh vào ra đơn giản & Kiểu dữ liệu',
    example: '"Tuổi: " + 16 # Không thể cộng str với int',
    socraticHint: 'Hàm input() trả về dữ liệu kiểu gì và em cần làm gì để chuyển nó về kiểu số tính toán được?',
  },
  {
    type: 'ValueError',
    vietnameseName: 'Lỗi giá trị dữ liệu',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    commonCause: 'Chuyển đổi kiểu dữ liệu nhưng giá trị không phù hợp (ví dụ int("abc") hoặc int("3.14")).',
    curriculumLesson: 'Bài 18: Các kiểu dữ liệu cơ bản',
    example: 'n = int("3.5") # int không thể ép chuỗi số thực trực tiếp',
    socraticHint: 'Giá trị người dùng nhập vào có đúng định dạng số nguyên mà hàm int() có thể chuyển đổi được không?',
  },
  {
    type: 'IndexError',
    vietnameseName: 'Lỗi chỉ số vượt phạm vi',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    commonCause: 'Truy cập chỉ số phần tử trong xâu ký tự (str) hoặc danh sách (list) lớn hơn hoặc bằng độ dài của nó (chỉ số tính từ 0).',
    curriculumLesson: 'Bài 22: Kiểu dữ liệu danh sách & Bài 24: Xâu ký tự',
    example: 'a = [1, 2, 3]\nprint(a[3]) # Danh sách chỉ có chỉ số 0, 1, 2',
    socraticHint: 'Trong Python, phần tử đầu tiên của danh sách có chỉ số là mấy và phần tử cuối cùng có chỉ số tối đa là bao nhiêu?',
  },
  {
    type: 'ZeroDivisionError',
    vietnameseName: 'Lỗi chia cho số 0',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    commonCause: 'Thực hiện phép chia (/) hoặc chia lấy phần dư (%) cho số 0.',
    curriculumLesson: 'Bài 18: Các phép toán số học',
    example: 'x = 10 / 0',
    socraticHint: 'Trong toán học và lập trình, mẫu số của phép chia có được phép bằng 0 không và em cần thêm điều kiện kiểm tra nào?',
  },
];
