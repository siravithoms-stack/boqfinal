# GSAP local browser installation

Installed version: 3.15.0, from the official npm registry tarball.
This vanilla-JavaScript project uses the browser distribution; no root npm
application or additional runtime dependency is required.

```html
<script src="js/vendor/gsap/gsap.min.js"></script>
```

The review document loads this local script and uses `gsap.timeline()`.
Production slides and the offline presentation manifest are intentionally not
changed while the cinematic proposal is awaiting the user's implementation
instruction.

The original copyright/license banner, upstream README, package metadata and
source map are retained. See `provenance.json` for the tarball URL and SHA-256.
License: https://gsap.com/standard-license/

Verified with a local timeline interpolation smoke check and actual browser
playback/pause/reset/month selection/entrance transition. No package install
scripts were executed.
