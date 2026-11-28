import { DEFAULT_MEMBERSHIP_PLANS } from "@/lib/membership";
import { ActivationCode, Course, LMSDatabase } from "@/types/lms";

export const OHANA_BANK_CONFIG = {
  bankId: "ACB",
  bankName: "Ngân hàng ACB - TMCP Á Châu",
  accountNo: "49682677",
  accountName: "VO QUOC TRI",
  fallbackQrImage:
    "https://img.vietqr.io/image/ACB-49682677-compact2.png?accountName=VO%20QUOC%20TRI",
};

export const INITIAL_ACTIVATION_CODES: ActivationCode[] = [
  {
    code: "OHANA-NOIBO-2026",
    label: "Mã mở khóa toàn bộ chương trình Đào tạo Nội bộ Ohana",
    targetCourseId: "ALL_INTERNAL",
    maxUses: 999,
    usedCount: 18,
    active: true,
    createdAt: "2026-11-01T08:00:00.000Z",
  },
  {
    code: "HOCBONG-OHANA-AI",
    label: "Mã học bổng 100% khóa OHANA AI ACADEMY (Dành cho khách VIP/Offline)",
    targetCourseId: "course-ohana-ai-academy",
    maxUses: 50,
    usedCount: 4,
    active: true,
    createdAt: "2026-11-15T08:00:00.000Z",
  },
];

export const SAMPLE_MEMBERSHIP_COURSE: Course = {
  id: "course-ohana-ai-membership-hub",
  slug: "kho-bai-hoc-ai-cap-nhat-hang-thang",
  title: "OHANA AI MEMBERSHIP — Kho Bài Học AI & Automation Cập Nhật Hàng Tháng",
  subtitle:
    "Thư viện bài giảng thực chiến cập nhật liên tục mỗi tuần/tháng dành riêng cho Hội viên Ohana Membership: công cụ AI mới nhất, quy trình tạo nội dung, tự động hóa bán hàng và bộ Prompt ứng dụng ngay.",
  category: "Hội Viên Membership",
  accessType: "membership",
  includedInMembership: true,
  price: 0,
  thumbnail: "/ohana/banner_ohana_ai_mastery_cyber.jpg",
  introVideoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
  scheduleInfo: "Cập nhật bài học & bộ Prompt mới liên tục hàng tuần cho Hội viên còn hạn",
  instructor: {
    name: "Brian Võ (Võ Quốc Trí)",
    role: "Market Director & AI Strategist — Astronixa Ohana",
    avatar: "/ohana/astronixa_logo.jpg",
  },
  level: "Cập nhật liên tục",
  totalDuration: "Cập nhật hàng tuần",
  studentsCount: 128,
  rating: 5.0,
  badge: "Hội Viên VIP • Cập Nhật Mới",
  highlights: [
    "Học không giới hạn toàn bộ bài giảng AI, Video & Automation mới đăng mỗi tuần",
    "Tải trọn bộ file Prompt, kịch bản bán hàng và tài liệu đính kèm trong từng bài",
    "Chủ động đăng ký theo tháng / quý / năm — tự động cộng dồn ngày khi gia hạn",
    "Lưu trọn đời tiến độ học tập kể cả khi tạm ngưng gia hạn",
  ],
  certificateIssuer: "Ohana AI Academy — Astronixa Ecosystem",
  chapters: [
    {
      id: "ch-mem-2026-11",
      title: "Cập Nhật Tháng 11/2026 — AI Ứng Dụng Kinh Doanh & Nội Dung Tự Động",
      subtitle: "Các chuyên đề thực chiến mới nhất dành riêng cho Hội viên Ohana Membership",
      lessons: [
        {
          id: "les-mem-01",
          title: "Định Hướng Kho Hội Viên & Lộ Trình Cập Nhật Công Cụ AI Hàng Tháng",
          duration: "08:30",
          videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
          isFreePreview: true,
          publishedAt: "2026-11-28T08:00:00.000Z",
          summary:
            "Giới thiệu cách khai thác hiệu quả thư viện bài học cập nhật hàng tháng, bộ tài liệu đính kèm và lộ trình thực hành ra kết quả nhanh nhất cho Hội viên Ohana.",
        },
        {
          id: "les-mem-02",
          title: "Cập Nhật #01: Quy Trình Sản Xuất Video AI & Poster Đa Kênh Trong 15 Phút",
          duration: "14:49",
          videoUrl: "https://www.youtube.com/watch?v=7f0yY02oI_M&list=PLfgrGuKaRnYY",
          publishedAt: "2026-11-27T09:00:00.000Z",
          summary:
            "Cập nhật công thức kết hợp bộ công cụ AI tạo ảnh thương hiệu, viết kịch bản bán hàng và dựng video ngắn chuyển đổi cao cho chủ kinh doanh.",
        },
        {
          id: "les-mem-03",
          title: "Cập Nhật #02: Xây Dựng Hệ Thống AI Tự Động Hóa Chăm Sóc & Chốt Đơn",
          duration: "12:53",
          videoUrl: "https://www.youtube.com/watch?v=06sP-j1P3_E&list=PLetC2FIqwUZM",
          publishedAt: "2026-11-25T09:00:00.000Z",
          summary:
            "Hướng dẫn triển khai trợ lý AI hỗ trợ tư vấn khách hàng, cá nhân hóa nội dung chăm sóc và tối ưu hiệu suất làm việc nhóm.",
        },
      ],
    },
  ],
  createdAt: "2026-11-28T08:00:00.000Z",
};

