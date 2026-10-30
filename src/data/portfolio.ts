// Single source of truth for every piece of content on the site.
// Edit here — no component touches hard-coded copy.

export const profile = {
  name: "Ezzat Ahmed",
  role: "Flutter Developer",
  tagline:
    "I build production mobile apps that ship, scale, and stay maintainable.",
  summary:
    "Flutter Developer with 3+ years of experience building scalable cross-platform mobile applications. Multiple production apps live on Google Play and the Apple App Store, specializing in Clean Architecture, BLoC, REST APIs, payment gateway integration, and high-performance mobile solutions. Experienced leading development teams in Agile environments.",
  location: "Cairo, Egypt",
  email: "ezz02879@gmail.com",
  phone: "01055818100",
  phoneHref: "tel:+201055818100",
  github: "https://github.com/EzzAboElhana",
  linkedin:
    "https://www.linkedin.com/in/ezzat-ahmed-%F0%9F%87%B5%F0%9F%87%B8-57210a296/",
  resumeUrl: "/resume.pdf",
} as const;

export const stats = [
  { value: "3+", label: "Years building with Flutter" },
  { value: "10", label: "Projects live in production" },
  { value: "7", label: "Apps on Google Play & App Store" },
] as const;

export const marquee = [
  "Flutter",
  "Dart",
  "Clean Architecture",
  "BLoC / Cubit",
  "Freezed",
  "Dio",
  "Retrofit",
  "Firebase",
  "Google Maps",
  "Paymob",
  "Stripe",
  "Hive",
  "GetIt",
  "SOLID",
  "Laravel",
  "AI-Assisted Dev",
] as const;

export type SkillGroup = { title: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    title: "Mobile Development",
    items: [
      "Flutter",
      "Dart",
      "Responsive & Adaptive UI",
      "Localization (Arabic / English, RTL)",
    ],
  },
  {
    title: "Architecture & State",
    items: [
      "Clean Architecture",
      "SOLID Principles",
      "Dependency Injection (GetIt)",
      "BLoC / Cubit",
      "Freezed",
    ],
  },
  {
    title: "AI-Assisted Development",
    items: [
      "Shipping beyond Flutter with AI",
      "Laravel backends & REST APIs",
      "Web front-ends",
      "AI-assisted debugging & refactoring",
    ],
  },
  {
    title: "APIs & Networking",
    items: [
      "RESTful API Integration",
      "Dio",
      "Retrofit",
      "Interceptors & error handling",
      "Pagination",
    ],
  },
  {
    title: "Firebase",
    items: [
      "Authentication",
      "Cloud Firestore",
      "Realtime Database",
      "Cloud Messaging",
      "Cloud Storage",
    ],
  },
  {
    title: "Payments",
    items: ["Paymob", "Stripe", "Fawry"],
  },
  {
    title: "Maps & Location",
    items: [
      "Google Maps API",
      "Places Autocomplete",
      "Directions API",
      "Geocoding",
      "Geolocator",
    ],
  },
  {
    title: "Storage & Tooling",
    items: [
      "Hive",
      "Shared Preferences",
      "Git & GitHub",
      "Agile / Scrum",
      "ClickUp",
    ],
  },
];

