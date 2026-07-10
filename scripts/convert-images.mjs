import sharp from "sharp";
import { readdir, stat, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join, extname, basename } from "path";

// ── Поставки ──────────────────────────────
const INPUT_DIR  = "./public/images/products";
const QUALITY    = 82;       // WebP квалитет (1-100)
const MAX_WIDTH  = 1200;     // Максимална ширина во пиксели
const MAX_KB     = 250;      // Предупредување ако е над 250KB
// ──────────────────────────────────────────

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"];

async function run() {
  if (!existsSync(INPUT_DIR)) {
    console.error(`❌  Фолдерот не постои: ${INPUT_DIR}`);
    process.exit(1);
  }

  const files = await readdir(INPUT_DIR);
  const targets = files.filter((f) =>
    EXTENSIONS.includes(extname(f))
  );

  if (targets.length === 0) {
    console.log("✅  Нема слики за конвертирање — сите се веќе WebP!");
    return;
  }

  console.log(`\n🔄  Конвертирање на ${targets.length} слики → WebP (квалитет ${QUALITY})\n`);
  console.log("─".repeat(55));

  let totalBefore = 0;
  let totalAfter  = 0;
  let warnings    = 0;

  for (const file of targets) {
    const inputPath  = join(INPUT_DIR, file);
    const name       = basename(file, extname(file));
    const outputPath = join(INPUT_DIR, `${name}.webp`);

    try {
      const { size: sizeBefore } = await stat(inputPath);

      await sharp(inputPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const { size: sizeAfter } = await stat(outputPath);

      totalBefore += sizeBefore;
      totalAfter  += sizeAfter;

      const beforeKB  = (sizeBefore / 1024).toFixed(0);
      const afterKB   = (sizeAfter  / 1024).toFixed(0);
      const saved     = Math.round((1 - sizeAfter / sizeBefore) * 100);
      const isLarge   = sizeAfter / 1024 > MAX_KB;

      if (isLarge) warnings++;

      console.log(
        `${isLarge ? "⚠️ " : "✅"} ${file.padEnd(30)} ` +
        `${String(beforeKB).padStart(5)}KB → ` +
        `${String(afterKB).padStart(5)}KB  ` +
        `(-${saved}%)` +
        (isLarge ? "  ← сè уште голема!" : "")
      );

      // Избриши го оригиналниот фајл
      await unlink(inputPath);
      console.log(`   🗑️  Избришан: ${file}`);

    } catch (err) {
      console.log(`❌  Грешка со ${file}: ${err.message}`);
    }
  }

  // Резиме
  const totalBeforeKB = (totalBefore / 1024).toFixed(0);
  const totalAfterKB  = (totalAfter  / 1024).toFixed(0);
  const totalSaved    = Math.round((1 - totalAfter / totalBefore) * 100);

  console.log("\n" + "─".repeat(55));
  console.log(`📊  Вкупно:    ${totalBeforeKB}KB  →  ${totalAfterKB}KB`);
  console.log(`💾  Заштедено: ${totalSaved}% помалку простор`);
  console.log(`📁  Конвертирани: ${targets.length} слики`);

  if (warnings > 0) {
    console.log(`\n⚠️   ${warnings} слика(и) се над ${MAX_KB}KB.`);
    console.log(`     Намали го MAX_WIDTH или QUALITY во скриптата.`);
  } else {
    console.log(`\n🚀  Сите слики се под ${MAX_KB}KB — совршено!`);
  }

  console.log("─".repeat(55) + "\n");
}

run();