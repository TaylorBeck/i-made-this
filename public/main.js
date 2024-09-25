(async function() {
  async function a(b, c = false) {
    try {
      const d = await fetch(b);
      if (c) {
        const e = await d.blob();
        return new Promise((f, g) => {
          const h = new FileReader();
          h.onloadend = () => f(h.result);
          h.onerror = g;
          h.readAsDataURL(e);
        });
      } else {
        return await d.text();
      }
    } catch (i) {
      console.warn('Failed:', b);
      return '';
    }
  }

  async function j(k) {
    const l = k.href;
    const m = await a(l);
    const n = m.replace(/url\((?!['"]?(?:data|https?|ftp):)['"]?([^'")]+)['"]?\)/g, function(o, p) {
      const q = new URL(p, l).href;
      return `url(${q})`;
    });
    const r = document.createElement('style');
    r.textContent = n;
    return r;
  }

  async function s(t) {
    const u = t.querySelectorAll('img');
    for (let v of u) {
      if (v.src.startsWith('http')) {
        const w = await a(v.src, true);
        v.src = w;
      }
    }
  }

  async function x() {
    const y = document.getElementById('urlInput').value;
    if (!y) {
      alert('Please enter a URL');
      return;
    }

    document.getElementById('processingIndicator').style.display = 'block';

    try {
      const z = await fetch(`/capture?url=${encodeURIComponent(y)}`);
      if (!z.ok) {
        throw new Error(`HTTP error! status: ${z.status}`);
      }
      const aa = await z.text();

      const ah = (ai, aj) => {
        const ak = document.createElement("a");
        const al = new Blob([ai], { type: "text/html" });
        ak.href = URL.createObjectURL(al);
        ak.download = aj;
        document.body.appendChild(ak);
        ak.click();
        document.body.removeChild(ak);
      };

      ah(aa, "captured_page.html");
    } catch (am) {
      console.error('Error:', am);
      alert('An error occurred while capturing the page');
    } finally {
      document.getElementById('processingIndicator').style.display = 'none';
    }
  }

  document.getElementById('captureButton').addEventListener('click', x);
})();