const loadStyle = () => {
    const sheet = document.styleSheets[1];
  
    const styleRules = [];
    for (let i = 0; i < sheet.cssRules.length; i++)
      styleRules.push(sheet.cssRules.item(i).cssText);
  
    const style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(styleRules.join(' ')))
  
    return style;
};
const style = loadStyle();
  
export const SVGDownloadButton = ({
  width,
  height
}) => (
    <button onClick={() => {
        // fetch SVG-rendered image as a blob object
        const svg = document.querySelector('svg');
        svg.insertBefore(style, svg.firstChild); // CSS must be explicitly embedded
        const data = (new XMLSerializer()).serializeToString(svg);
        const svgBlob = new Blob([data], {
        type: 'image/svg+xml;charset=utf-8'
        });
    
        svg.removeChild(svg.childNodes[0]); // remove temporarily injected CSS
    
        // convert the blob object to a dedicated URL
        const url = URL.createObjectURL(svgBlob);
    
        // load the SVG blob to a flesh image object
        const img = new Image();
        img.addEventListener('load', () => {
        // draw the image on an ad-hoc canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
    
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
    
        URL.revokeObjectURL(url);
    
        // trigger a synthetic download operation with a temporary link
        const a = document.createElement('a');
        a.download = "map.png";
        document.body.appendChild(a);
        a.href = canvas.toDataURL();
        a.click();
        a.remove();
        });
        img.src = url;
    }}>
        Download
    </button>
);