import {
  BadgeCheck,
  Boxes,
  Clock3,
  Container,
  MapPinned,
  Route,
  ShieldCheck,
  Truck
} from "lucide-react";

export const site = {
  name: "Nền tảng Logistics Thông minh",
  hotline: "0901 668 888",
  zalo: "0901 668 888",
  email: "ops@smartlogistics.vn"
};

export const vehicleCategories = [
  {
    slug: "xe-container",
    title: "Container 20FT",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80",
    capacity: "28 tấn",
    cargo: "Hàng xuất nhập khẩu, pallet, máy móc",
    size: "Dài 5.9m, rộng 2.35m, cao 2.39m"
  },
  {
    slug: "xe-container-40ft",
    title: "Container 40FT",
    image: "https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80",
    capacity: "30 tấn",
    cargo: "Hàng khối lượng lớn, hàng kho, hàng công nghiệp",
    size: "Dài 12m, rộng 2.35m, cao 2.39m"
  },
  {
    slug: "xe-tai-15-tan",
    title: "Xe tải 15T",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80",
    capacity: "15 tấn",
    cargo: "Hàng pallet, hàng nhà máy, hàng dự án",
    size: "Thùng dài 9.6m"
  },
  {
    slug: "xe-mooc-rao",
    title: "Mooc rào",
    image: "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=900&q=80",
    capacity: "32 tấn",
    cargo: "Thép, máy công nghiệp, hàng quá khổ",
    size: "Sàn 12.4m, có cột ràng buộc"
  },
  {
    slug: "xe-mooc-san",
    title: "Mooc sàn",
    image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=900&q=80",
    capacity: "34 tấn",
    cargo: "Máy công trình, kết cấu, hàng nặng",
    size: "Sàn phẳng 12.4m"
  },
  {
    slug: "xe-tai-5-tan",
    title: "Xe tải 5T",
    image: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=900&q=80",
    capacity: "5 tấn",
    cargo: "Hàng nội thành, hàng lẻ, pallet nhỏ",
    size: "Thùng dài 6.2m"
  }
];

export const popularRoutes = [
  {
    slug: "ha-noi-sai-gon",
    from: "Hà Nội",
    to: "TP.HCM",
    title: "Vận chuyển container Hà Nội đi Sài Gòn",
    price: "Từ 18.5 triệu",
    time: "3-4 ngày",
    vehicles: ["Container 40FT", "Xe tải 15T", "Mooc rào"],
    description:
      "Tuyến trục Bắc Nam cho hàng pallet, hàng nhà máy và container xuất nhập khẩu với theo dõi thời gian thực."
  },
  {
    slug: "hai-phong-binh-duong",
    from: "Hải Phòng",
    to: "Bình Dương",
    title: "Vận chuyển container Hải Phòng đi Bình Dương",
    price: "Từ 20.8 triệu",
    time: "3-5 ngày",
    vehicles: ["Container 20FT", "Container 40FT", "Mooc sàn"],
    description:
      "Nhận hàng cảng Hải Phòng, giao các KCN Bình Dương, có phương án ghép chuyến và chuyến nguyên xe."
  },
  {
    slug: "bac-ninh-dong-nai",
    from: "Bắc Ninh",
    to: "Đồng Nai",
    title: "Xe tải và mooc rào Bắc Ninh đi Đồng Nai",
    price: "Từ 19.2 triệu",
    time: "3-4 ngày",
    vehicles: ["Mooc rào", "Xe tải 15T", "Mooc sàn"],
    description:
      "Tối ưu vận chuyển hàng công nghiệp, điện tử, thép và hàng dự án từ miền Bắc vào miền Nam."
  }
];

export const trustStats = [
  { label: "xe và đối tác", value: "2,400+" },
  { label: "tuyến Bắc Trung Nam", value: "180+" },
  { label: "cập nhật GPS", value: "10-30s" },
  { label: "hỗ trợ điều phối", value: "24/7" }
];

export const benefits = [
  { icon: MapPinned, title: "GPS thời gian thực", text: "Theo dõi vị trí xe, ETA và trạng thái vận đơn theo thời gian thực." },
  { icon: Route, title: "Điều phối toàn quốc", text: "Mạng lưới container, xe tải, mooc rào phủ tuyến Bắc Trung Nam." },
  { icon: Truck, title: "Xe đa dạng", text: "Gợi ý loại xe theo trọng lượng, kích thước và tính chất hàng." },
  { icon: ShieldCheck, title: "Giá minh bạch", text: "Báo giá nhanh theo tuyến, tải trọng, loại xe và thời điểm vận chuyển." },
  { icon: Clock3, title: "SLA rõ ràng", text: "Dòng thời gian lấy hàng, vận chuyển, giao hàng, chứng từ POD và cảnh báo chậm tiến độ." },
  { icon: BadgeCheck, title: "Hồ sơ đầy đủ", text: "Quản lý chứng từ xe, tài xế, bảo hiểm, POD và hóa đơn." }
];