export type Job = {
  role: string;
  company: string;
  type: string;
  location: string;
  period: string;
  points: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    role: "Flutter Developer",
    company: "Brandomaa",
    type: "Full Time",
    location: "Cairo, Egypt",
    period: "06/2026 — Present",
    points: [
      "Architected customer apps, driver apps, and Flutter Web solutions on a feature-based modular Clean Architecture.",
      "Built the Driver App: order management, live location tracking, notifications, wallet, profile, and performance analytics.",
      "Developed a responsive Flutter Web application with reusable UI components and adaptive layouts.",
      "Applied Repository Pattern, Use Cases, and Dependency Injection for scalability and maintainability.",
      "Managed state with BLoC/Cubit + Freezed for immutable, predictable state handling.",
      "Built a type-safe networking layer with Dio, Retrofit, interceptors, centralized error handling, and paginated responses.",
      "Implemented real-time order tracking with Google Maps, Geolocator, and Geocoding.",
      "Integrated Firebase Cloud Messaging and local notifications for live order updates.",
      "Delivered a fully localized Arabic/English RTL-ready UI with skeleton loading states.",
    ],
    stack: [
      "Clean Architecture",
      "BLoC",
      "Freezed",
      "Dio",
      "Retrofit",
      "Google Maps",
      "Hive",
      "GitHub",
    ],
  },
  {
    role: "Flutter Team Leader",
    company: "Selivery",
    type: "Full Time",
    location: "Cairo, Egypt",
    period: "05/2024 — 06/2026",
    points: [
      "Led development of both the customer and driver mobile applications.",
      "Designed scalable application architecture following Clean Architecture principles.",
      "Planned feature implementation, task distribution, and development workflow.",
      "Ran code reviews and mentored team members to maintain high code quality.",
      "Collaborated with backend, UI/UX, and QA teams across Agile cycles.",
      "Implemented transportation features, trip management, and notification systems.",
    ],
    stack: ["Cubit", "REST APIs", "Google Maps", "GitHub"],
  },
  {
    role: "Flutter Developer",
    company: "Mixcode",
    type: "Remote",
    location: "Giza, Egypt",
    period: "06/2025 — 10/2025",
    points: [
      "Developed and maintained cross-platform mobile applications with Flutter.",
      "Integrated third-party APIs and optimized application performance.",
      "Collaborated remotely using Agile methodology and ClickUp.",
      "Contributed clean, maintainable, reusable code to a shared codebase.",
    ],
    stack: ["REST APIs", "Google Maps", "GitHub", "ClickUp"],
  },
  {
    role: "Flutter Developer",
    company: "Yalla",
    type: "Part Time",
    location: "Cairo, Egypt",
    period: "06/2024 — 09/2024",
    points: [
      "Developed production-ready mobile features and reusable UI components.",
      "Integrated backend REST APIs and optimized application performance.",
      "Worked with designers and backend developers to deliver new features.",
      "Improved application responsiveness and overall user experience.",
    ],
    stack: ["Clean Architecture", "REST APIs", "GitHub"],
  },
  {
    role: "Flutter Developer",
    company: "Silver Triangle",
    type: "Full Time",
    location: "Giza, Egypt",
    period: "07/2023 — 11/2024",
    points: [
      "Developed scalable cross-platform applications with Flutter and Clean Architecture.",
      "Integrated REST APIs and Firebase services for real-time data synchronization.",
      "Implemented secure payment gateway integration, including Fawry.",
      "Built responsive, adaptive interfaces across a wide range of screen sizes.",
      "Applied BLoC/Cubit state management to improve maintainability.",
    ],
    stack: ["Cubit", "Firebase", "REST APIs", "Fawry", "Google Maps", "GitHub"],
  },
];

/**
 * Which mock interface stands in for the project in the gallery. There are no
 * store screenshots for these apps, so each card draws a small, recognisable
 * version of the product's own screen instead of showing an empty frame.
 */
export type ProjectPreview =
  "food" | "rider" | "driver" | "assist" | "shop" | "web" | "api";

/**
 * A real store screenshot, already cropped to the device render the store
 * listing shipped it in. When present it replaces the drawn `preview`.
 */
