import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "StillCraft Events Co.",
  tagline: "Crafting Unforgettable Moments",
  description: "StillCraft Events Co. specializes in creating extraordinary events through innovative event planning, dynamic activations, and bespoke experiences. Based in Nairobi, Kenya, our expert team transforms your vision into a memorable reality.",
  description_short: "Creating extraordinary events with precision and creativity in Nairobi, Kenya.",
  url: "https://stillcraftevents.co.ke",
  author: "rmmwalali",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: Crafting Unforgettable Moments & Bespoke Event Experiences`,
  description: "Experience the magic of extraordinary events with StillCraft Events Co. From dynamic activations and creative event concepts to flawless event planning, our team in Nairobi, Kenya is dedicated to bringing your vision to life.",
  image: ogImageSrc,
};


export const partnersData = [
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248722/logo-256x84_vtfcuf.webp`,
        name: "first",
        href: "#",
    },
    
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248720/images_auwahi.jpg`,
        name: "Third",
        href: "#",
    },

    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248718/images_3_m3xku9.png`,
        name: "Fourth",
        href: "#",
  },
        {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248717/images_2_o3tfm2.png`,
        name: "Fifth",
        href: "#",
  },
      
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248716/images_1_itexcl.png`,
        name: "Sixth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248713/download_ctgegb.png`,
        name: "Seventh",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248713/download_nunz2o.jpg`,
        name: "Eighth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248712/download_8_r0kkae.png`,
        name: "Ninth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248711/download_6_dri25v.png`,
        name: "Tenth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248707/download_4_c6ztq8.png`,
        name: "Eleventh",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248712/download_7_hiaqcx.png`,
        name: "Twelfth",
        href: "#",
  },
        {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248706/download_2_avfhkj.png`,
        name: "Thirteenth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248707/download_5_jvadl2.png`,
        name: "Fourteenth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248706/download_3_nnrcfp.png`,
        name: "Fifteenth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248706/download_1_q9uwk6.png`,
        name: "Sixteenth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248706/Carrefour-Logo_vzdahr.png`,
        name: "Seventeenth",
        href: "#",
  },
    {
        icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248706/radio_africa_group_logo_nckqod.jpg`,
        name: "Eighteenth",
        href: "#",
  },
  {
      icon: `https://res.cloudinary.com/dtnbwgpca/image/upload/v1744280469/WWW-logo_1_iulc7e.png`,
    name: "Nineteenth", 
    href: "#",
    },
]