# Living Horizon

A single-page parallax scrolling website built with semantic HTML, CSS, and vanilla JavaScript. It is designed for GitHub Pages, so there is no framework, no bundler, and no build step.

## Preview locally

You can preview the site with any static file server.

Using Python:

```bash
python -m http.server 8000
```

Using VS Code:

1. Install the Live Server extension.
2. Open the project folder.
3. Right-click `index.html` and choose Open with Live Server.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Open the repository settings.
3. Go to Settings -> Pages.
4. Under Source, choose Deploy from a branch.
5. Select the `gh-pages` branch and the `/root` folder.
6. Save the settings.
7. Push to `main` to trigger the workflow, then wait for the `gh-pages` branch to update.
8. After GitHub finishes publishing, the site will be available at `https://<username>.github.io/<repo-name>/`.

## Notes

- All asset references use relative paths such as `css/style.css` and `js/main.js`, which keeps the site working from a GitHub Pages subpath.
- `/.nojekyll` is included so GitHub Pages does not apply Jekyll processing.
- The parallax motion uses `requestAnimationFrame`, `transform: translate3d(...)`, and `IntersectionObserver` for reveal animations.
- Reduced-motion and mobile fallbacks are built in.
