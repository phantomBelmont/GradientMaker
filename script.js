// ==========================================
// 1. 状態管理（State）
// ==========================================
let currentMode = 'linear';
let colors = [
    { color: '#111111', opacity: 1 },
    { color: '#300377', opacity: 0.8 },
    { color: '#333333', opacity: 1 }
];
let draggedIndex = null;

// ==========================================
// 2. DOM要素の取得
// ==========================================
const gradientBox = document.querySelector('#gradientBox');
const colorInputsContainer = document.querySelector('#colorInputs');
const cssCodeDisplay = document.querySelector('#cssCode');
const btnLinear = document.querySelector('#btnLinear');
const btnRadial = document.querySelector('#btnRadial');
const linearControls = document.querySelector('#linearControls');
const radialControls = document.querySelector('#radialControls');

const angleInput = document.querySelector('#angle');
const posXInput = document.querySelector('#posX');
const posYInput = document.querySelector('#posY');
const sizeInput = document.querySelector('#size');

// ==========================================
// 3. ヘルパー関数
// ==========================================
function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ==========================================
// 4. メイン機能関数
// ==========================================
function setMode(mode) {
    currentMode = mode;
    
    if (btnLinear) btnLinear.classList.toggle('active', mode === 'linear');
    if (btnRadial) btnRadial.classList.toggle('active', mode === 'radial');
    
    if (linearControls && radialControls) {
        linearControls.classList.toggle('hidden', mode !== 'linear');
        radialControls.classList.toggle('hidden', mode !== 'radial');
    }
    
    updateGradient();
}

function updateColorInputs() {
    if (!colorInputsContainer) return;
    colorInputsContainer.innerHTML = '';

    colors.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'color-row';
        row.draggable = true;
        row.dataset.index = index;

        // --- ドラッグ＆ドロップ イベント ---
        row.addEventListener('dragstart', (e) => {
            draggedIndex = index;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            draggedIndex = null;
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        row.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetIndex = parseInt(row.dataset.index, 10);
            if (draggedIndex !== null && draggedIndex !== targetIndex) {
                const temp = colors[draggedIndex];
                colors.splice(draggedIndex, 1);
                colors.splice(targetIndex, 0, temp);
                
                updateColorInputs();
                updateGradient();
            }
        });

        // --- UI要素の生成（CSP準拠のため addEventListener を使用） ---
        
        // 1. ハンドル
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.innerHTML = '🖐️';
        handle.title = 'ドラッグして順序を変更';
        row.appendChild(handle);

        // 2. 色ピッカー
        const pickerWrapper = document.createElement('div');
        pickerWrapper.className = 'color-picker-wrapper';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = item.color;
        colorInput.addEventListener('input', (e) => {
            colors[index].color = e.target.value;
            updateGradient();
        });
        pickerWrapper.appendChild(colorInput);
        row.appendChild(pickerWrapper);

        // 3. 透明度スライダー
        const opacityWrapper = document.createElement('div');
        opacityWrapper.className = 'opacity-control';
        
        const opacityLabel = document.createElement('div');
        opacityLabel.className = 'opacity-label';
        opacityLabel.innerHTML = `<span>Opacity</span> <span>${Math.round(item.opacity * 100)}%</span>`;
        
        const opacityInput = document.createElement('input');
        opacityInput.type = 'range';
        opacityInput.min = 0;
        opacityInput.max = 100;
        opacityInput.value = Math.round(item.opacity * 100);
        opacityInput.addEventListener('input', (e) => {
            const val = e.target.value / 100;
            colors[index].opacity = val;
            opacityLabel.innerHTML = `<span>Opacity</span> <span>${e.target.value}%</span>`;
            updateGradient();
        });
        
        opacityWrapper.appendChild(opacityLabel);
        opacityWrapper.appendChild(opacityInput);
        row.appendChild(opacityWrapper);

        // 4. 削除ボタン
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = '削除';
        removeBtn.addEventListener('click', () => {
            if (colors.length > 2) {
                colors.splice(index, 1);
                updateColorInputs();
                updateGradient();
            }
        });
        row.appendChild(removeBtn);

        colorInputsContainer.appendChild(row);
    });
}

function addColor() {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    colors.push({ color: randomColor, opacity: 1 });
    updateColorInputs();
    updateGradient();
}

