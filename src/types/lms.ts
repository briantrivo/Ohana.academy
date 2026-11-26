export type CourseAccessType = "commercial" | "internal" | "free";

export type VideoProvider = "youtube" | "vimeo" | "mp4";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isFreePreview?: boolean;
  summary: string;
  resources?: {
    title: string;
    url: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: string;
  }[];
  quiz?: QuizQuestion[];
}

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  bannerUrl?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  accessType: CourseAccessType;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  introVideoUrl?: string;
  scheduleInfo?: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  level: string;
  totalDuration: string;
  studentsCount: number;
  rating: number;
  badge?: string;
  highlights: string[];
  targetAudience?: { title: string; description: string; outcome: string }[];
  gifts?: string[];
  gallery?: { src: string; tag: string; title: string; description: string }[];
  faqs?: { question: string; answer: string; linkUrl?: string; linkLabel?: string }[];
  certificateIssuer: string;
  certificateImage?: string;
  internalPasscode?: string;
  chapters: Chapter[];
  createdAt: string;
}

export type UserRole = "student" | "internal" | "admin";
export type AuthProviderType = "credentials" | "google";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  department?: string;
  role: UserRole;
  avatar?: string;
  authProvider?: AuthProviderType;
}

export interface UserRecord extends UserProfile {
  passwordHash?: string;
  googleSub?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface Order {
  orderCode: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: "vietqr" | "activation_code" | "manual";
  transactionRef?: string;
  createdAt: string;
  paidAt?: string;
}

export type DiscountType = "fixed" | "percent";

export interface CouponRecord {
  code: string;
  label: string;
  discountType: DiscountType;
  discountValue: number;
  targetCourseId: string | "ALL";
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface ActivationCode {
  code: string;
  label: string;
  targetCourseId: string | "ALL_INTERNAL";
  maxUses: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

export interface CertificateRecord {
  code: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  issuer: string;
  issuedAt: string;
  quizScore?: number;
}

export interface LMSDatabase {
  users: UserRecord[];
  courses: Course[];
  orders: Order[];
  coupons: CouponRecord[];
  activationCodes: ActivationCode[];
  certificates: CertificateRecord[];
  enrollments: Record<string, string[]>;
  progress: Record<string, Record<string, string[]>>;
  quizScores: Record<string, Record<string, number>>;
}
