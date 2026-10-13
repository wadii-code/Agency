# Lemon Milk (display face)

SPARK's headlines use **Lemon Milk** by Marsnev. It is not open-licensed, so it isn't
bundled here — add your licensed files to this folder:

```
public/fonts/lemon-milk/LEMONMILK-Medium.woff2
public/fonts/lemon-milk/LEMONMILK-Bold.woff2
```

Then restore the commented `url(...)` source in each Lemon Milk `@font-face` rule at the
top of `src/app/globals.css` (they stay commented while the files are missing, so visitors
don't request files that 404). Until then the site uses an installed copy (via `local()`),
then falls back to Inter Tight.
