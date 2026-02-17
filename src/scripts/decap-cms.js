// Load Decap CMS
const script = document.createElement('script');
script.src = 'https://unpkg.com/decap-cms@^3.3.0/dist/decap-cms.js';
script.onload = () => {
  console.log('Decap CMS loaded');
};
document.head.appendChild(script);
