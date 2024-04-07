const getPixels = require("get-pixels");

colors_rgb = [[0, 0, 0],   
[255, 255, 255],
[13, 23, 31],
[46, 70, 89],
[67, 93, 115],
[94, 120, 140],
[122, 149, 167],
[153, 176, 191],
[180, 197, 209],
[208, 221, 228],
[241, 244, 247],
[13, 40, 41],
[21, 66, 55],
[35, 92, 68],
[49, 117, 69],
[66, 143, 66],
[110, 168, 74],
[163, 194, 85],
[207, 219, 114],
[117, 13, 16],
[148, 36, 26],
[179, 68, 40],
[209, 102, 48],
[230, 141, 62],
[237, 172, 74],
[245, 203, 83],
[255, 234, 99],
[92, 30, 28],
[120, 54, 42],
[145, 82, 68],
[173, 140, 68],
[199, 140, 88],
[224, 171, 114],
[235, 196, 138],
[245, 217, 166],
[63, 26, 77],
[109, 41, 117],
[148, 57, 137],
[179, 80, 141],
[204, 107, 138],
[230, 148, 143],
[245, 186, 169],
[29, 22, 82],
[33, 40, 112],
[44, 72, 143],
[57, 115, 173],
[83, 172, 204],
[116, 206, 218],
[165, 226, 230],
[205, 241, 244]]

colors_name = ["black",
"white",
"deep_black",
"deep_blue",
"blue_grey",
"grey_blue",
"bluish_grey",
"pale_blue_grey",
"light_blue_grey",
"very_light_blue_grey",
"greyish_white",
"jet_black",
"dark_green",
"bottle_green",
"fir_green",
"forest_green",
"olive_green",
"lime_green",
"pale_lime_green",
"dark_red",
"brick_red",
"rust_red",
"orange_red",
"orange_brown",
"orange_yellow",
"golden_yellow",
"light_yellow",
"crimson_red",
"reddish_brown",
"brown_orange",
"golden_brown",
"yellowish_brown",
"light_brown",
"pale_brown",
"very_pale_brown",
"dark_violet",
"violet",
"light_violet",
"pale_violet",
"pink_violet",
"pink",
"pale_pink",
"dark_blue_violet",
"blue_violet",
"light_blue_violet",
"pale_blue_violet",
"light_blue",
"light_blue_sky",
"pale_blue",
"very_pale_blue"]

function color(rgb) {
    const dists = colors_rgb.map((x, i) => [i, Math.sqrt(x.sum((e, c) => Math.pow(e - rgb[c], 2)))]);
    const ind = dists.min(x => x[1])[0];
    return colors_name[ind];
}

function rgbToColors(rgb) {
    return rgb.map(color);
}

function imgToRgb(img) {
    return new Promise((resolve, reject) => getPixels(img, (err, { data, shape }) => {
        if(err){
            reject(err);
            return;
        }

        const pixels = [];
        for(let i = 0; i < data.length; i += shape[2]) {
            const tmp = [];
            for(let j = i; j < i + 3; j++) {
                tmp.push(data[j]);
            }
            pixels.push(tmp);
        }

        resolve(pixels);
    }));
}

async function imgToColors(img) {
    return rgbToColors(await imgToRgb(img));
}

module.exports = { color, imgToRgb, imgToColors };