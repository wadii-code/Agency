# Lemon Milk (display face)

SPARK's headlines use **Lemon Milk** by Marsnev. It is not open-licensed, so it isn't
bundled here — add your licensed files to this folder:

```
public/fonts/lemon-milk/LEMONMILK-Medium.woff2   (or .otf)
public/fonts/lemon-milk/LEMONMILK-Bold.woff2     (or .otf)
```

The `@font-face` rules live at the top of `src/app/globals.css`. Until the files are
present the site falls back to an installed copy (via `local()`), then to Inter Tight.
