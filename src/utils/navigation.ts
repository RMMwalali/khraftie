// An array of links for navigation bar
const navBarLinks = [
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
  { name: "Services", url: "/services" },
  { name: "Blog", url: "/blog" },
  { name: "Contact", url: "/contact" },
];
// An array of links for footer
const footerLinks = [
  {
    section: "Company",
    links: [
      { name: "About us", url: "/about" },
      { name: "Our Services", url: "/services" },
      { name: "Contact Us", url: "/contact" },
    ],
  },
];
// An object of links for social icons
const socialLinks = {
  facebook: "https://www.facebook.com/people/StillCraft-Events-Co/100079965229476/",
  instagram: "https://www.instagram.com/stillcraftevents/",
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};