export const INITIAL_COURSES: Course[] = [
  SAMPLE_MEMBERSHIP_COURSE,
  {
    id: "course-ohana-ai-academy",
    slug: "ohana-ai-academy-thuc-chien",
    title: "OHANA AI ACADEMY — Làm Chủ AI Kinh Doanh Tạo Doanh Số Thực Chiến",
    subtitle:
      'Khóa đào tạo 4 Tuần Chuyên Sâu (8 buổi Online + 4 buổi Workshop Kèm Cặp 1:1). Phá vỡ bẫy "biết nhiều – làm ít", đóng gói cỗ máy AI Marketing, Video, Content & AI Agent tự động chốt đơn trên Zalo và Fanpage.',
    category: "AI Kinh Doanh Thực Chiến",
    accessType: "commercial",
    price: 6600000,
    originalPrice: 12999000,
    thumbnail: "/ohana/banner_ohana_ai_academy_cyber.jpg",
    introVideoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
    scheduleInfo:
      "Khai giảng Tháng 12/2026 • Lớp quy mô nhỏ từ 10 học viên • Quỹ Khuyến Học Astronixa tài trợ 49% (Tiết kiệm 6.399.000đ)",
    instructor: {
      name: "Brian Võ (Võ Quốc Trí) & Đội Ngũ Cố Vấn Astronixa",
      role: "Market Director — Ohana Career & Astronixa LLC",
      avatar: "/ohana/astronixa_logo.jpg",
    },
    level: "No-Code • Từ A–Z",
    totalDuration: "4 Tuần (8 Online + 4 Workshop)",
    studentsCount: 486,
    rating: 4.9,
    badge: "Học bổng Astronixa 49%",
    highlights: [
      '01. Phá vỡ bẫy "Biết Nhiều - Làm Ít": Chuyển dịch từ lý thuyết prompt suông sang mang về doanh số & khách hàng thật.',
      "02. Kết nối mảnh ghép kỹ năng: Liên kết công cụ AI rời rạc thành năng lực cốt lõi giải quyết trực diện bài toán vận hành.",
      "03. Rút ngắn lộ trình thử sai: Thừa hưởng quy trình chuẩn hóa đã kiểm chứng, tiết kiệm hàng chục triệu chi phí thử nghiệm.",
      "04. Workshop thực hành miễn phí: Đặc quyền tham gia các buổi Workshop cập nhật AI định kỳ hàng tháng miễn phí.",
      "05. Giải quyết bài toán thực tế: Mọi bài tập ứng dụng trực tiếp vào sản phẩm bán hàng và dự án của chính học viên.",
      "06. Đóng gói hệ thống AI riêng: Tích hợp công cụ thành cỗ máy AI độc bản vận hành tự động cho mục tiêu dài hạn.",
      "07. Bằng chứng nhận từ Viện KHCN: Cấp Chứng chỉ tốt nghiệp của Viện Phát Triển Khoa Học Công Nghệ & Giáo Dục.",
      "08. Cam kết cơ hội việc làm: Kết nối dự án, cộng tác viên phân phối và cơ hội việc làm thực tế trong mạng lưới Ohana Career.",
      "09. Tặng bộ quà tặng 3 Triệu Đồng: Combo tài liệu AI chuyên nghiệp độc quyền & Bộ Quà Tặng cao cấp từ Astronixa.",
    ],
    targetAudience: [
      {
        title: "Chủ Doanh Nghiệp & Quản Lý",
        description:
          "Tự động hóa bộ máy bán hàng, cắt giảm chi phí nhân sự marketing, triển khai AI Agent trực chat chốt đơn 24/7.",
        outcome: "Đầu ra: 1 Cỗ máy AI tối ưu chi phí & ra đơn tự động",
      },
      {
        title: "Kinh Doanh Online & Marketer",
        description:
          "Chấm dứt cảnh bí ý tưởng, tự tay sản xuất hình ảnh bán hàng, video AI viral và bài viết thương hiệu 30 ngày chỉ trong 1 buổi.",
        outcome: "Đầu ra: Ma trận nội dung & Video AI marketing thực chiến",
      },
      {
        title: "Freelancer & Muốn Đổi Ngành",
        description:
          "Sở hữu kỹ năng AI thực tế chuẩn quốc gia để nhận hợp đồng, xây dựng thương hiệu cá nhân và gia tăng nguồn thu nhập thứ hai.",
        outcome: "Đầu ra: Bằng chứng nhận Viện KHCN + Cơ hội việc làm",
      },
    ],
    gifts: [
      "8 buổi học Online chuyên sâu cùng chuyên gia (có video quay lại xem trọn đời)",
      "4 buổi Workshop cầm tay chỉ việc 1:1 trực tiếp trên laptop ra sản phẩm thật",
      "Bằng chứng nhận chính thức từ Viện Phát Triển Khoa Học Công Nghệ & Giáo Dục",
      "TẶNG: Combo tài liệu AI chuyên nghiệp trị giá 3.000.000đ",
      "TẶNG: Vé tham gia Workshop AI cập nhật hàng tháng cùng cộng đồng Ohana",
      "Ưu tiên kết nối dự án & cơ hội thu nhập trong hệ sinh thái Ohana Career",
    ],
    gallery: [
      {
        src: "/ohana/workshop_gallery/workshop_photo_01.jpg",
        tag: "Workshop 1:1",
        title: "Cầm Tay Chỉ Việc 1:1",
        description: "Hướng dẫn trực tiếp trên laptop của học viên, giải quyết triệt để từng bài toán.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_02.jpg",
        tag: "Không Gian Học",
        title: "Không Gian Đào Tạo Hiện Đại",
        description: "Môi trường công nghệ cao tạo cảm hứng sáng tạo và tập trung cao độ.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_03.jpg",
        tag: "Sửa Lỗi Prompt",
        title: "Tối Ưu Prompt Chuyên Sâu",
        description: "Giảng viên trực tiếp audit prompt và cấu trúc kịch bản video AI chuẩn viral.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_04.jpg",
        tag: "Sản Phẩm Đầu Tay",
        title: "Ra Kết Quả Ngay Tại Buổi Học",
        description: "Học viên hào hứng khi tự tay đóng gói bộ ấn phẩm marketing và bot bán hàng đầu tiên.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_05.jpg",
        tag: "Thực Chiến Doanh Nghiệp",
        title: "Giải Quyết Bài Toán Doanh Nghiệp",
        description: "Phân tích thực trạng mô hình kinh doanh để ứng dụng AI tối ưu chi phí.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_06.jpg",
        tag: "Đóng Gói AI Agent",
        title: "Demo Trợ Lý Ảo Vận Hành",
        description: "Nạp dữ liệu kinh doanh riêng và kích hoạt bot tự động phản hồi khách hàng 24/7.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_07.jpg",
        tag: "Mạng Lưới Đối Tác",
        title: "Gắn Kết & Mở Rộng Quan Hệ",
        description: "Cơ hội gặp gỡ các chủ doanh nghiệp, nhà bán lẻ và chuyên gia chuyển đổi số.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_08.jpg",
        tag: "Nghiệm Thu Khóa Học",
        title: "Nghiệm Thu Landing Page & Phễu",
        description: "Học viên tự tin thuyết trình về hệ thống phễu và chiến dịch marketing vừa xây dựng.",
      },
      {
        src: "/ohana/workshop_gallery/workshop_photo_09.jpg",
        tag: "Lễ Tốt Nghiệp",
        title: "Tự Hào Nhận Bằng Chứng Nhận",
        description: "Khoảnh khắc đáng nhớ nhận chứng chỉ tốt nghiệp danh giá từ Viện Phát Triển KHCN & Giáo Dục.",
      },
    ],
    faqs: [
      {
        question: "Cộng Đồng Ohana có đào tạo AI thực chiến và có uy tín trên thị trường không?",
        answer:
          "Cộng đồng Ohana được vận hành bởi Công ty TNHH Astronixa – đơn vị tiên phong phát triển hệ sinh thái số toàn diện (Super App, AI Agent) đã được báo chí chính thống ghi nhận. Không chỉ đào tạo AI thực chiến ứng dụng ngay vào kinh doanh và Affiliate, Ohana còn cung cấp nền tảng công nghệ thực tế để học viên tạo ra thu nhập bền vững.",
        linkUrl:
          "https://doanhnghiephoinhap.vn/astronixa-phat-trien-he-sinh-thai-so-ohana-huong-den-thi-truong-viet-nam-151176.html",
        linkLabel: "Đọc bài viết trên Báo Doanh Nghiệp & Hội Nhập",
      },
      {
        question: "Tôi không biết gì về lập trình hoặc công nghệ có học được không?",
        answer:
          "Hoàn toàn được! Khóa học được thiết kế theo phương thức No-Code, chỉ tập trung vào việc làm chủ các ứng dụng AI sẵn có, tư duy prompt tối ưu và quy trình tự động hóa thao tác kéo thả dễ dàng.",
      },
      {
        question: "Nếu tôi bận một buổi học Online thì có được học bù không?",
        answer:
          "Toàn bộ các buổi học Online đều được quay lại video chất lượng cao kèm tài liệu bài tập ngay trên hệ thống LMS này. Ngoài ra, bạn có 4 buổi Workshop trực tiếp vào cuối tuần để được trợ giảng kèm cặp giải đáp mọi khúc mắc.",
      },
      {
        question: "Bằng chứng nhận có giá trị pháp lý và công nhận ra sao?",
        answer:
          "Bằng được cấp chính thức bởi Viện Phát Triển Khoa Học Công Nghệ & Giáo Dục, có mộc đỏ và mã số học viên lưu trữ trên hệ sinh thái giáo dục của Viện, giúp bảo chứng năng lực thực tế và gia tăng uy tín hồ sơ doanh nghiệp.",
      },
      {
        question: "Cam kết cơ hội việc làm sau khóa học được thực hiện như thế nào?",
        answer:
          "Học viên tốt nghiệp đạt tiêu chuẩn sẽ được ưu tiên tham gia các dự án triển khai AI cho đối tác của Astronixa và nhận các cơ hội phân phối, hợp tác gia tăng thu nhập trong mạng lưới Ohana Career.",
      },
    ],
    certificateIssuer: "Viện Phát Triển Khoa Học Công Nghệ & Giáo Dục",
    certificateImage: "/ohana/chung_chi_vien_khcn_ohana.jpg",
    createdAt: "2026-11-01T00:00:00.000Z",
    chapters: [
      {
        id: "ch-w1-b1",
        title: "TUẦN 01 — BUỔI 1: Thực Chiến Tạo Ảnh Avatar, Poster & Video AI (Trọn Bộ 6 Tập)",
        subtitle: "Danh sách phát chính thức Buổi 1 • Kèm bộ Prompt 6 Yếu Tố & Case Study thực tế",
        bannerUrl: "/ohana/banner_tuan_01_visual_video.jpg",
        lessons: [
          {
            id: "les-b1-1",
            title: "Buổi 1 (Tập 1/6): Lộ Trình 3 Buổi Làm Chủ AI Từ Số 0 & 7 Ngành Nghề Đột Phá",
            duration: "10:50",
            videoUrl: "https://www.youtube.com/watch?v=o10JdU9NWmI&list=PLfgrGuKaRnYY",
            isFreePreview: true,
            summary:
              "Tổng quan lộ trình 3 buổi làm chủ AI từ số 0 và cách ứng dụng AI đột phá doanh số cho 7 nhóm ngành nghề kinh doanh thực tế.",
            resources: [
              {
                title: "Mở trọn bộ Danh sách phát YouTube Buổi 1 (6 Tập)",
                url: "https://www.youtube.com/playlist?list=PLfgrGuKaRnYY",
              },
              { title: "Combo Tài Liệu Prompt Thiết Kế Banner Thương Mại (PDF)", url: "#prompt-pack" },
            ],
          },
          {
            id: "les-b1-2",
            title: "Buổi 1 (Tập 2/6): Cách Tạo Ảnh Avatar Doanh Nhân Chuẩn Studio 0đ Bằng ChatGPT & Prompt 6 Yếu Tố",
            duration: "14:49",
            videoUrl: "https://www.youtube.com/watch?v=hwyQErnVyrU&list=PLfgrGuKaRnYY",
            summary:
              "Thực hành công thức Prompt 6 Yếu Tố để tạo bộ ảnh Avatar doanh nhân, chuyên gia sắc nét chuẩn Studio với chi phí 0đ.",
          },
          {
            id: "les-b1-3",
            title: "Buổi 1 (Tập 3/6): Kỹ Thuật Ghép Mặt Vào Ảnh Tham Chiếu Tài Lộc Giữ Nguyên Thần Thái Chỉ 1 Lệnh AI",
            duration: "06:48",
            videoUrl: "https://www.youtube.com/watch?v=60qXtIPROvs&list=PLfgrGuKaRnYY",
            summary:
              "Bí quyết giữ nguyên 100% khuôn mặt và thần thái nhân vật khi đưa vào bất kỳ bối cảnh ảnh mẫu sang trọng nào chỉ với 1 câu lệnh.",
          },
          {
            id: "les-b1-4",
            title: "Buổi 1 (Tập 4/6): Cách Thiết Kế Poster Chúc Mừng & Sự Kiện Chuẩn Studio Trong 3 Phút Bằng AI",
            duration: "12:53",
            videoUrl: "https://www.youtube.com/watch?v=0LYg761Q5c4&list=PLfgrGuKaRnYY",
            summary:
              "Quy trình lên bố cục, phối màu và xuất bản Poster sự kiện, thiệp chúc mừng chuyên nghiệp trong 3 phút.",
          },
          {
            id: "les-b1-5",
            title: "Buổi 1 (Tập 5/6): Kho Mẫu Poster Pinterest & Câu Thần Chú Ghép Mọi Nhân Vật Bằng AI Không Giới Hạn",
            duration: "11:10",
            videoUrl: "https://www.youtube.com/watch?v=VitF5Oks2_E&list=PLfgrGuKaRnYY",
            summary:
              "Khai thác kho ý tưởng Pinterest và câu thần chú biến hóa nhân vật không giới hạn cho chiến dịch truyền thông.",
          },
          {
            id: "les-b1-6",
            title: "Buổi 1 (Tập 6/6): Biến Ảnh AI Thành Video Quảng Cáo Triệu View — Case Study Lẩu Gà 109 & Hoàng Đế Ohana",
            duration: "10:54",
            videoUrl: "https://www.youtube.com/watch?v=p9S_nIeaoYM&list=PLfgrGuKaRnYY",
            summary:
              "Chuyển hóa ảnh tĩnh AI thành video quảng cáo có chuyển động mượt mà thông qua case study thực tế F&B & thương hiệu Ohana.",
          },
        ],
      },
      {
        id: "ch-w1-b2",
        title: "TUẦN 01 — BUỔI 2: Thực Chiến Trợ Lý AI Viết Bài & Làm Video AI Tự Động (Trọn Bộ 6 Tập)",
        subtitle: "Danh sách phát chính thức Buổi 2 • Gemini Gem, Vũ Tư AI & Workshop 1",
        lessons: [
          {
            id: "les-b2-1",
            title: "Buổi 2 (Tập 1/6): Cách Tạo Trợ Lý AI Viết Bài Bán Hàng Trên Gemini Gem Từ Khung 4IS & 50 Content Hook",
            duration: "10:27",
            videoUrl: "https://www.youtube.com/watch?v=i8Hg_9-nj1Y&list=PLetC2FIqwUZM",
            isFreePreview: true,
            summary:
              "Hướng dẫn cấu hình Trợ lý AI viết bài bán hàng tự động trên Gemini Gem theo công thức 4IS và kho 50 câu hook giữ chân người đọc.",
            resources: [
              {
                title: "Mở trọn bộ Danh sách phát YouTube Buổi 2 (6 Tập)",
                url: "https://www.youtube.com/playlist?list=PLetC2FIqwUZM",
              },
              { title: "Khung 4IS & 50 Content Hook Chốt Đơn Đa Ngành", url: "#video-script" },
            ],
          },
          {
            id: "les-b2-2",
            title: "Buổi 2 (Tập 2/6): Thực Chiến Trợ Lý AI Viết Bài Quảng Cáo 150 Từ Cho F&B, Mỹ Phẩm, BĐS & Bảo Hiểm",
            duration: "12:40",
            videoUrl: "https://www.youtube.com/watch?v=YbBNGAzcm9M&list=PLetC2FIqwUZM",
            summary:
              "Áp dụng trợ lý AI viết bài quảng cáo ngắn gọn 150 từ đánh trúng tâm lý mua hàng cho 4 ngành chủ lực.",
          },
          {
            id: "les-b2-3",
            title: "Buổi 2 (Tập 3/6): AI Nhìn 1 Ảnh Tự Viết Bài Nông Nghiệp, Nha Khoa & Ra Mắt Tool Làm Video Vũ Tư AI",
            duration: "07:32",
            videoUrl: "https://www.youtube.com/watch?v=1mSLB5tebbg&list=PLetC2FIqwUZM",
            summary:
              "Kỹ thuật AI đọc hiểu hình ảnh sản phẩm thực tế để viết bài bán hàng & giới thiệu quy trình làm video với công cụ Vũ Tư AI.",
          },
          {
            id: "les-b2-4",
            title: "Buổi 2 (Tập 4/6): Hướng Dẫn Thực Chiến Làm Video AI 40 Giây Quán Lẩu Gà 109 Trên Vũ Tư AI Từ A–Z",
            duration: "12:41",
            videoUrl: "https://www.youtube.com/watch?v=DuUWw2F5qvM&list=PLetC2FIqwUZM",
            summary:
              "Cầm tay chỉ việc từng bước tạo video AI 40 giây hoàn chỉnh có thoại tiếng Việt tự nhiên cho quán ăn và dịch vụ.",
          },
          {
            id: "les-b2-5",
            title: "Buổi 2 (Tập 5/6): Cách Nhân Bản 15–20 Video AI Hàng Loạt & Bí Quyết Tối Ưu Tài Khoản Gemini Pro 180k",
            duration: "13:21",
            videoUrl: "https://www.youtube.com/watch?v=GzNAV64W18g&list=PLetC2FIqwUZM",
            summary:
              "Quy trình sản xuất 15–20 video quảng cáo hàng loạt tiết kiệm tối đa thời gian và chi phí tài khoản AI.",
          },
          {
            id: "les-b2-6",
            title: "Buổi 2 (Tập 6/6): Tuyển Tập Video AI Triệu View Đa Ngành (F&B, Nông Nghiệp, Affiliate) & Tổng Kết Buổi 2",
            duration: "12:42",
            videoUrl: "https://www.youtube.com/watch?v=y7GWZpijNz8&list=PLetC2FIqwUZM",
            summary:
              "Phân tích các mẫu video AI đạt tương tác cao thực tế ở đa ngành hàng và tổng kết bài tập thực hành Tuần 01.",
          },
          {
            id: "les-w1-3",
            title: "Workshop 1 (Thực hành): Hoàn thiện Bộ 10 Banner 1080x1080 & Video AI 40s dự án cá nhân",
            duration: "90:00",
            videoUrl: "https://www.youtube.com/playlist?list=PLfgrGuKaRnYY",
            summary:
              "Cầm tay chỉ việc: Tự tay xuất bản trọn bộ 10 banner 1080x1080 và video AI hoàn chỉnh cho chính dự án kinh doanh của bạn.",
          },
        ],
      },
      {
        id: "ch-w2",
        title: "TUẦN 02: Content Engine & Hệ Thống AI Agent",
        subtitle: "Sản phẩm: Ma trận 30 ngày bài viết + Trợ lý ảo riêng",
        bannerUrl: "/ohana/banner_tuan_02_content_agent.jpg",
        lessons: [
          {
            id: "les-w2-1",
            title: "Buổi 3 (Online): Hệ thống Content 30 ngày thương hiệu",
            duration: "45:00",
            videoUrl: "https://www.youtube.com/watch?v=jHv63Uvk5VA",
            summary:
              "Lên ý tưởng, cấu trúc bài viết và phong cách cá nhân hóa với AI, tự động lên lịch nội dung cả tháng cho Facebook, Zalo & Ohana.",
          },
          {
            id: "les-w2-2",
            title: "Buổi 4 (Online): Hệ thống AI Agent tự động hóa công việc",
            duration: "50:00",
            videoUrl: "https://www.youtube.com/watch?v=F4Zu5ZZAG7I",
            summary:
              "Xây dựng trợ lý AI chuyên trách xử lý văn bản, tóm tắt dữ liệu, nghiên cứu đối thủ và lập báo cáo tự động.",
          },
          {
            id: "les-w2-3",
            title: "Workshop 2 (Thực hành): Đóng gói Trợ lý ảo riêng & Nạp dữ liệu độc quyền",
            duration: "90:00",
            videoUrl: "https://vimeo.com/76979871",
            summary:
              "Đóng gói trợ lý ảo riêng của bạn và nạp dữ liệu bảng giá, sản phẩm độc quyền để bot phục vụ công việc hàng ngày.",
          },
        ],
      },
      {
        id: "ch-w3",
        title: "TUẦN 03: Chiến Lược Phễu & Thiết Kế Landing Page",
        subtitle: "Sản phẩm: Landing Page bán hàng hoàn chỉnh",
        bannerUrl: "/ohana/banner_tuan_03_funnel_landing.jpg",
        lessons: [
          {
            id: "les-w3-1",
            title: "Buổi 5 (Online): Xây dựng chiến lược phễu bán hàng bằng AI",
            duration: "45:00",
            videoUrl: "https://www.youtube.com/watch?v=IHZwWFHWa-w",
            summary:
              "Vẽ hành trình khách hàng từ mồi câu (Lead magnet) đến sản phẩm chủ lực và Upsell bằng AI.",
          },
          {
            id: "les-w3-2",
            title: "Buổi 6 (Online): Thiết kế Landing Page chuyển đổi doanh thu",
            duration: "52:00",
            videoUrl: "https://www.youtube.com/watch?v=tgbNymZ7vqY",
            summary:
              "Dùng AI viết kịch bản giật gân, dàn trang chuẩn UX/UI và xuất bản website bán hàng chuyên nghiệp.",
          },
          {
            id: "les-w3-3",
            title: "Workshop 3 (Thực hành): Audit & Tối ưu Landing Page chốt đơn",
            duration: "90:00",
            videoUrl: "https://vimeo.com/76979871",
            summary:
              "Chuyên gia trực tiếp audit và chỉnh sửa giao diện Landing Page của bạn để tối đa tỷ lệ chốt đơn.",
          },
        ],
      },
      {
        id: "ch-w4",
        title: "TUẦN 04: Tự Động Hóa Đa Kênh & Lễ Tốt Nghiệp",
        subtitle: "Sản phẩm: Bot bán hàng Zalo/FB + Bằng chứng nhận",
        bannerUrl: "/ohana/banner_tuan_04_automation_grad.jpg",
        lessons: [
          {
            id: "les-w4-1",
            title: "Buổi 7 (Online): Tích hợp & Hoàn thiện hệ sinh thái AI",
            duration: "45:00",
            videoUrl: "https://www.youtube.com/watch?v=Ilg3gGewQ5U",
            summary:
              "Đồng bộ các luồng dữ liệu tự động giữa mạng xã hội, form khách hàng và kho lưu trữ.",
          },
          {
            id: "les-w4-2",
            title: "Buổi 8 (Online): Bán hàng tự động Zalo OA & Fanpage",
            duration: "48:00",
            videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
            summary:
              "Cài đặt AI Agent trực tiếp tư vấn, báo giá và xin số điện thoại tự động qua tin nhắn 24/7.",
          },
          {
            id: "les-w4-quiz",
            title: "Workshop 4 (Lễ Tốt Nghiệp): Nghiệm thu Hệ thống & Sát hạch Cấp Chứng Chỉ Viện KHCN",
            duration: "60:00",
            videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
            summary:
              "Chạy nghiệm thu hệ thống bán hàng thực tế, hoàn thành bài thi sát hạch đạt ≥ 80% để nhận Bằng Chứng Nhận từ Viện Phát Triển KHCN & Giáo Dục.",
            quiz: [
              {
                id: "q1",
                question: "Mục tiêu cốt lõi nhất của phương pháp học 4 Tuần (8 Buổi Online + 4 Workshop) tại Ohana AI Academy là gì?",
                options: [
                  "Chỉ học thuộc lòng lý thuyết prompt mà không cần làm sản phẩm",
                  'Phá vỡ bẫy "biết nhiều - làm ít", đóng gói ra sản phẩm thật (Ảnh, Video, Content 30 ngày, Landing Page & Bot bán hàng)',
                  "Chỉ tập trung học lập trình code thuần từ đầu",
                  "Không áp dụng vào sản phẩm kinh doanh hiện tại",
                ],
                correctIndex: 1,
                explanation:
                  "Ohana AI Academy đào tạo theo hướng thực chiến 100%, giúp học viên đóng gói hoàn chỉnh cỗ máy AI bán hàng ngay trong 4 tuần.",
              },
              {
                id: "q2",
                question: "Trong Tuần 03, hành trình phễu bán hàng chuẩn gồm những thành phần nào?",
                options: [
                  "Chỉ đăng một đường link chuyển khoản không giới thiệu giá trị",
                  "Mồi câu thu hút (Lead Magnet) -> Sản phẩm chủ lực -> Chăm sóc & Upsell bằng AI",
                  "Gửi tin nhắn hàng loạt không phân loại khách hàng",
                  "Bỏ qua khâu thiết kế Landing Page",
                ],
                correctIndex: 1,
                explanation:
                  "Cấu trúc phễu từ Lead Magnet đến sản phẩm chủ lực và Upsell giúp tối đa hóa tỷ lệ chuyển đổi và giá trị trọn đời khách hàng.",
              },
              {
                id: "q3",
                question: "Đơn vị bảo chứng và cấp Giấy chứng nhận tốt nghiệp cho khóa Ohana AI Academy là đơn vị nào?",
                options: [
                  "Không có đơn vị bảo chứng",
                  "Viện Phát Triển Khoa Học Công Nghệ & Giáo Dục (kết hợp cùng Hệ sinh thái Astronixa Ohana)",
                  "Một diễn đàn tự phát ẩn danh",
                  "Chỉ gửi tin nhắn text qua điện thoại",
                ],
                correctIndex: 1,
                explanation:
                  "Học viên hoàn thành 8 buổi học và 4 kỳ Workshop được cấp Bằng chứng nhận từ Viện Phát Triển KHCN & Giáo Dục.",
              },
              {
                id: "q4",
                question: "Khi thanh toán học phí qua VietQR ACB (VO QUOC TRI - STK 49682677), hệ thống Webhook mở khóa dựa vào yếu tố nào?",
                options: [
                  "Đợi 3 ngày làm việc sau khi chuyển khoản",
                  "Mã đơn hàng duy nhất (OHANAxxxxxx) trong nội dung chuyển khoản khớp với số tiền thực nhận",
                  "Tên thiết bị điện thoại của người mua",
                  "Ảnh đại diện Zalo của học viên",
                ],
                correctIndex: 1,
                explanation:
                  "Webhook SePay/PayOS đối soát tự động Mã đơn hàng và số tiền để kích hoạt khóa học ngay lập tức.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-ai-agent-automation",
    slug: "xay-dung-doi-quan-ai-agent-da-kenh",
    title: "Xây Dựng Đội Quân AI Agent Tự Động Hóa Xuất Bản Đa Kênh",
    subtitle:
      "Làm chủ quy trình vận hành tự động từ nghiên cứu thị trường, thiết kế ấn phẩm đến đăng bài đa nền tảng cho chủ doanh nghiệp & đội nhóm.",
    category: "AI Agent & Vận Hành",
    accessType: "commercial",
    price: 1990000,
    originalPrice: 3990000,
    thumbnail: "/ohana/banner_ohana_ai_mastery_cyber.jpg",
    instructor: {
      name: "Brian Võ (Võ Quốc Trí)",
      role: "Market Director — Astronixa Ohana",
      avatar: "/ohana/astronixa_logo.jpg",
    },
    level: "Nâng cao thực chiến",
    totalDuration: "6 giờ Video + Bộ mẫu",
    studentsCount: 312,
    rating: 4.9,
    badge: "Best Seller",
    highlights: [
      "Kiến trúc phối hợp nhiều AI Agent (Nghiên cứu tin tức, Sáng tạo nội dung, Xuất bản & Báo cáo)",
      "Mẫu lịch trình 21 điểm chạm truyền thông mỗi tuần không tốn sức người",
      "Tích hợp trực tiếp YouTube, Vimeo, Facebook Fanpage, Zalo và Ohana Super App",
    ],
    certificateIssuer: "Ohana Academy — Astronixa Ecosystem",
    createdAt: "2026-11-10T00:00:00.000Z",
    chapters: [
      {
        id: "ch-ag-1",
        title: "Chương 1: Kiến trúc Đội quân AI Agent cho Doanh nghiệp tinh gọn",
        lessons: [
          {
            id: "les-ag-1",
            title: "Bài 1: Phân vai chuyên môn hóa cho từng AI Agent (Content, Video, Market Intel)",
            duration: "28:10",
            videoUrl: "https://www.youtube.com/watch?v=F4Zu5ZZAG7I",
            isFreePreview: true,
            summary: "Cách thiết kế quy trình phối hợp 4 trợ lý AI độc lập tránh chồng chéo và chống lặp bài.",
          },
          {
            id: "les-ag-2",
            title: "Bài 2: Thiết lập quy trình kiểm duyệt & Báo cáo nghiệm thu tự động bằng hình ảnh",
            duration: "34:50",
            videoUrl: "https://vimeo.com/76979871",
            summary: "Đảm bảo mọi bài đăng lên các kênh đều có ảnh chụp minh chứng và lưu vết trạng thái rõ ràng.",
            quiz: [
              {
                id: "q-ag-1",
                question: "Nguyên tắc quan trọng nhất để tránh đăng trùng lặp nội dung trong hệ thống tự động là gì?",
                options: [
                  "Chạy càng nhiều lịch hẹn giờ trùng nhau càng tốt",
                  "Lưu và kiểm tra trạng thái thực thi (State Check) trước mỗi ca xuất bản",
                  "Xóa toàn bộ nhật ký sau mỗi 5 phút",
                  "Không cần kiểm tra trạng thái",
                ],
                correctIndex: 1,
                explanation: "Kiểm tra file trạng thái trước khi chạy giúp đảm bảo mỗi ca chỉ xuất bản đúng 1 lần duy nhất.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-ohana-internal-onboarding",
    slug: "van-hoa-va-he-sinh-thai-astronixa-ohana",
    title: "[Nội Bộ] Văn Hóa & Hệ Sinh Thái Astronixa Ohana — One Universe, One Family",
    subtitle:
      "Chương trình đào tạo hội nhập bắt buộc dành cho Nhân sự, Quản lý và Đối tác phát triển thị trường trên toàn quốc của Ohana.",
    category: "Đào Tạo Nội Bộ Ohana",
    accessType: "internal",
    price: 0,
    thumbnail: "/ohana/ohana_community_standee.jpg",
    instructor: {
      name: "Ban Điều Hành Astronixa Ohana",
      role: "Học Viện Đào Tạo Nội Bộ",
      avatar: "/ohana/astronixa_logo.jpg",
    },
    level: "Nội bộ Bắt buộc",
    totalDuration: "3 giờ 30 phút",
    studentsCount: 640,
    rating: 5.0,
    badge: "Đào Tạo Nội Bộ",
    internalPasscode: "OHANA-NOIBO-2026",
    highlights: [
      "Tầm nhìn chiến lược Hệ sinh thái Ohana Super App & văn hóa Một Vũ Trụ - Một Gia Đình",
      "Quy chuẩn tác phong, nhận diện thương hiệu và quy tắc truyền thông chuẩn Ohana Career",
      "Bài kiểm tra chuẩn hóa hội nhập & Cấp chứng nhận Nhân sự / Đối tác chính thức",
    ],
    certificateIssuer: "Ban Nhân Sự & Đào Tạo — Công Ty TNHH Astronixa",
    createdAt: "2026-10-25T00:00:00.000Z",
    chapters: [
      {
        id: "ch-in-1",
        title: "Phần 1: Tầm Nhìn, Sứ Mệnh & Hệ Sinh Thái Sản Phẩm Ohana",
        lessons: [
          {
            id: "les-in-1",
            title: "Bài 1: Triết lý 'One Universe - One Family' & Tổng quan Ohana Super App",
            duration: "25:00",
            videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
            summary:
              "Hiểu sâu về giá trị cốt lõi, hệ sinh thái kết nối cộng đồng, thương mại và giáo dục công nghệ của Astronixa Ohana.",
          },
          {
            id: "les-in-2",
            title: "Bài 2: Quy chuẩn hình ảnh & Văn hóa giao tiếp chuyên nghiệp cùng khách hàng",
            duration: "29:30",
            videoUrl: "https://vimeo.com/76979871",
            summary:
              "Hướng dẫn sử dụng bộ nhận diện thương hiệu, hình ảnh sự kiện và chuẩn mực tư vấn tận tâm của người Ohana.",
          },
          {
            id: "les-in-3",
            title: "Bài 3: Kiểm tra Hội nhập Nội bộ Ohana (Cấp chứng nhận hoàn thành)",
            duration: "10:00",
            videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
            summary: "Hoàn thành bài kiểm tra để ghi nhận hoàn tất chương trình Onboarding trên hệ thống.",
            quiz: [
              {
                id: "q-in-1",
                question: "Khẩu hiệu cốt lõi thể hiện tinh thần gắn kết của hệ sinh thái Astronixa Ohana là gì?",
                options: [
                  "Đi nhanh một mình",
                  "One Universe — One Family (Một Vũ Trụ — Một Gia Đình)",
                  "Chỉ tập trung bán hàng ngắn hạn",
                  "Mỗi cá nhân một quy trình riêng",
                ],
                correctIndex: 1,
                explanation: "One Universe — One Family là kim chỉ nam gắn kết đội ngũ và cộng đồng Ohana trên toàn quốc.",
              },
              {
                id: "q-in-2",
                question: "Khi chia sẻ thông tin khóa học hoặc chính sách tới khách hàng, nhân sự Ohana cần tuân thủ điều gì?",
                options: [
                  "Tự ý thay đổi mức học phí và cam kết ngoài quy định",
                  "Sử dụng đúng tài liệu chuẩn, minh bạch thông tin tài khoản Công ty TNHH Astronixa",
                  "Sử dụng tài khoản cá nhân không rõ nguồn gốc để thu học phí công ty",
                  "Không cần hỗ trợ học viên sau khi đăng ký",
                ],
                correctIndex: 1,
                explanation: "Sự minh bạch, chuẩn xác và đồng hành trọn đời cùng học viên là uy tín sống còn của Ohana.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-ohana-career-partner",
    slug: "quy-trinh-phat-trien-thi-truong-ohana-career",
    title: "[Nội Bộ] Cẩm Nang Phát Triển Thị Trường & Chăm Sóc Đối Tác Ohana Career",
    subtitle:
      "Kịch bản tư vấn 1:1, tổ chức Workshop địa phương và vận hành đội nhóm kinh doanh hiệu suất cao dành cho Leader Ohana.",
    category: "Đào Tạo Nội Bộ Ohana",
    accessType: "internal",
    price: 0,
    thumbnail: "/ohana/ohana_executive_training.jpg",
    instructor: {
      name: "Brian Võ & Đội Ngũ Leader Toàn Quốc",
      role: "Khối Phát Triển Thị Trường Ohana",
      avatar: "/ohana/astronixa_logo.jpg",
    },
    level: "Leader & Chuyên viên",
    totalDuration: "4 giờ 15 phút",
    studentsCount: 295,
    rating: 5.0,
    badge: "Nội bộ Leader",
    internalPasscode: "OHANA-NOIBO-2026",
    highlights: [
      "Quy trình 5 bước tổ chức buổi chia sẻ Offline / Zoom chuyển đổi cao",
      "Kịch bản đồng hành & chăm sóc học viên trước - trong - sau khóa học",
      "Ứng dụng bộ công cụ AI của Ohana để nhân bản hiệu suất đội nhóm",
    ],
    certificateIssuer: "Khối Phát Triển Thị Trường — Ohana Career",
    createdAt: "2026-11-05T00:00:00.000Z",
    chapters: [
      {
        id: "ch-cp-1",
        title: "Phần 1: Quy trình Tư vấn Giá trị & Đồng hành cùng Học viên",
        lessons: [
          {
            id: "les-cp-1",
            title: "Bài 1: Khai thác đúng nỗi đau doanh nghiệp & Thiết kế giải pháp đào tạo phù hợp",
            duration: "31:00",
            videoUrl: "https://www.youtube.com/watch?v=jHv63Uvk5VA",
            summary: "Phương pháp đặt câu hỏi chẩn đoán nhu cầu thực tế giúp khách hàng thấy rõ ROI ngay từ buổi gặp đầu tiên.",
          },
          {
            id: "les-cp-2",
            title: "Bài 2: Vận hành nhóm Zalo học viên & Quy trình hỗ trợ kỹ thuật chuẩn 5 sao",
            duration: "27:40",
            videoUrl: "https://www.youtube.com/watch?v=IHZwWFHWa-w",
            summary: "Cách duy trì năng lượng lớp học và tỷ lệ hoàn thành bài tập thực hành trên 90%.",
          },
        ],
      },
    ],
  },
  {
    id: "course-free-ai-starter",
    slug: "nhap-mon-ai-ung-dung-cho-nguoi-moi",
    title: "Nhập Môn AI Ứng Dụng — Tạo Bộ Ảnh Thương Hiệu & Video AI Đầu Tiên Trong 60 Phút",
    subtitle:
      "Khóa học cộng đồng MIỄN PHÍ 100% từ Ohana Academy giúp người mới bắt đầu tự tay làm chủ các công cụ AI phổ biến nhất hiện nay.",
    category: "Cộng Đồng Miễn Phí",
    accessType: "free",
    price: 0,
    thumbnail: "/ohana/banner_khoa_hoc_ai_ung_dung.jpg",
    instructor: {
      name: "Đội Ngũ Giảng Viên Ohana AI",
      role: "Ohana Community Education",
      avatar: "/ohana/astronixa_logo.jpg",
    },
    level: "Người mới bắt đầu",
    totalDuration: "1 giờ 20 phút",
    studentsCount: 1850,
    rating: 4.9,
    badge: "Miễn phí 100%",
    highlights: [
      "Mở khóa học ngay trong 1 chạm không tốn chi phí",
      "Làm quen giao diện ChatGPT, Gemini, công cụ tạo ảnh và tạo video ngắn",
      "Nhận bộ 20 câu lệnh (Prompt) mẫu áp dụng ngay vào công việc văn phòng & bán hàng",
    ],
    certificateIssuer: "Cộng Đồng Học Tập Ohana Academy",
    createdAt: "2026-11-12T00:00:00.000Z",
    chapters: [
      {
        id: "ch-free-1",
        title: "Khởi động nhanh cùng Trí tuệ Nhân tạo (AI)",
        lessons: [
          {
            id: "les-free-1",
            title: "Bài 1: Toàn cảnh bản đồ công cụ AI 2026 — Chọn đúng công cụ cho đúng việc",
            duration: "22:15",
            videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
            isFreePreview: true,
            summary: "Phân biệt rõ nhóm AI văn bản, AI thiết kế hình ảnh, AI dựng video và AI tự động hóa để không bị ngợp.",
          },
          {
            id: "les-free-2",
            title: "Bài 2: Thực hành viết 5 câu lệnh đầu tiên giúp tiết kiệm 2 giờ làm việc mỗi ngày",
            duration: "26:30",
            videoUrl: "https://www.youtube.com/watch?v=CZDqmPXM26A",
            isFreePreview: true,
            summary: "Áp dụng ngay vào viết bài đăng mạng xã hội, tóm tắt họp, soạn email và lên kịch bản video ngắn.",
            quiz: [
              {
                id: "q-free-1",
                question: "Khi giao việc cho AI viết nội dung, thông tin nào dưới đây giúp kết quả sát thực tế nhất?",
                options: [
                  "Chỉ ghi vỏn vẹn 2 từ 'Viết bài'",
                  "Nêu rõ Vai trò, Đối tượng người đọc, Mục tiêu bài viết và Giọng văn mong muốn",
                  "Không cho biết sản phẩm đang bán là gì",
                  "Viết câu lệnh không dấu tối nghĩa",
                ],
                correctIndex: 1,
                explanation: "Cung cấp rõ Vai trò + Ngữ cảnh + Đối tượng + Giọng văn giúp AI tạo ra nội dung sắc bén ngay lần đầu.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function createInitialDatabase(): LMSDatabase {
  return {
    users: [],
    courses: INITIAL_COURSES,
    orders: [
      {
        orderCode: "OHANA882910",
        courseId: "course-ohana-ai-academy",
        courseSlug: "ohana-ai-academy-thuc-chien",
        courseTitle: "OHANA AI ACADEMY — Làm Chủ AI Kinh Doanh Tạo Doanh Số Thực Chiến",
        userId: "user-demo-paid",
        customerName: "Nguyễn Minh Hoàng",
        customerEmail: "hoang.nguyen@gmail.com",
        customerPhone: "0909123456",
        originalAmount: 6600000,
        discountAmount: 0,
        finalAmount: 6600000,
        status: "paid",
        paymentMethod: "vietqr",
        transactionRef: "FT2632988120 - ACB VietQR",
        createdAt: "2026-11-24T09:15:00.000Z",
        paidAt: "2026-11-24T09:16:12.000Z",
      },
    ],
    coupons: [],
    activationCodes: INITIAL_ACTIVATION_CODES,
    certificates: [],
    membershipPlans: DEFAULT_MEMBERSHIP_PLANS.map((p) => ({ ...p })),
    subscriptions: {},
    affiliateCommissions: [],
    enrollments: {
      "user-student": ["course-free-ai-starter"],
      "user-internal": [
        "course-free-ai-starter",
        "course-ohana-internal-onboarding",
        "course-ohana-career-partner",
      ],
      "user-admin": INITIAL_COURSES.map((c) => c.id),
    },
    progress: {
      "user-internal": {
        "course-ohana-internal-onboarding": ["les-in-1"],
      },
    },
    quizScores: {},
  };
}
