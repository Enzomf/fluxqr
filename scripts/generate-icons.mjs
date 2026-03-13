import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const input = resolve(root, "public", "logo.png");

async function main() {
  // 192x192 standard icon
  await sharp(input)
    .resize(192, 192, { fit: "contain", background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(resolve(root, "public", "icon-192x192.png"));
  console.log("Generated public/icon-192x192.png");

  // 512x512 standard icon
  await sharp(input)
    .resize(512, 512, { fit: "contain", background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(resolve(root, "public", "icon-512x512.png"));
  console.log("Generated public/icon-512x512.png");

  // 512x512 maskable icon — logo resized to 60% (307px) centered on #0F172A canvas
  // Safe-zone: ~102px padding each side
  const logoSize = Math.round(512 * 0.6); // 307px
  const logoBuffer = await sharp(input)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const offset = Math.round((512 - logoSize) / 2); // 102px
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 255 },
    },
  })
    .composite([{ input: logoBuffer, top: offset, left: offset }])
    .png()
    .toFile(resolve(root, "public", "icon-maskable.png"));
  console.log("Generated public/icon-maskable.png");

  console.log("All PWA icons generated successfully.");
}

main().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
