# Content-only updates

You normally do **not** need to edit `index.html`, `style.css` or `script.js`.

## Add a project
1. Put the project's images/video inside `assets/projects/your-project-name/`.
2. Open `content/projects.json`.
3. Copy the example object from `content/project-template.json` into the `projects` array.
4. Change only the text and asset paths.
5. Save and deploy.

A project can contain:
- cover image
- categories
- role
- tools
- live URL
- challenge
- approach
- what you did
- process
- result
- screenshots
- before/after images
- optional project video

The website automatically creates the card, filters and full case-study viewer.

## Add your introduction video
Put your final video here:
`assets/videos/intro.mp4`

No HTML/CSS/JS change is needed. The Home page introduction-video section automatically appears when that file exists.

## Add the 40-second featured project video
Put it here:
`assets/videos/featured-project.mp4`

No code change is needed. The Featured Project video section automatically appears when the file exists.

## Add a blog post
1. Open `content/blog.json`.
2. Copy an object from `content/blog-template.json` into the `posts` array.
3. Give it a unique `slug`.
4. Put the cover image in `assets/blog/` and update the image path.
5. Write the article in the `content` array, one paragraph per item.

The home-page preview, blog page and article page update automatically.

## Remove something
- Project: remove its object from `content/projects.json` and optionally delete its project asset folder.
- Blog post: remove its object from `content/blog.json` and optionally delete its image.
- Introduction video: delete/rename `assets/videos/intro.mp4`.
- Featured video: delete/rename `assets/videos/featured-project.mp4`.

The old demo images are kept only in `assets/archive/old-demo-assets/` so they do not appear on the live site. You can safely delete that archive later if you no longer need it.