export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Project = {
  name: string;
  preview: ProjectPreview;
  image?: ProjectImage;
  /** Square cover art for the work grid; replaces the device when set. */
  cover?: ProjectImage;
  category: string;
  description: string;
  features: string[];
  stack: string[];
  links?: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    name: "TripU",
    cover: {
      src: "/projects/covers/tripu.jpg",
      width: 1000,
      height: 1000,
      alt: "TripU rider app: driver offers and the trip-type picker on two tilted phones",
    },
    image: {
      src: "/projects/tripu.png",
      width: 300,
      height: 604,
      alt: "TripU home screen with the map, trip types and destination search",
    },
    preview: "rider",
    category: "Ride Hailing · Rider",
    description:
      "Ride-hailing application for booking trips, tracking drivers in real time, estimating fares, and managing scheduled rides.",
    features: [
      "Real-time GPS tracking",
      "Fare estimation",
      "Scheduled rides",
      "Favorite drivers",
      "Emergency alerts",
      "In-app support chat",
    ],
    stack: ["Flutter", "Firebase", "Google Maps API", "REST APIs"],
    links: [
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.user.tripu",
      },
    ],
  },
  {
    name: "TripU Captain",
    cover: {
      src: "/projects/covers/tripu-captain.jpg",
      width: 1000,
      height: 1000,
      alt: "TripU Captain splash, ride offers and online map on three isometric phones",
    },
    image: {
      src: "/projects/tripu-captain.png",
      width: 632,
      height: 1297,
      alt: "TripU Captain showing the driver online with today's fare on the map",
    },
    preview: "driver",
    category: "Ride Hailing · Driver",
    description:
      "Driver companion app for managing ride requests, navigation, earnings, customer ratings, and emergency assistance.",
    features: [
      "Real-time ride requests",
      "GPS navigation",
      "Earnings dashboard",
      "Ratings & reviews",
      "Emergency assistance",
    ],
    stack: ["Flutter", "Firebase", "Google Maps API", "REST APIs"],
    links: [
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.tripu.tripu",
      },
    ],
  },
  {
    name: "Selivery Client",
    cover: {
      src: "/projects/covers/selivery-client.jpg",
      width: 1000,
      height: 1000,
      alt: "Selivery client app: driver-arrived confirmation and the vehicle-type picker on two tilted phones",
    },
    image: {
      src: "/projects/selivery-client.png",
      width: 517,
      height: 955,
      alt: "Selivery vehicle picker listing cars, motorcycles, tuk-tuks and microbuses",
    },
    preview: "rider",
    category: "Transportation · Customer",
    description:
      "Transportation booking application for requesting direct, hourly, and daily trips with real-time tracking.",
    features: [
      "Trip booking",
      "Vehicle selection",
      "Booking flow",
      "Trip tracking",
      "Responsive UI",
    ],
    stack: ["Flutter", "Firebase", "Google Maps API", "REST APIs"],
    links: [
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.selivery_client",
      },
    ],
  },
  {
    name: "Selivery Driver",
    cover: {
      src: "/projects/covers/selivery-driver.jpg",
      width: 1000,
      height: 1000,
      alt: "Selivery driver app: request type, sign-in and vehicle list on three isometric phones",
    },
    preview: "driver",
    category: "Transportation · Driver",
    description:
      "Driver application for receiving trips, managing availability, handling ride status updates, and trip operations.",
    features: [
      "Trip requests",
      "Availability management",
      "Ride status updates",
      "Notifications",
      "Driver operations UI",
    ],
    stack: ["Flutter", "Firebase", "Google Maps API", "REST APIs"],
    links: [
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.selivery_driver",
      },
    ],
  },
  {
    name: "Mosaada",
    cover: {
      src: "/projects/covers/mosaada.jpg",
      width: 1000,
      height: 1000,
      alt: "Mosaada live tow-truck tracking and nearby workshops on two tilted phones",
    },
    image: {
      src: "/projects/mosaada.jpg",
      width: 648,
      height: 1378,
      alt: "Mosaada tracking a dispatched tow truck to the driver's location",
    },
    preview: "assist",
    category: "Roadside Assistance · UAE",
    description:
      "Roadside assistance platform in the UAE connecting drivers with towing services and nearby verified providers.",
    features: [
      "Towing requests",
      "Real-time location sharing",
      "Nearby providers",
      "Provider verification",
    ],
    stack: ["Flutter", "Google Maps", "REST APIs"],
    links: [
      {
        label: "App Store",
        url: "https://apps.apple.com/eg/app/mosaada/id6746171199",
      },
    ],
  },
  {
    name: "E-Shop",
    preview: "shop",
    category: "E-Commerce",
    description:
      "E-commerce application for browsing products, secure checkout, personalized recommendations, and order tracking.",
    features: [
      "Product filtering",
      "Secure payments",
      "Recommendations",
      "Real-time order tracking",
    ],
    stack: ["Flutter", "REST APIs"],
  },
  {
    name: "Doctor Box Driver",
    cover: {
      src: "/projects/covers/doctor-box-driver.jpg",
      width: 1000,
      height: 1000,
      alt: "Doctor Box Driver: new order, order details and turn-by-turn directions on three isometric phones",
    },
    preview: "driver",
    category: "Delivery / Driver App",
    description:
      "Driver delivery application built for Brandomaa to manage orders, live tracking, wallet, notifications, profile, and performance analytics.",
    features: [
      "Order management",
      "Live location tracking",
      "Wallet",
      "Notifications",
      "Performance analytics",
    ],
    stack: [
      "Flutter",
      "Clean Architecture",
      "BLoC/Cubit",
      "Dio",
      "Retrofit",
      "Google Maps",
      "Hive",
    ],
    links: [
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.docbox.driver",
      },
      { label: "App Store", url: "https://apps.apple.com/eg/app/id6802412344" },
    ],
  },
  {
    name: "Doctor Box",
    cover: {
      src: "/projects/covers/doctor-box.jpg",
      width: 1000,
      height: 1000,
      alt: "Doctor Box customer app: menu and meal search on two tilted phones",
    },
    preview: "food",
    category: "Food Ordering · Customer",
    description:
      "Customer-facing food ordering app for the Doctor Box platform, running on a Laravel backend-for-frontend over the Foodics core API. 23 features across catalog, cart, fulfilment, loyalty and support.",
    features: [
      "Branch & menu browsing",
      "Cart and checkout",
      "Delivery / pickup fulfilment",
      "Loyalty & offers",
      "Order tracking",
      "Reviews & complaints",
      "Arabic / English localisation",
    ],
    stack: [
      "Flutter",
      "Clean Architecture",
      "BLoC/Cubit",
      "get_it + injectable",
      "Dio",
      "Retrofit",
      "Hive",
      "easy_localization",
    ],
    links: [
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.doctorbox.android",
      },
      { label: "App Store", url: "https://apps.apple.com/eg/app/id6749037878" },
    ],
  },
  {
    name: "Doctor Box Website",
    cover: {
      src: "/projects/covers/doctor-box-website.jpg",
      width: 1000,
      height: 1000,
      alt: "Doctor Box website on desktop with the mobile version in front",
    },
    preview: "web",
    category: "Flutter Web",
    description:
      "Responsive Flutter Web application supporting the Doctor Box platform, built on reusable UI components and adaptive layouts.",
    features: ["Responsive web UI", "Reusable components", "Adaptive layouts"],
    stack: [
      "Flutter Web",
      "Dart",
      "Clean Architecture",
      "REST APIs",
      "AI-assisted",
    ],
    links: [{ label: "Website", url: "https://website.drbox-eg.com" }],
  },
  {
    name: "Doctor Box Backend",
    cover: {
      src: "/projects/covers/doctor-box-backend.jpg",
      width: 1000,
      height: 1000,
      alt: "Doctor Box Laravel API: route list and a JSON response in two code windows",
    },
    preview: "api",
    category: "Backend · Laravel BFF",
    description:
      "Laravel backend-for-frontend behind the Doctor Box apps. It fronts the Foodics core API for catalog, customers and orders, and owns everything Foodics does not: auth, cart, addresses, loyalty, content and tracking.",
    features: [
      "Foodics Core API v5 integration",
      "Token auth with Sanctum",
      "Ordering & loyalty modules",
      "Queued jobs for push, SMS & WhatsApp",
      "Admin API for the React dashboard",
      "Reporting endpoints",
    ],
    stack: [
      "PHP 8.3",
      "Laravel",
      "Sanctum",
      "MySQL",
      "REST APIs",
      "Queued jobs",
      "PHPUnit",
      "AI-assisted",
    ],
  },
];

export const strengths = [
  "Strong problem-solving and debugging",
  "Production-level mobile development",
  "Publishing on Google Play & App Store",
  "Code review and team collaboration",
  "Agile / Scrum workflow",
  "Clean, maintainable, scalable code",
  "Ships backend & web too, with AI in the loop",
] as const;

export const education = {
  degree: "Bachelor of Computer Science and Information Systems",
  school: "New Cairo Academy",
  period: "09/2021 — 07/2025",
  location: "Cairo, Egypt",
} as const;

export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "Professional" },
] as const;

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const;
