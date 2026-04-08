const { join, resolve } = require("path");
const { readFileSync, readdirSync, writeFileSync } = require("fs");

const suffixToScale = {
    lq: "0.25",
    mq: "0.5",
    hq: "0.75"
};

function convert(srcDir) {
    const full = resolve(srcDir);
    const srcFiles = readdirSync(full)
        .filter(n => n.endsWith(".atlas"))
        .map(n => join(full, n));

    for (const atlas of srcFiles) {
        console.log(`Processing: ${atlas}`);

        const lines = readFileSync(atlas, "utf-8")
            .split("\n")
            .filter(n => n.trim());

        // Get source image name
        const image = lines.shift();
        const srcMeta = {};

        // Read header metadata until a line without a colon (= first sprite name)
        while (lines.length) {
            const line = lines[0];
            const colonIdx = line.indexOf(":");
            if (colonIdx < 0) break;
            lines.shift();
            srcMeta[line.substring(0, colonIdx)] = line.substring(colonIdx + 1).trim();
        }

        // Detect atlas format:
        //   v1: property lines are indented with "  "
        //   v2: property lines are NOT indented but contain ":"
        const isV1 = lines.some(l => l.startsWith("  "));

        const frames = {};

        function emitFrame(current) {
            if (!current) return;
            let xy, size, orig, offset, rotate, index;

            if (isV1) {
                xy = current.xy.split(",").map(v => Number(v.trim()));
                size = current.size.split(",").map(v => Number(v.trim()));
                orig = current.orig.split(",").map(v => Number(v.trim()));
                offset = current.offset.split(",").map(v => Number(v.trim()));
                rotate = current.rotate === "true" || current.rotate === true;
                index = Number(current.index);
            } else {
                // v2: bounds = x,y,w,h; offsets = offX,offY,origW,origH (optional)
                const bounds = current.bounds.split(",").map(v => Number(v.trim()));
                xy = [bounds[0], bounds[1]];
                size = [bounds[2], bounds[3]];
                if (current.offsets) {
                    const off = current.offsets.split(",").map(v => Number(v.trim()));
                    offset = [off[0], off[1]];
                    orig = [off[2], off[3]];
                } else {
                    offset = [0, 0];
                    orig = [size[0], size[1]];
                }
                rotate = current.rotate === "true" || current.rotate === true;
                index = current.index !== undefined ? Number(current.index) : -1;
            }

            const indexSuff = index !== -1 ? `_${index}` : "";
            const isTrimmed = size[0] !== orig[0] || size[1] !== orig[1];

            frames[`${current.name}${indexSuff}.png`] = {
                frame: { x: xy[0], y: xy[1], w: size[0], h: size[1] },
                rotated: rotate,
                trimmed: isTrimmed,
                spriteSourceSize: {
                    x: offset[0],
                    y: (orig[1] - size[1]) - offset[1],
                    w: size[0],
                    h: size[1]
                },
                sourceSize: { w: orig[0], h: orig[1] }
            };
        }

        let current = null;
        let currentPageImage = image;
        lines.push("__SENTINEL__");

        for (const line of lines) {
            const isProperty = isV1 ? line.startsWith("  ") : (line.indexOf(":") >= 0 && line !== "__SENTINEL__");

            // In multi-page atlases, subsequent page headers look like "atlas0-2.png"
            // They are not properties and not sprite names — skip them and their size line
            const isPageHeader = !isProperty && line !== "__SENTINEL__" && /\.(png|jpg)$/.test(line);

            if (isPageHeader) {
                emitFrame(current);
                current = null;
                currentPageImage = line;
            } else if (!isProperty) {
                emitFrame(current);
                current = line === "__SENTINEL__" ? null : { name: line, _pageImage: currentPageImage };
            } else if (current !== null) {
                if (isV1) {
                    const kv = line.split(":").map(v => v.trim());
                    current[kv[0]] = isNaN(Number(kv[1])) ? kv[1] : Number(kv[1]);
                } else {
                    const colonIdx = line.indexOf(":");
                    current[line.substring(0, colonIdx)] = line.substring(colonIdx + 1).trim();
                }
            }
        }

        const atlasSize = srcMeta.size.split(",").map(v => Number(v.trim()));
        const match = atlas.match(/_(\w+)\.atlas$/);
        const atlasScale = suffixToScale[match ? match[1] : "hq"] || "0.75";

        const result = JSON.stringify({
            frames,
            meta: {
                image,
                format: srcMeta.format || "RGBA8888",
                size: { w: atlasSize[0], h: atlasSize[1] },
                scale: atlasScale.toString()
            }
        });

        writeFileSync(atlas.replace(".atlas", ".json"), result, { encoding: "utf-8" });
    }
}

if (require.main == module) {
    convert(process.argv[2]);
}

module.exports = { convert };
