# Fast plan (~3–4 hours)

1. Screenshots (15 min): full-page screenshots of tedbaker.com at 1440px and 375px
   (DevTools → Ctrl+Shift+M → ⋮ → "Capture full size screenshot") → docs/screenshots/
2. Build (30–45 min): run `/build-page`
3. Match (60–90 min): Live Server open next to tedbaker.com; per section, paste
   real screenshot + mine and run `/match <section>`. Repeat at mobile width.
4. Quality (30 min): `/fix-quality`, then W3C validator + Lighthouse accessibility;
   paste results and run `/fix-quality` again.
5. Finish (15 min): `/finish`, fill in the check results, commit, push, open PR.