function updateGradient() {
    if (colors.length === 0 || !gradientBox || !cssCodeDisplay) return;

    const colorStops = colors.map((item, index) => {
        const rgbaColor = hexToRgba(item.color, item.opacity);
        if (colors.length === 1) {
            return `${rgbaColor} 0%, ${rgbaColor} 100%`;
        }
        const percentage = (index / (colors.length - 1)) * 100;
        return `${rgbaColor} ${percentage}%`;
    });

    if (currentMode === 'linear') {
        const angle = angleInput ? angleInput.value : 180;
        const angleValueEl = document.getElementById('angleValue');
        if (angleValueEl) angleValueEl.innerText = angle;
        
        const gradientString = `linear-gradient(${angle}deg, ${colorStops.join(', ')})`;
        gradientBox.style.background = gradientString;
        cssCodeDisplay.innerText = `background: ${gradientString};`;

    } else {
        const posX = posXInput ? posXInput.value : 50;
        const posY = posYInput ? posYInput.value : 50;
        const size = sizeInput ? sizeInput.value : 50;

        const posXValueEl = document.getElementById('posXValue');
        const posYValueEl = document.getElementById('posYValue');
        const sizeValueEl = document.getElementById('sizeValue');

        if (posXValueEl) posXValueEl.innerText = posX;
        if (posYValueEl) posYValueEl.innerText = posY;
        if (sizeValueEl) sizeValueEl.innerText = size;

        if (colorStops.length > 0) {
            const lastStop = colorStops[colorStops.length - 1];
            colorStops[colorStops.length - 1] = `${lastStop} ${size}%`;
            
            const gradientString = `radial-gradient(circle at ${posX}% ${posY}%, ${colorStops.join(', ')})`;
            
            gradientBox.style.background = gradientString;
            cssCodeDisplay.innerText = `background: ${gradientString};`;
        } else {
            gradientBox.style.background = 'transparent';
            cssCodeDisplay.innerText = '';
        }
    }
}

// ==========================================
// 5. ダウンロード & コピー機能
// ==========================================
function downloadImage() {
    const widthInput = document.getElementById('imgWidth');
    const heightInput = document.getElementById('imgHeight');
    const width = parseInt(widthInput ? widthInput.value : 1920) || 1920;
    const height = parseInt(heightInput ? heightInput.value : 1080) || 1080;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    let gradient;
    if (currentMode === 'linear') {
        const angle = parseInt(angleInput ? angleInput.value : 180);
        const rad = (angle - 90) * (Math.PI / 180);
        const x1 = width / 2 + Math.cos(rad) * width;
        const y1 = height / 2 + Math.sin(rad) * height;
        const x2 = width / 2 - Math.cos(rad) * width;
        const y2 = height / 2 - Math.sin(rad) * height;

        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        colors.forEach((item, index) => {
            const percentage = colors.length === 1 ? 0 : (index / (colors.length - 1));
            gradient.addColorStop(percentage, hexToRgba(item.color, item.opacity));
        });
    } else {
        const posX = parseInt(posXInput ? posXInput.value : 50) / 100;
        const posY = parseInt(posYInput ? posYInput.value : 50) / 100;
        const sizeVal = parseInt(sizeInput ? sizeInput.value : 50);

        const cx = width * posX;
        const cy = height * posY;
        const minDim = Math.min(width, height);
        const radius = (sizeVal / 100) * (minDim / 2);

        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        colors.forEach((item, index) => {
            const percentage = colors.length === 1 ? 0 : (index / (colors.length - 1));
            gradient.addColorStop(percentage, hexToRgba(item.color, item.opacity));
        });
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const link = document.createElement('a');
    link.download = `gradient-${currentMode}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function copyCode(e) {
    if (!cssCodeDisplay) return;
    const code = cssCodeDisplay.innerText;
    navigator.clipboard.writeText(code).then(() => {
        const btn = e ? e.target : document.querySelector('.blue-btn');
        if (!btn) return;
        const originalText = btn.innerText;
        btn.innerText = 'コピーしました！✨';
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    });
}

// ==========================================
// 6. 初期化とイベントのリスナー登録
// ==========================================
function init() {
    // ボタンのイベントリスナー登録 (HTMLのonclickを置き換え)
    if (btnLinear) btnLinear.addEventListener('click', () => setMode('linear'));
    if (btnRadial) btnRadial.addEventListener('click', () => setMode('radial'));

    if (angleInput) angleInput.addEventListener('input', updateGradient);
    if (posXInput) posXInput.addEventListener('input', updateGradient);
    if (posYInput) posYInput.addEventListener('input', updateGradient);
    if (sizeInput) sizeInput.addEventListener('input', updateGradient);

    const addBtn = document.querySelector('button[onclick="addColor()"]') || document.querySelector('.purple-btn');
    if (addBtn) {
        addBtn.removeAttribute('onclick');
        addBtn.addEventListener('click', addColor);
    }

    const downloadBtn = document.querySelector('button[onclick="downloadImage()"]') || document.querySelector('.green-btn');
    if (downloadBtn) {
        downloadBtn.removeAttribute('onclick');
        downloadBtn.addEventListener('click', downloadImage);
    }

    const copyBtn = document.querySelector('button[onclick="copyCode()"]') || document.querySelector('.blue-btn');
    if (copyBtn) {
        copyBtn.removeAttribute('onclick');
        copyBtn.addEventListener('click', copyCode);
    }

    updateColorInputs();
    updateGradient();
}

// DOMの読み込み完了時に実行
document.addEventListener('DOMContentLoaded', init);
