"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting database seed...");
    await prisma.assessmentResult.deleteMany();
    await prisma.childProfile.deleteMany();
    await prisma.question.deleteMany();
    await prisma.tip.deleteMany();
    await prisma.worksheet.deleteMany();
    await prisma.user.deleteMany();
    // =========================
    // PASSWORD HASH
    // =========================
    const hashedPassword = await bcryptjs_1.default.hash("password123", 10);
    // =========================
    // USERS
    // =========================
    await prisma.user.create({
        data: {
            email: "admin@skillpathkids.com",
            password: hashedPassword,
            name: "Administrator SkillPath",
            role: client_1.Role.ADMINISTRATOR,
        },
    });
    await prisma.user.create({
        data: {
            email: "teacher@skillpathkids.com",
            password: hashedPassword,
            name: "Teacher Sarah",
            role: client_1.Role.TEACHER,
        },
    });
    const parent = await prisma.user.create({
        data: {
            email: "parent@skillpathkids.com",
            password: hashedPassword,
            name: "Budi Santoso",
            role: client_1.Role.PARENT,
        },
    });
    // =========================
    // CHILD PROFILE
    // =========================
    const child = await prisma.childProfile.create({
        data: {
            name: "Alya",
            ageMonths: 48,
            avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alya",
            parentId: parent.id,
        },
    });
    // =========================
    // QUESTIONS
    // =========================
    await prisma.question.createMany({
        data: [
            {
                text: "Anak dapat memegang pensil dengan benar.",
                category: "Motorik Halus",
                iconName: "Pencil",
                colorClass: "bg-primary-container",
                level: "CHILD",
            },
            {
                text: "Anak mampu melompat dengan seimbang.",
                category: "Motorik Kasar",
                iconName: "Activity",
                colorClass: "bg-secondary-container",
                level: "CHILD",
            },
            {
                text: "Anak dapat menyebutkan warna dasar.",
                category: "Kognitif",
                iconName: "Brain",
                colorClass: "bg-accent-container",
                level: "CHILD",
            },
            {
                text: "Anak mampu berbicara dalam kalimat sederhana.",
                category: "Bahasa",
                iconName: "MessageCircle",
                colorClass: "bg-primary",
                level: "CHILD",
            },
            {
                text: "Anak bermain bersama teman sebaya.",
                category: "Sosial",
                iconName: "Users",
                colorClass: "bg-secondary",
                level: "CHILD",
            },
            {
                text: "Guru mampu merancang observasi perkembangan anak berbasis indikator yang terukur.",
                category: "Asesmen Profesional",
                iconName: "ClipboardCheck",
                colorClass: "bg-primary-container",
                level: "TEACHER",
            },
            {
                text: "Guru mampu menyesuaikan strategi pembelajaran berdasarkan profil perkembangan individual anak.",
                category: "Diferensiasi",
                iconName: "Brain",
                colorClass: "bg-tertiary-container",
                level: "TEACHER",
            },
            {
                text: "Guru mampu mengkomunikasikan hasil asesmen kepada orang tua dengan bahasa yang jelas dan suportif.",
                category: "Komunikasi",
                iconName: "MessageCircle",
                colorClass: "bg-secondary-container",
                level: "TEACHER",
            },
            {
                text: "Guru mampu mengevaluasi efektivitas aktivitas kelas dari data perkembangan beberapa anak.",
                category: "Analitik Kelas",
                iconName: "BarChart3",
                colorClass: "bg-error-container",
                level: "TEACHER",
            },
        ],
    });
    // =========================
    // TIPS
    // =========================
    await prisma.tip.createMany({
        data: [
            {
                id: crypto.randomUUID(),
                title: "Latihan Menggunting",
                description: "Ajak anak menggunting kertas dengan pola sederhana untuk melatih motorik halus.",
                category: "Motorik Halus",
                duration: "15 Menit",
                iconName: "Scissors",
                isMain: true,
            },
            {
                id: crypto.randomUUID(),
                title: "Bermain Bola",
                description: "Latih koordinasi dan keseimbangan anak dengan bermain lempar tangkap bola.",
                category: "Motorik Kasar",
                duration: "20 Menit",
                iconName: "Circle",
                isMain: false,
            },
            {
                id: crypto.randomUUID(),
                title: "Mengenal Warna",
                description: "Gunakan benda sekitar rumah untuk mengenalkan warna pada anak.",
                category: "Kognitif",
                duration: "10 Menit",
                iconName: "Palette",
                isMain: false,
            },
        ],
    });
    // =========================
    // WORKSHEETS
    // =========================
    await prisma.worksheet.createMany({
        data: [
            {
                id: crypto.randomUUID(),
                title: "Busy Book Look! Animal",
                slug: "busy-book-look-animal",
                description: "Busy book interaktif bertema hewan untuk membantu anak mengenal nama, bentuk, warna, dan habitat melalui aktivitas mencocokkan dan menempel.",
                shortDescription: "Busy book hewan dengan aktivitas matching, sorting, dan vocabulary.",
                category: "Buku Montessori",
                subCategory: "Animal",
                price: 89000,
                discountPrice: 69000,
                discountPercent: 22,
                url: "https://example.com/busy-book-look-animal.pdf",
                variant: client_1.WorksheetVariant.PAID,
                mainImageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4",
                galleryImages: [
                    "https://images.unsplash.com/photo-1503919545889-aef636e10ad4",
                    "https://images.unsplash.com/photo-1542816417-0983c9c9ad53",
                    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4",
                ],
                rating: 4.9,
                reviewCount: 187,
                soldCount: 1260,
                stock: 320,
                badge: "Best Seller",
                badges: ["Best Seller", "Promo", "Digital"],
                features: [
                    "Tema hewan darat dan laut",
                    "Aktivitas matching gambar dan nama",
                    "Instruksi pendamping untuk orang tua/guru",
                ],
                specifications: {
                    format: "PDF",
                    pages: 42,
                    ageRange: "4-6 tahun",
                    language: "Indonesia",
                },
                shippingInfo: {
                    type: "Digital download",
                    delivery: "Link download tersedia setelah checkout",
                },
                isBestSeller: true,
                isPromo: true,
                isPublished: true,
                accentColor: "primary",
                iconName: "BookOpen",
            },
            {
                id: crypto.randomUUID(),
                title: "Busy Book Elementary Cognition",
                slug: "busy-book-elementary-cognition",
                description: "Paket busy book untuk latihan kognitif dasar: bentuk, pola, urutan, perbandingan, dan pemecahan masalah sederhana.",
                shortDescription: "Latihan kognitif dasar melalui aktivitas visual yang bertahap.",
                category: "Buku Montessori",
                subCategory: "Kognitif",
                price: 99000,
                discountPrice: 79000,
                discountPercent: 20,
                url: "https://example.com/busy-book-elementary-cognition.pdf",
                variant: client_1.WorksheetVariant.PAID,
                mainImageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
                galleryImages: [
                    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
                    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
                    "https://images.unsplash.com/photo-1604881991720-f91add269bed",
                ],
                rating: 4.8,
                reviewCount: 143,
                soldCount: 980,
                stock: 280,
                badge: "Premium",
                badges: ["Premium", "Best Seller"],
                features: [
                    "Aktivitas pola dan urutan",
                    "Latihan klasifikasi bentuk dan warna",
                    "Level bertahap dari mudah ke menantang",
                ],
                specifications: {
                    format: "PDF",
                    pages: 48,
                    ageRange: "4-7 tahun",
                    language: "Indonesia",
                },
                shippingInfo: {
                    type: "Digital download",
                    delivery: "Link download tersedia setelah checkout",
                },
                isBestSeller: true,
                isPromo: false,
                isPublished: true,
                accentColor: "secondary",
                iconName: "Brain",
            },
            {
                id: crypto.randomUUID(),
                title: "Worksheet Motorik Halus",
                slug: "worksheet-motorik-halus",
                description: "Worksheet latihan motorik halus untuk menggunting, menebalkan garis, tracing bentuk, dan koordinasi tangan-mata.",
                shortDescription: "Latihan tracing, cutting, dan pre-writing untuk motorik halus.",
                category: "Worksheet Anak",
                subCategory: "Motorik Halus",
                price: 39000,
                discountPrice: 29000,
                discountPercent: 25,
                url: "https://example.com/worksheet-motorik-halus.pdf",
                variant: client_1.WorksheetVariant.PAID,
                mainImageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
                galleryImages: [
                    "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
                    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b",
                    "https://images.unsplash.com/photo-1516627145497-ae6968895b74",
                ],
                rating: 4.7,
                reviewCount: 96,
                soldCount: 620,
                stock: 500,
                badge: "Promo",
                badges: ["Promo", "Printable"],
                features: [
                    "Tracing garis dan bentuk",
                    "Aktivitas menggunting sederhana",
                    "Format A4 siap cetak",
                ],
                specifications: {
                    format: "PDF",
                    pages: 32,
                    ageRange: "3-6 tahun",
                    language: "Indonesia",
                },
                shippingInfo: {
                    type: "Digital download",
                    delivery: "Langsung tersedia setelah checkout",
                },
                isBestSeller: false,
                isPromo: true,
                isPublished: true,
                accentColor: "tertiary",
                iconName: "Scissors",
            },
            {
                id: crypto.randomUUID(),
                title: "Paket Montessori Complete Set",
                slug: "paket-montessori-complete-set",
                description: "Bundle lengkap worksheet dan activity book Montessori untuk literasi, numerasi, sensorial, motorik, dan practical life.",
                shortDescription: "Bundle lengkap aktivitas Montessori untuk belajar di rumah dan kelas.",
                category: "Paket Bundle",
                subCategory: "Complete Set",
                price: 199000,
                discountPrice: 149000,
                discountPercent: 25,
                url: "https://example.com/paket-montessori-complete-set.pdf",
                variant: client_1.WorksheetVariant.PAID,
                mainImageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350",
                galleryImages: [
                    "https://images.unsplash.com/photo-1588072432836-e10032774350",
                    "https://images.unsplash.com/photo-1509062522246-3755977927d7",
                    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
                ],
                rating: 5,
                reviewCount: 211,
                soldCount: 1520,
                stock: 180,
                badge: "Mega Bundle",
                badges: ["Best Seller", "Bundle", "Hemat"],
                features: [
                    "5 modul perkembangan anak",
                    "Cocok untuk rumah dan PAUD/TK",
                    "Bonus panduan aktivitas",
                ],
                specifications: {
                    format: "PDF",
                    pages: 160,
                    ageRange: "3-7 tahun",
                    language: "Indonesia",
                },
                shippingInfo: {
                    type: "Digital download",
                    delivery: "Link bundle tersedia setelah checkout",
                },
                isBestSeller: true,
                isPromo: true,
                isPublished: true,
                accentColor: "primary",
                iconName: "BookOpen",
            },
            {
                id: crypto.randomUUID(),
                title: "Flashcard Alfabet Anak",
                slug: "flashcard-alfabet-anak",
                description: "Flashcard alfabet printable dengan ilustrasi objek sehari-hari untuk memperkuat pengenalan huruf dan kosakata awal.",
                shortDescription: "Flashcard A-Z printable untuk literasi awal anak.",
                category: "Flashcard",
                subCategory: "Alfabet",
                price: 29000,
                discountPrice: null,
                discountPercent: null,
                url: "https://example.com/flashcard-alfabet-anak.pdf",
                variant: client_1.WorksheetVariant.PAID,
                mainImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
                galleryImages: [
                    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
                    "https://images.unsplash.com/photo-1519682337058-a94d519337bc",
                ],
                rating: 4.6,
                reviewCount: 58,
                soldCount: 360,
                stock: 700,
                badge: "New",
                badges: ["New", "Printable"],
                features: [
                    "Kartu alfabet A-Z",
                    "Ilustrasi objek familiar",
                    "Bisa dipotong menjadi kartu belajar",
                ],
                specifications: {
                    format: "PDF",
                    pages: 13,
                    ageRange: "3-5 tahun",
                    language: "Indonesia",
                },
                shippingInfo: {
                    type: "Digital download",
                    delivery: "Langsung tersedia setelah checkout",
                },
                isBestSeller: false,
                isPromo: false,
                isPublished: true,
                accentColor: "secondary",
                iconName: "FileText",
            },
            {
                id: crypto.randomUUID(),
                title: "Worksheet Pre-Writing",
                slug: "worksheet-pre-writing",
                description: "Worksheet pre-writing untuk melatih kontrol pensil melalui garis lurus, lengkung, zig-zag, bentuk dasar, dan pola berulang.",
                shortDescription: "Latihan kontrol pensil dan pola dasar sebelum anak belajar menulis.",
                category: "Worksheet Anak",
                subCategory: "Pre-Writing",
                price: 0,
                discountPrice: null,
                discountPercent: 0,
                url: "https://example.com/worksheet-pre-writing.pdf",
                variant: client_1.WorksheetVariant.FREE,
                mainImageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
                galleryImages: [
                    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
                    "https://images.unsplash.com/photo-1516627145497-ae6968895b74",
                ],
                rating: 4.8,
                reviewCount: 132,
                soldCount: 910,
                stock: 999,
                badge: "Free",
                badges: ["Free", "Popular"],
                features: [
                    "Latihan garis dasar",
                    "Pola zig-zag dan lengkung",
                    "Cocok untuk pemanasan menulis",
                ],
                specifications: {
                    format: "PDF",
                    pages: 24,
                    ageRange: "3-5 tahun",
                    language: "Indonesia",
                },
                shippingInfo: {
                    type: "Digital download",
                    delivery: "Langsung tersedia setelah checkout",
                },
                isBestSeller: true,
                isPromo: false,
                isPublished: true,
                accentColor: "accent",
                iconName: "Pencil",
            },
        ],
    });
    // =========================
    // ASSESSMENT RESULT
    // =========================
    await prisma.assessmentResult.create({
        data: {
            userId: parent.id,
            childProfileId: child.id,
            answers: {
                "1": 4,
                "2": 3,
                "3": 5,
                "4": 4,
                "5": 5,
            },
            overallScore: 84,
            categoryResult: "Baik",
            focusSummary: "Perkembangan anak sangat baik pada aspek kognitif dan sosial.",
            focusAreas: ["Motorik Halus", "Bahasa"],
            skillsData: {
                motorikHalus: 75,
                motorikKasar: 80,
                bahasa: 78,
                sosial: 92,
                kognitif: 95,
            },
        },
    });
    console.log("✅ Database seeded successfully!");
    console.log("👩 Teacher Login:");
    console.log("Administrator Login:");
    console.log("   Email: admin@skillpathkids.com");
    console.log("   Password: password123");
    console.log("   Email: teacher@skillpathkids.com");
    console.log("   Password: password123");
    console.log("👨 Parent Login:");
    console.log("   Email: parent@skillpathkids.com");
    console.log("   Password: password123");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
