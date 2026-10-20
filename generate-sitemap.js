const fs = require('fs');
const path = require('path');

// আপনার ওয়েবসাইটের ডোমেইন
const DOMAIN = 'https://farjan-kabir-portfolio.netlify.app';

// ১. ব্লগের ডেটা পড়া
const blogData = JSON.parse(fs.readFileSync(path.join(__dirname, 'content/blog.json'), 'utf8'));
const posts = blogData.posts || [];

// ২. সাইটম্যাপের মূল কাঠামো তৈরি
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// ৩. মেইন পেজগুলো যোগ করা
const staticPages = [
  { url: '', priority: '1.0' },
  { url: 'cv.html', priority: '0.8' },
  { url: 'blog.html', priority: '0.8' }
];

staticPages.forEach(page => {
  xml += `  <url>\n    <loc>${DOMAIN}/${page.url}</loc>\n    <priority>${page.priority}</priority>\n  </url>\n`;
});

// ৪. প্রতিটি ব্লগ পোস্টের লিংক যোগ করা
posts.forEach(post => {
  xml += `  <url>\n    <loc>${DOMAIN}/blog-post.html?slug=${post.slug}</loc>\n    <priority>0.7</priority>\n  </url>\n`;
});

xml += `</urlset>`;

// ৫. sitemap.xml ফাইলে সেভ করা
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml);
console.log('✅ sitemap.xml successfully generated with', posts.length, 'blog posts!');