export const dashboardKpis = [
  { label: "Doanh thu tháng", value: "8.6 tỷ", trend: "+18%" },
  { label: "Chuyến đang chạy", value: "148", trend: "+24" },
  { label: "Tỷ lệ xe rỗng", value: "12.4%", trend: "-6%" },
  { label: "Đúng giờ", value: "96.8%", trend: "+3%" }
];

export const activeShipments = [
  { code: "SPL-260528-01", route: "Hải Phòng -> Bình Dương", driver: "Nguyễn Văn Hải", status: "Đang vận chuyển", eta: "29/05 18:30" },
  { code: "SPL-260528-02", route: "Bắc Ninh -> Đồng Nai", driver: "Trần Minh Đức", status: "Đã xếp hàng", eta: "30/05 09:00" },
  { code: "SPL-260528-03", route: "Hà Nội -> TP.HCM", driver: "Lê Quốc Nam", status: "Đang lấy hàng", eta: "31/05 11:15" }
];

export const modules = [
  { icon: Container, title: "Container", text: "Quản lý container rỗng, có hàng, đang kéo và lịch trả vỏ." },
  { icon: Truck, title: "Đội xe", text: "Xe tải, mooc rào, mooc sàn, bảo dưỡng, bảo hiểm và giấy tờ." },
  { icon: Boxes, title: "Vận đơn", text: "Tạo đơn, ghép xe, gán tài xế, theo dõi POD và hóa đơn." }
];

export const platformLayers = [
  {
    label: "Website khách hàng",
    title: "Báo giá, đăng đơn, tracking",
    items: ["Tìm kiếm thông minh theo tuyến và loại hàng", "Form báo giá tối ưu chuyển đổi", "Theo dõi vận đơn và tải POD"]
  },
  {
    label: "Bảng điều phối",
    title: "Ghép xe, bản đồ trực tiếp, KPI",
    items: ["Xe đang chạy, xe rỗng, đơn gần kho", "Gán tài xế, cập nhật trạng thái", "Ghép chiều về giảm xe chạy rỗng"]
  },
  {
    label: "App tài xế",
    title: "Nhận chuyến, GPS, POD",
    items: ["Cập nhật lấy hàng, xếp hàng, đang chạy, đã giao", "Tải ảnh, chữ ký, chứng từ", "Chat với điều phối và khách hàng"]
  }
];

export const shipmentFlow = [
  { step: "01", title: "Tạo yêu cầu", text: "Khách nhập điểm lấy, điểm giao, loại hàng, tải trọng, kích thước và ngày vận chuyển." },
  { step: "02", title: "Gợi ý xe", text: "Hệ thống đề xuất container, xe tải, mooc rào hoặc mooc sàn phù hợp với tuyến và hàng." },
  { step: "03", title: "Điều phối", text: "Điều phối viên kiểm tra xe trống, tài xế, lộ trình, chi phí và gán chuyến." },
  { step: "04", title: "Theo dõi", text: "GPS cập nhật 10-30 giây, ETA thời gian thực, dòng trạng thái và cảnh báo chậm tiến độ." },
  { step: "05", title: "POD & hóa đơn", text: "Tài xế tải ảnh, chữ ký, biên bản giao nhận; khách tải chứng từ POD và hóa đơn." }
];

export const pricingRows = [
  { route: "Hà Nội -> TP.HCM", container20: "18.5-22 triệu", container40: "21-26 triệu", eta: "3-4 ngày" },
  { route: "Hải Phòng -> Bình Dương", container20: "20.8-25 triệu", container40: "24-29 triệu", eta: "3-5 ngày" },
  { route: "Bắc Ninh -> Đồng Nai", container20: "19.2-23 triệu", container40: "22-27 triệu", eta: "3-4 ngày" },
  { route: "Đà Nẵng -> TP.HCM", container20: "10.5-14 triệu", container40: "13-17 triệu", eta: "1-2 ngày" }
];

export const cargoSegments = [
  "Hàng pallet",
  "Hàng xuất nhập khẩu",
  "Máy móc công nghiệp",
  "Thiết bị dự án",
  "Hàng kho KCN",
  "Thép và vật tư xây dựng",
  "Hàng nặng",
  "Hàng quá khổ cần khảo sát"
];

export const complianceDocs = [
  "Lệnh điều xe",
  "Biên bản giao nhận",
  "Ảnh niêm phong container",
  "POD có chữ ký",
  "Hóa đơn vận chuyển",
  "Hồ sơ xe và tài xế"
];

