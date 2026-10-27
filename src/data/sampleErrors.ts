export interface SampleErrorCase {
  id: string;
  title: string;
  lesson: string;
  topic: string;
  code: string;
  errorText: string;
  description: string;
  errorLine: number;
  errorType: string;
}

export const SAMPLE_ERROR_CASES: SampleErrorCase[] = [
  {
    id: 'missing-colon-for',
    title: 'Quên dấu ":" ở cuối câu lệnh lặp for',
    lesson: 'Bài 20: Câu lệnh lặp for',
    topic: 'Vòng lặp trong Python',
    code: `# Chương trình tính tổng các số từ 1 đến n
n = int(input("Nhập n: "))
s = 0
for i in range(1, n + 1)
    s = s + i
print("Tổng là:", s)`,
    errorText: `  File "tong.py", line 4
    for i in range(1, n + 1)
                           ^
SyntaxError: expected ':'`,
    description: 'Học sinh viết vòng lặp for nhưng quên dấu hai chấm ở cuối dòng tiêu đề vòng lặp.',
    errorLine: 4,
    errorType: 'SyntaxError',
  },
  {
    id: 'indentation-error-if',
    title: 'Lỗi thụt lề khối lệnh if-else',
    lesson: 'Bài 19: Câu lệnh rẽ nhánh',
    topic: 'Cấu trúc rẽ nhánh',
    code: `# Kiểm tra số chẵn lẻ
n = int(input("Nhập số nguyên: "))
if n % 2 == 0:
print("Đây là số chẵn")
else:
print("Đây là số lẻ")`,
    errorText: `  File "chan_le.py", line 4
    print("Đây là số chẵn")
    ^
IndentationError: expected an indented block after 'if' statement on line 3`,
    description: 'Trong Python, các câu lệnh thuộc khối con của if/else bắt buộc phải lùi vào (thụt lề).',
    errorLine: 4,
    errorType: 'IndentationError',
  },
  {
    id: 'type-error-input',
    title: 'Quên ép kiểu int() khi dùng input()',
    lesson: 'Bài 18: Các lệnh vào ra đơn giản',
    topic: 'Nhập và xuất dữ liệu',
    code: `# Tính chu vi hình vuông
canh = input("Nhập độ dài cạnh: ")
chu_vi = canh * 4
dien_tich = canh + 10
print("Chu vi:", chu_vi)`,
    errorText: `Traceback (most recent call last):
  File "hinh_vuong.py", line 4, in <module>
    dien_tich = canh + 10
TypeError: can only concatenate str (not "int") to str`,
    description: 'Hàm input() luôn trả về kiểu chuỗi ký tự (str), nếu thực hiện phép toán cộng với số nguyên sẽ báo lỗi TypeError.',
    errorLine: 4,
    errorType: 'TypeError',
  },
  {
    id: 'assignment-instead-of-equality',
    title: 'Nhầm lẫn phép gán (=) và phép so sánh (==)',
    lesson: 'Bài 19: Câu lệnh rẽ nhánh',
    topic: 'Biểu thức logic và điều kiện',
    code: `# Kiểm tra điểm đạt yêu cầu
diem = float(input("Nhập điểm thi: "))
if diem = 10:
    print("Xuất sắc tuyệt đối!")
else:
    print("Cố gắng thêm nhé!")`,
    errorText: `  File "kiem_tra.py", line 3
    if diem = 10:
            ^
SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?`,
    description: 'Trong điều kiện của câu lệnh if, học sinh dùng một dấu bằng (=) vốn là lệnh gán thay vì toán tử so sánh bằng (==).',
    errorLine: 3,
    errorType: 'SyntaxError',
  },
  {
    id: 'name-error-variable',
    title: 'Sử dụng biến trước khi khởi tạo hoặc sai tên',
    lesson: 'Bài 17: Biến và lệnh gán',
    topic: 'Quy tắc đặt tên và gán biến',
    code: `# Tính tiền mua hàng có giảm giá
so_luong = int(input("Nhập số lượng: "))
don_gia = 50000
Thanh_tien = so_luong * don_gia
print("Số tiền phải trả là:", thanh_tien)`,
    errorText: `Traceback (most recent call last):
  File "ban_hang.py", line 5, in <module>
    print("Số tiền phải trả là:", thanh_tien)
NameError: name 'thanh_tien' is not defined. Did you mean: 'Thanh_tien'?`,
    description: 'Python phân biệt chữ hoa và chữ thường (Case-sensitive), biến Thanh_tien viết hoa khác với thanh_tien viết thường.',
    errorLine: 5,
    errorType: 'NameError',
  },
  {
    id: 'index-error-list',
    title: 'Truy cập phần tử vượt quá chỉ số danh sách',
    lesson: 'Bài 22: Kiểu dữ liệu danh sách',
    topic: 'Danh sách (List) trong Python',
    code: `# In các phần tử trong danh sách môn học
mon_hoc = ["Toán", "Văn", "Tin", "Anh"]
# Danh sách có 4 phần tử
for i in range(1, 5):
    print("Môn thứ", i, "là:", mon_hoc[i])`,
    errorText: `Traceback (most recent call last):
  File "danh_sach.py", line 5, in <module>
    print("Môn thứ", i, "là:", mon_hoc[i])
IndexError: list index out of range`,
    description: 'Chỉ số danh sách trong Python bắt đầu từ 0 đến len(list) - 1. Khi i = 4, mon_hoc[4] không tồn tại vì chỉ số tối đa là 3.',
    errorLine: 5,
    errorType: 'IndexError',
  },
];
