# Cosmic Data Reference

Copy and paste these values into your Cosmic objects after creating the content types.

## Hero Content (slug: homepage-hero)

```json
{
  "title": "Welcome to StillCraft Events Co.",
  "subTitle": "We specialize in crafting experiences that leave lasting impressions—whether through living human statues, luxury activations, dynamic event planning, or bespoke branding.",
  "primaryBtn": "Learn More",
  "primaryBtnURL": "/about",
  "secondaryBtn": "Contact Us",
  "secondaryBtnURL": "/contact",
  "withReview": false,
  "videoSrc": "https://res.cloudinary.com/dtnbwgpca/video/upload/v1743496881/stillkraft_edfoql.mp4",
  "videoType": "video/mp4",
  "alt": "Promotional video for StillCraft Events"
}
```

## Clients Content (slug: homepage-clients)

```json
{
  "title": "Trusted by Industry Leaders",
  "subTitle": "Delivering Exceptional Events for Top Brands & Organizations.",
  "partners": [
    {
      "name": "Carrefour",
      "icon": "https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248722/logo-256x84_vtfcuf.webp",
      "href": "#"
    },
    {
      "name": "Radio Africa Group",
      "icon": "https://res.cloudinary.com/dtnbwgpca/image/upload/v1743248713/download_ctgegb.png",
      "href": "#"
    }
    // ... add all other partners from the JSON file
  ]
}
```

## Features General (slug: homepage-features-general)

```json
{
  "title": "Meeting Industry Demands",
  "subTitle": "At StillCraft Events, we understand the unique challenges of planning and executing exceptional events. From innovative event concepts to seamless coordination, we're dedicated to delivering experiences that captivate and inspire.",
  "image": "/uploads/feature.jpg",
  "imageAlt": "still craft events feature image",
  "features": [
    {
      "heading": "Dedicated Teams",
      "content": "Benefit from our committed teams who ensure your event success is personal. Count on expert guidance and exceptional results throughout your event journey.",
      "svg": "groups"
    },
    {
      "heading": "Effortless Planning and Value",
      "content": "Discover seamless event solutions that blend simplicity with affordability. Our tailored services make planning effortless while keeping your event budget-friendly.",
      "svg": "verified"
    },
    {
      "heading": "Detailed Planning Resources",
      "content": "Integrate every detail with our comprehensive planning guides and resources. We ensure a seamless experience by capturing every element of your event for success.",
      "svg": "books"
    },
    {
      "heading": "Guest-Centric Experience",
      "content": "Experience the difference with our guest-focused event design—where creativity meets functionality to create engaging and memorable moments.",
      "svg": "frame"
    }
  ]
}
```

## Testimonials (slug: homepage-testimonials)

```json
{
  "title": "Elevate Your Events Instantly",
  "subTitle": "At StillCraft Events Co., we bring your event vision to life swiftly and seamlessly. Enjoy a hassle-free experience with our expert planning team, ensuring every detail is perfectly in place.",
  "testimonials": [
    {
      "content": "StillCraft Events Co. transformed our corporate gala into an unforgettable experience. Their prompt service and creative flair truly set them apart in Kenya's events scene!",
      "author": "Rehema Hassan",
      "role": "Managing Director | Safari Ventures Ltd.",
      "avatarSrc": "https://res.cloudinary.com/dtnbwgpca/image/upload/v1743424839/image-1_s3hkhi.png"
    }
  ],
  "statistics": [
    { "count": "90+", "description": "Unforgettable events crafted with precision" },
    { "count": "120+", "description": "Satisfied clients across diverse industries" },
    { "count": "99%", "description": "Client satisfaction achieved through excellence" },
    { "count": "8 Years", "description": "of experience in delivering extraordinary events" }
  ]
}
```

## FAQ (slug: homepage-faq)

```json
{
  "title": "Frequently Asked Questions",
  "faqs": {
    "subTitle": "Find answers to common questions about our event planning services.",
    "faqs": [
      {
        "question": "What types of events do you specialize in?",
        "answer": "We specialize in corporate events, luxury activations, brand experiences, and bespoke event planning tailored to your specific needs."
      },
      {
        "question": "How far in advance should we book your services?",
        "answer": "We recommend booking at least 3-6 months in advance for major events to ensure availability and proper planning time."
      }
      // Add more FAQs from the JSON file
    ]
  }
}
```

## Call To Action (slug: homepage-cta)

```json
{
  "title": "Ready to Create Your Next Unforgettable Event?",
  "subTitle": "Let's collaborate to bring your vision to life with our expert event planning services.",
  "buttonLabel": "Get Started",
  "url": "/contact"
}
```

## Notes:
- For image fields, upload the images directly in Cosmic and use the Cosmic URLs
- For repeater fields, add each item individually in the Cosmic interface
- Make sure all field names (keys) match exactly as shown above
- The slugs must match exactly: homepage-hero, homepage-clients, etc.