export const containerFitRules = [
  { factor: "Tải trọng", rule: "Kiểm tra tải trọng, giới hạn cầu đường và quy định tuyến", score: "Bắt buộc" },
  { factor: "Kích thước", rule: "So khớp chiều dài, chiều rộng, chiều cao với container 20FT/40FT", score: "Tự động" },
  { factor: "Điểm lấy hàng", rule: "Đánh giá khả năng vào kho, lịch nâng hạ, thời gian chờ", score: "Điều phối" },
  { factor: "Chiều về", rule: "Tìm chuyến chiều về để giảm chi phí xe rỗng", score: "Gợi ý AI" }
];

export const laneOptimizer = [
  { label: "Xe rỗng gần điểm lấy", value: "12", note: "bán kính 35km" },
  { label: "Tài xế sẵn sàng", value: "8", note: "đủ hồ sơ" },
  { label: "Chuyến chiều về phù hợp", value: "5", note: "giảm 7-12%" },
  { label: "Rủi ro chậm SLA", value: "Thấp", note: "ETA ổn định" }
];

export const dispatchStatuses = [
  { code: "HP-40F-118", type: "Container 40FT", location: "Cảng Hải Phòng", status: "Sẵn sàng", eta: "15 phút" },
  { code: "BN-MR-044", type: "Mooc rào", location: "KCN Yên Phong", status: "Đang trả hàng", eta: "2 giờ" },
  { code: "HN-15T-072", type: "Xe tải 15T", location: "Gia Lâm", status: "Xe rỗng", eta: "35 phút" }
];

export const marketplaceLoads = [
  { code: "LD-HP-BD-884", route: "Hải Phòng -> Bình Dương", cargo: "Pallet hàng kho", weight: "22 tấn", price: "24.8 triệu", match: "92%" },
  { code: "LD-BN-DN-427", route: "Bắc Ninh -> Đồng Nai", cargo: "Thiết bị công nghiệp", weight: "18 tấn", price: "21.6 triệu", match: "88%" },
  { code: "LD-HN-HCM-119", route: "Hà Nội -> TP.HCM", cargo: "Hàng điện tử", weight: "12 tấn", price: "18.9 triệu", match: "84%" }
];

export const driverTasks = [
  { time: "07:30", title: "Nhận chuyến", text: "Container 40FT - Cảng Hải Phòng" },
  { time: "09:10", title: "Đã tới điểm lấy", text: "Tải ảnh container rỗng và niêm phong" },
  { time: "10:45", title: "Đã xếp hàng", text: "Cập nhật trọng lượng, chứng từ" },
  { time: "18:30", title: "Đang vận chuyển", text: "GPS gửi mỗi 20 giây" }
];

export const seoClusters = [
  { title: "Tuyến đường", count: "1,200+", examples: ["Hà Nội đi Sài Gòn", "Hải Phòng đi Bình Dương", "Bắc Ninh đi Đồng Nai"] },
  { title: "Loại xe", count: "120+", examples: ["Xe container 40FT", "Mooc rào chở thép", "Xe tải 15 tấn"] },
  { title: "Ngành hàng", count: "300+", examples: ["Vận chuyển thép", "Vận chuyển pallet", "Vận chuyển máy công nghiệp"] },
  { title: "Bảng giá", count: "800+", examples: ["Giá container Bắc Nam", "Giá xe mooc rào", "Giá xe tải liên tỉnh"] }
];

export const opsModules = [
  { name: "Đăng nhập & phân quyền", status: "khách hàng / điều phối / quản trị / tài xế" },
  { name: "Bộ máy báo giá", status: "giá tuyến, giá xe, phụ phí" },
  { name: "Theo dõi thời gian thực", status: "Socket, GPS, ETA, vùng địa lý" },
  { name: "Trung tâm chứng từ", status: "POD, hóa đơn, giấy xe, bảo hiểm" },
  { name: "Trung tâm thông báo", status: "Email, SMS, Zalo, đẩy thông báo" },
  { name: "Phân tích", status: "doanh thu, công suất, SLA, bản đồ nhiệt" }
];

export const orderPipeline = [
  {
    stage: "Mới tạo",
    count: 18,
    color: "bg-blue-50 text-blue-700",
    orders: ["LD-HP-BD-884", "LD-HN-HCM-119", "LD-DN-HCM-502"]
  },
  {
    stage: "Đang báo giá",
    count: 12,
    color: "bg-orange-50 text-orange-700",
    orders: ["QT-BN-DN-427", "QT-HP-CT-092", "QT-HN-DN-631"]
  },
  {
    stage: "Đã gán xe",
    count: 46,
    color: "bg-green-50 text-green-700",
    orders: ["SPL-260528-01", "SPL-260528-02", "SPL-260528-03"]
  },
  {
    stage: "Cần xử lý",
    count: 7,
    color: "bg-red-50 text-red-700",
    orders: ["ETA-LATE-122", "POD-MISSING-018", "DOC-VERIFY-220"]
  }
];

