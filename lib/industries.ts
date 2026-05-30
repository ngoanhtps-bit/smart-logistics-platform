export type IndustryPage = {
  slug: string;
  title: string;
  description: string;
  vehicles: string[];
  faqs: { question: string; answer: string }[];
};

export const industries: IndustryPage[] = [
  {
    slug: "van-chuyen-thep",
    title: "Vận chuyển thép Bắc Trung Nam",
    description: "Mooc rào và container chuyên chở thép cuộn, thép hình, vật tư xây dựng với ràng buộc an toàn.",
    vehicles: ["Mooc rào", "Mooc sàn", "Container 40FT"],
    faqs: [
      { question: "Xe mooc rào chở thép tối đa bao nhiêu tấn?", answer: "Thường 28-32 tấn tùy loại mooc và quy định tuyến." },
      { question: "Có hỗ trợ ràng buộc và khảo sát hàng quá khổ?", answer: "Có, điều phối khảo sát trước khi báo giá chính thức." }
    ]
  },
  {
    slug: "van-chuyen-pallet",
    title: "Vận chuyển hàng pallet",
    description: "Xe tải 5T, 15T và container cho hàng pallet kho, KCN, xuất nhập khẩu.",
    vehicles: ["Xe tải 5T", "Xe tải 15T", "Container 20FT"],
    faqs: [
      { question: "Pallet có cần container không?", answer: "Tùy khối lượng và tuyến; hàng lẻ thường dùng xe tải, hàng lớn dùng container." }
    ]
  },
  {
    slug: "van-chuyen-may-cong-nghiep",
    title: "Vận chuyển máy công nghiệp",
    description: "Mooc sàn, mooc rào cho máy công trình, thiết bị dự án, hàng quá khổ.",
    vehicles: ["Mooc sàn", "Mooc rào", "Container 40FT"],
    faqs: [
      { question: "Hàng quá khổ có cần giấy phép?", answer: "Có, đội vận hành hỗ trợ lộ trình và thủ tục theo quy định." }
    ]
  },
  {
    slug: "van-chuyen-container-xnk",
    title: "Vận chuyển container xuất nhập khẩu",
    description: "Kéo container từ cảng Hải Phòng, Cát Lái về KCN với tracking và POD đầy đủ.",
    vehicles: ["Container 20FT", "Container 40FT"],
    faqs: [
      { question: "Thời gian kéo container từ cảng?", answer: "Phụ thuộc lịch tàu, thông quan và tuyến; thường 1-5 ngày Bắc Nam." }
    ]
  },
  {
    slug: "van-chuyen-dien-tu",
    title: "Vận chuyển hàng điện tử",
    description: "Tuyến Bắc Ninh, Hải Phòng vào KCN miền Nam cho linh kiện và thiết bị điện tử.",
    vehicles: ["Xe tải 15T", "Container 40FT"],
    faqs: [
      { question: "Có yêu cầu đặc biệt về va đập?", answer: "Có SLA và quy trình xếp hàng, niêm phong theo yêu cầu nhà máy." }
    ]
  },
  {
    slug: "van-chuyen-noi-dia-kcn",
    title: "Vận chuyển nội địa KCN",
    description: "Vận chuyển liên tỉnh giữa các khu công nghiệp với xe tải và mooc.",
    vehicles: ["Xe tải 5T", "Xe tải 15T", "Mooc rào"],
    faqs: [
      { question: "Có giao trong ngày không?", answer: "Tuyến ngắn và nội vùng có thể giao trong ngày tùy lịch xe." }
    ]
  }
];
