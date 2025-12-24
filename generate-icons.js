const fs = require('fs');
const path = require('path');

// Simple 64x64 PNG base64 (Blue circle with a white lightning bolt/play shape - approximated)
// This is a placeholder. A real design would be better.
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIlSURBVHhe7Zs9ixtBGMf/60x8iY13iB8g2MZCbCxsYyGC2AlgI4hYCBFEsU0Q0kUQLSxsxBdIbGwEwcZGsBMEG8E2gvgC8fF55F539s7d3u6enJ39/uCBvbtzz/z2mXfnnZ0dFovF4l94uH84b61901o784/W2ofW2i+3D+ffu667w8yGZ4uX84fW2o/W2vfO82+7rvvS+c7XmNnw7f7hfNta++48+43ruq+d736NmQ3fni1e/nCee+m67gfn+99jZkO04bZ9f598vL6+fup8D2vMbIg2fP14/nN6f//r1/d3XzjfR42ZDdGGb58uXk7v73/95rruB+f7qDGzIdrw49P5z+n9/a/fuq77zvk+asxsmG64bd/fJ+9+37750Pkea8xsmG749vH81/T+/tdvXdf95HyPNWY2TDf89HT+a3p//+t3rut+cr7HGjMbphu+P1u8mt7f//qt67qfnO+xxsyGZ4uX84fW2o/W2vfO82+7rvvS+c7XmNnw3f3D+ba19t159hvXdV873/0aMxuiDT/cPpz/nN7f//qN67qvne9+jZkNIQ0/O88+c133g/Pd7zGzIaThl+fZb1zXfe1892vMbAhp+O159hvXdV873/0aMxv+04a/nO/+gJkNYQ237fv75N3v2zcfOt9HjZkNYQ3fPp7/mt7f//qt67qfnO+jwsyGsIafns5/Te/vf/3Odd1PzvdRYWZDWMN0v6Z8T5kNFovFYrFYLBaL/4y19hcsJ7+y+g8eOAAAAABJRU5ErkJggg==';

// For ICO, we ideally need a real ICO buffer. Writing PNG content to .ico file is NOT valid, but some viewers might handle it.
// However, Electron Builder requires a real ICO.
// Since we can't easily generate a real ICO without a library, we will just write the PNG to icon.png.
// And we'll advise the user to convert it or use a tool.
// BUT, for the sake of the task "configure icons", I'll try to provide a minimal valid ICO header if possible, or just duplicate the PNG and hope the user replaces it.
// Actually, I'll just write the PNG. The user can convert it online. 
// Wait, I can use a simpler approach: Just write the PNG, and tell the user "Please convert this to icon.ico for Windows installer".
// BUT I want the runtime window to have an icon NOW. BrowserWindow accepts PNG on Windows? Yes.
// So writing icon.png is enough for the running app.
// For the installer (electron-builder), it strictly needs .ico.
// I will create a dummy .ico which is just the PNG, it might fail the build, so I will NOT create a fake .ico to avoid build errors.
// I'll just create icon.png.

const buffer = Buffer.from(pngBase64, 'base64');
const buildDir = path.join(__dirname, 'build');

if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

fs.writeFileSync(path.join(buildDir, 'icon.png'), buffer);
console.log('Created build/icon.png');

// For Tray, we can use the same icon
console.log('Icon generation complete.');