export const fleetRows = [
  { plate: "51H-888.66", type: "Mooc rào", driver: "Nguyễn Văn Hải", location: "QL1A - Quảng Ngãi", status: "Đang chạy", utilization: "91%" },
  { plate: "15C-442.19", type: "Container 40FT", driver: "Trần Minh Đức", location: "Cảng Hải Phòng", status: "Xe rỗng", utilization: "76%" },
  { plate: "29H-772.04", type: "Xe tải 15T", driver: "Lê Quốc Nam", location: "KCN Yên Phong", status: "Đang lấy hàng", utilization: "84%" },
  { plate: "60C-118.35", type: "Mooc sàn", driver: "Phạm Văn Tài", location: "Long Thành", status: "Bảo trì", utilization: "62%" }
];

export const backhaulMatches = [
  { outbound: "Hải Phòng -> Bình Dương", returnTrip: "Đồng Nai -> Bắc Ninh", saving: "11.8%", score: "94%" },
  { outbound: "Bắc Ninh -> Đồng Nai", returnTrip: "TP.HCM -> Hà Nội", saving: "9.4%", score: "89%" },
  { outbound: "Đà Nẵng -> TP.HCM", returnTrip: "Bình Dương -> Huế", saving: "7.1%", score: "82%" }
];

export const dispatchTasks = [
  { priority: "Cao", title: "Xác minh POD còn thiếu", detail: "SPL-260528-02 cần ảnh biên bản giao nhận trước 16:00" },
  { priority: "Cao", title: "ETA lệch 42 phút", detail: "SPL-260528-01 đi qua đoạn ùn tắc, cần báo khách" },
  { priority: "Vừa", title: "Gia hạn bảo hiểm xe", detail: "15C-442.19 hết hạn trong 5 ngày" },
  { priority: "Thấp", title: "Cập nhật bảng giá tuyến", detail: "Hải Phòng -> Bình Dương tăng phụ phí nâng hạ" }
];

export const analyticsBars = [
  { route: "Bắc -> Nam", revenue: 86, trips: 148 },
  { route: "Nam -> Bắc", revenue: 64, trips: 102 },
  { route: "Trung chuyển", revenue: 42, trips: 71 },
  { route: "Nội vùng", revenue: 58, trips: 96 }
];

export const customerReviews = [
  {
    name: "Nguyễn Thị Lan",
    role: "Supply Chain Manager",
    company: "KCN Bình Dương",
    rating: 5,
    text: "Báo giá nhanh, tracking GPS rõ ràng. Điều phối phản hồi kịp khi ETA lệch."
  },
  {
    name: "Trần Văn Đạt",
    role: "Logistics Lead",
    company: "Nhà máy điện tử Bắc Ninh",
    rating: 5,
    text: "Ghép mooc rào và container linh hoạt. POD online giúp đối soát nhanh hơn."
  },
  {
    name: "Lê Minh Hoàng",
    role: "Import/Export",
    company: "Cảng Hải Phòng",
    rating: 4,
    text: "Tuyến Hải Phòng - Bình Dương ổn định SLA. Bảng điều phối rất chuyên nghiệp."
  }
];

export const blogPosts = [
  {
    slug: "van-chuyen-container-bac-nam-2026",
    title: "Vận chuyển container Bắc Nam 2026: bảng giá và lưu ý",
    excerpt: "Cập nhật giá container 20FT/40FT, thời gian transit và cách chọn xe phù hợp.",
    category: "Container",
    date: "2026-05-20",
    readTime: "8 phút"
  },
  {
    slug: "xe-mooc-rao-cho-thep-va-hang-nang",
    title: "Xe mooc rào cho thép và hàng nặng: quy trình an toàn",
    excerpt: "Hướng dẫn ràng buộc hàng, hồ sơ xe và điểm bốc xếp cho hàng quá khổ.",
    category: "Mooc rào",
    date: "2026-05-15",
    readTime: "6 phút"
  },
  {
    slug: "tracking-gps-realtime-logistics",
    title: "Theo dõi GPS thời gian thực trong logistics B2B",
    excerpt: "Tại sao cập nhật 10-30 giây, ETA và POD giúp giảm rủi ro vận hành.",
    category: "Technology",
    date: "2026-05-08",
    readTime: "5 phút"
  }
];
