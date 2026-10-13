/**
 * NEROOH - CYBERPUNK HUD OS LOGIC & ANIMATIONS
 * Interactive Systems: Hologram Globe, Terrain Mesh, Audio Synth, Terminal CLI
 */

// ==========================================
// 1. LIVE SYSTEM CLOCK & TELEMETRY UPTIME
// ==========================================
function initSystemClock() {
  const clockEl = document.getElementById('system-clock');
  
  function updateClock() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    if (clockEl) {
      clockEl.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ==========================================
// 2. 3D HOLOGRAPHIC WIREFRAME GLOBE (CANVAS)
// ==========================================
function initSphereCanvas() {
  const canvas = document.getElementById('sphere-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 45;
  
  let angleY = 0;
  let scanY = 0;
  let scanDir = 1;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.18)';
    ctx.beginPath();
    ctx.moveTo(cx - radius - 5, cy);
    ctx.lineTo(cx + radius + 5, cy);
    ctx.moveTo(cx, cy - radius - 5);
    ctx.lineTo(cx, cy + radius + 5);
    ctx.stroke();

    // Latitudes (horizontal rings)
    const latCount = 4;
    for (let i = 1; i <= latCount; i++) {
      const latAngle = (i / (latCount + 1) - 0.5) * Math.PI;
      const r = radius * Math.cos(latAngle);
      const y = cy + radius * Math.sin(latAngle);

      ctx.beginPath();
      ctx.ellipse(cx, y, r, r * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Longitudes (rotating vertical meridian rings)
    const lonCount = 6;
    for (let i = 0; i < lonCount; i++) {
      const theta = angleY + (i * Math.PI) / lonCount;
      const rx = radius * Math.cos(theta);

      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(rx), radius, 0, 0, Math.PI * 2);
      ctx.strokeStyle = Math.cos(theta) > 0 ? 'rgba(0, 255, 157, 0.55)' : 'rgba(0, 255, 157, 0.15)';
      ctx.lineWidth = Math.cos(theta) > 0 ? 1 : 0.6;
      ctx.stroke();
    }

    // Radar scanline wave
    scanY += 0.8 * scanDir;
    if (scanY > radius || scanY < -radius) scanDir *= -1;
    
    ctx.beginPath();
    const scanWidth = Math.sqrt(Math.max(0, radius * radius - scanY * scanY));
    ctx.moveTo(cx - scanWidth, cy + scanY);
    ctx.lineTo(cx + scanWidth, cy + scanY);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    angleY += 0.018;
    requestAnimationFrame(render);
  }

  render();
}

// ==========================================
// 3. DYNAMIC 3D SPACE-TIME GRID (BACKGROUND)
// ==========================================
function initSpacetimeGrid() {
  const canvas = document.getElementById('spacetime-canvas');
  if (!canvas) return;
  const container = document.getElementById('spacetime-grid-container');
  if (!container) return;
  const ctx = canvas.getContext('2d');

  let w = 0;
  let h = 0;
  let dpr = 1;

  // Responsive canvas resize handling
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    w = rect.width || window.innerWidth;
    const bodyHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 1400;
    const computedH = rect.height > 50 ? rect.height : Math.max(window.innerHeight * 0.6, bodyHeight * 0.54);
    h = computedH;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(container);
  }
  resize();

  // 3D Space-Time Grid Configuration
  const cols = 48;
  const rows = 34;
  const nearZ = 60;
  const farZ = 1350;
  const fov = 380;
  const cameraHeight = 140;

  let time = 0;
  let animId = null;

  // Mouse interaction for spacetime curvature
  const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: false };
  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    if (e.clientY >= rect.top - 100 && e.clientY <= rect.bottom + 50) {
      mouse.active = true;
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    } else {
      mouse.active = false;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  const curvatureDisplay = document.getElementById('warp-curvature');

  function render() {
    if (!ctx || w <= 0 || h <= 0) {
      resize();
      animId = requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    // Smooth mouse interpolation
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
    } else {
      mouse.x += (-9999 - mouse.x) * 0.05;
      mouse.y += (-9999 - mouse.y) * 0.05;
    }

    const originX = w / 2;
    const horizonY = Math.max(20, h * 0.05);
    const maxSpread = Math.max(w * 1.85, 1500);

    // Wandering singularity / gravity well center
    const wellNormX = 0.5 + Math.sin(time * 0.35) * 0.22;
    const wellNormY = 0.55 + Math.cos(time * 0.28) * 0.18;

    // Mouse coordinates in 0..1 relative canvas space
    const mouseNormX = mouse.active ? mouse.x / w : -999;
    const mouseNormY = mouse.active ? mouse.y / h : -999;

    // Build 3D perspective grid vertices
    const gridPoints = [];

    for (let r = 0; r < rows; r++) {
      gridPoints[r] = [];
      const rowT = r / (rows - 1);
      // Perspective depth non-linear distribution (closer lines near horizon, spreading near camera)
      const depthProgress = Math.pow(rowT, 1.85);
      const baseScreenY = horizonY + depthProgress * (h - horizonY + 20);
      const spreadX = 70 + depthProgress * maxSpread;
      const scale = 0.25 + depthProgress * 0.95;

      // Alpha curve: smooth fade near horizon and smooth fade at the very bottom
      const alphaFadeIn = Math.min(1, depthProgress * 4.5);
      const alphaFadeOut = Math.min(1, (1 - rowT) * 7.0);
      const rowAlpha = Math.max(0, Math.min(1, alphaFadeIn * alphaFadeOut));

      for (let c = 0; c < cols; c++) {
        const colNorm = (c / (cols - 1)) - 0.5;
        const normX = c / (cols - 1);
        const normY = rowT;

        // Relativistic wave harmonics
        const wave1 = Math.sin(colNorm * 9.0 + time * 1.4 + rowT * 8.0) * 14;
        const wave2 = Math.cos(colNorm * 14.0 - time * 0.9 + rowT * 12.0) * 10;
        const distFromCenter = Math.hypot(colNorm, rowT - 0.5);
        const wave3 = Math.sin(distFromCenter * 16.0 - time * 1.7) * 12;

        // Gravitational singularity well (curvature dip)
        const distToWell = Math.hypot(normX - wellNormX, (normY - wellNormY) * 1.5);
        const gravityWell = -45 / (1 + Math.pow(distToWell * 6.0, 2));

        // Interactive mouse gravity dip
        let mouseEffect = 0;
        if (mouse.active) {
          const distToMouse = Math.hypot(normX - mouseNormX, (normY - mouseNormY) * 1.5);
          mouseEffect = -35 * Math.exp(-distToMouse * 5.5);
        }

        // Modulation by depth so horizon is stable and foreground ripples dynamically
        const totalElevation = (wave1 + wave2 + wave3 + gravityWell + mouseEffect) * (0.2 + depthProgress * 0.85);

        const screenX = originX + colNorm * spreadX;
        const screenY = baseScreenY - totalElevation;

        gridPoints[r][c] = {
          x: screenX,
          y: screenY,
          alpha: rowAlpha,
          scale: scale,
          elevation: totalElevation
        };
      }
    }

    // 1. Draw horizontal spacetime latitude curves
    for (let r = 0; r < rows; r++) {
      const alpha = gridPoints[r][0].alpha;
      if (alpha <= 0.01) continue;

      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        const p = gridPoints[r][c];
        if (c === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }

      // Glowing neon cyan/emerald lines
      const strokeAlpha = (alpha * 0.42).toFixed(3);
      ctx.strokeStyle = `rgba(13, 242, 201, ${strokeAlpha})`;
      ctx.lineWidth = Math.max(0.6, 1.3 * gridPoints[r][0].scale);
      ctx.stroke();
    }

    // 2. Draw longitudinal perspective lines converging to horizon
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      let started = false;
      for (let r = 0; r < rows; r++) {
        const p = gridPoints[r][c];
        if (p.alpha <= 0.01) continue;
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      // Center perspective lines glow slightly brighter
      const centerDist = Math.abs(c / (cols - 1) - 0.5);
      const centerIntensity = 1 - centerDist * 0.65;
      const vertAlpha = (0.34 * centerIntensity).toFixed(3);

      ctx.strokeStyle = `rgba(0, 255, 157, ${vertAlpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // 3. Draw quantum nodes at key intersections
    for (let r = 1; r < rows - 1; r += 3) {
      for (let c = 2; c < cols - 2; c += 4) {
        const p = gridPoints[r][c];
        if (p.alpha > 0.25 && p.y > 0 && p.y < h) {
          const pulse = (Math.sin(time * 3 + r + c) + 1) * 0.5;
          const nodeRadius = Math.max(0.8, 2.0 * p.scale + pulse * 0.7);

          ctx.fillStyle = `rgba(0, 255, 157, ${(p.alpha * 0.85).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 4. Soft glowing horizon line
    ctx.save();
    const horizonGrad = ctx.createLinearGradient(0, horizonY - 15, 0, horizonY + 30);
    horizonGrad.addColorStop(0, 'rgba(0, 255, 157, 0)');
    horizonGrad.addColorStop(0.5, 'rgba(0, 255, 157, 0.12)');
    horizonGrad.addColorStop(1, 'rgba(0, 255, 157, 0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, horizonY - 15, w, 45);
    ctx.restore();

    // Advance time
    time += 0.024;

    // Update telemetry readout if present
    if (curvatureDisplay && Math.floor(time * 10) % 5 === 0) {
      const curVal = (0.835 + Math.sin(time * 1.5) * 0.045 + (mouse.active ? 0.09 : 0)).toFixed(3);
      curvatureDisplay.textContent = `${curVal} λ`;
    }

    animId = requestAnimationFrame(render);
  }

  // Handle visibility state for power saving
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(render);
    }
  });

  render();
}

// ==========================================
// 4. MUSIC PLAYER & WEB AUDIO SYNTHESIZER
// ==========================================
let audioContext = null;
let analyser = null;
let source = null;
let isPlaying = false;
let animationId = null;

function initAudioPlayer() {
  const playBtn = document.getElementById('btn-play-pause');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const progressBar = document.getElementById('audio-progress');
  const curTimeEl = document.getElementById('player-time-cur');
  const totalTimeEl = document.getElementById('player-time-total');
  const visualizerBars = document.querySelectorAll('.v-bar');
  const audioEl = document.getElementById('local-audio');
  const fileInput = document.getElementById('audio-upload');
  const trackNameWrap = document.querySelector('.music-track-title');
  const trackNameLabel = document.getElementById('track-name');

  if (!audioEl || !fileInput || !trackNameWrap) return;

  // Simulate stopping the default animation when there is no playing audio
  visualizerBars.forEach(b => b.style.animationPlayState = 'paused');
  visualizerBars.forEach(b => b.style.height = '10%');

  // Trigger file selection on click
  trackNameWrap.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audioEl.src = url;
      trackNameLabel.textContent = file.name;
      audioEl.load();
      // Setup Web Audio API on load
      setupAudioContext();
      audioEl.play().then(() => {
        isPlaying = true;
        updatePlayBtn();
        visualize();
      }).catch(err => console.error(err));
    }
  });

  function setupAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaElementSource(audioEl);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 64; // Small enough to get around 8 distinct bars easily
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function togglePlay() {
    setupAudioContext();
    if (audioEl.paused) {
      audioEl.play();
      isPlaying = true;
      visualize();
    } else {
      audioEl.pause();
      isPlaying = false;
      cancelAnimationFrame(animationId);
      visualizerBars.forEach(b => b.style.height = '10%');
    }
    updatePlayBtn();
  }

  function updatePlayBtn() {
    if (isPlaying) {
      playBtn.classList.add('play-active');
      playBtn.textContent = '❚❚';
    } else {
      playBtn.classList.remove('play-active');
      playBtn.textContent = '▶';
    }
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);

  if (prevBtn) prevBtn.addEventListener('click', () => {
    audioEl.currentTime = Math.max(0, audioEl.currentTime - 10);
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + 10);
  });

  audioEl.addEventListener('timeupdate', () => {
    if (audioEl.duration) {
      const prog = (audioEl.currentTime / audioEl.duration) * 100;
      if (progressBar) progressBar.style.width = prog + '%';

      const curM = String(Math.floor(audioEl.currentTime / 60)).padStart(2, '0');
      const curS = String(Math.floor(audioEl.currentTime % 60)).padStart(2, '0');
      if (curTimeEl) curTimeEl.textContent = `${curM}:${curS}`;
    }
  });

  audioEl.addEventListener('loadedmetadata', () => {
    const totM = String(Math.floor(audioEl.duration / 60)).padStart(2, '0');
    const totS = String(Math.floor(audioEl.duration % 60)).padStart(2, '0');
    if (totalTimeEl) totalTimeEl.textContent = `${totM}:${totS}`;
  });

  audioEl.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayBtn();
    cancelAnimationFrame(animationId);
    visualizerBars.forEach(b => b.style.height = '10%');
  });

  function visualize() {
    if (!isPlaying) return;

    // Disable the CSS animation to control it with JS
    visualizerBars.forEach(b => {
      b.style.animation = 'none';
    });

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Map 8 bars to the frequency data
    const step = Math.floor(bufferLength / visualizerBars.length);
    visualizerBars.forEach((bar, i) => {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j];
      }
      const avg = sum / step;
      // Convert to percentage (0-255) to height (10-100%)
      const heightPerc = 10 + (avg / 255) * 90;
      bar.style.height = `${heightPerc}%`;
    });

    animationId = requestAnimationFrame(visualize);
  }
}

// ==========================================
// 5. PROJECTS DATA & MODAL SYSTEM
// ==========================================
const projectsData = [
  {
    title: "LEDs & Automação Neptune 2S",
    img: "assets/images/proj_neptune.png",
    tags: ["Klipper", "RGB", "Automação"],
    desc: "Sistema customizado de iluminação e monitoramento para impressora 3D Elegoo Neptune 2S. Utiliza fita LED WS2812B endereçável controlada diretamente pelo MCU via macros customizadas no firmware Klipper. Notifica visualmente estados de aquecimento, nivelamento de malha e conclusão de impressão.",
    specs: "MCU: STM32F4 / LEDs: WS2812B 5V / Firmware: Klipper v0.12 / Macros: GCode Neopixel"
  },
  {
    title: "Controle Wi-Fi ESP8266",
    img: "assets/images/proj_esp8266.png",
    tags: ["IoT", "Web Server", "Mobile"],
    desc: "Módulo IoT com microcontrolador ESP8266 NodeMCU desenvolvido para gerenciamento remoto da bancada de eletrônica. Possui servidor web integrado assíncrono, conexão MQTT com Home Assistant e acionamento seguro de relés para liga/desliga de periféricos.",
    specs: "SoC: ESP8266 80MHz / Protocolos: MQTT, HTTP, WebSockets / Alimentação: 5V Step-down"
  },
  {
    title: "Servidor Klipper Multi-Instância",
    img: "assets/images/proj_klipper.png",
    tags: ["Linux", "Docker", "MQTT"],
    desc: "Infraestrutura centralizada baseada em mini-PC Linux com Docker e Moonraker para orquestrar 4 impressoras 3D simultâneas com câmeras RTSP de alta taxa de quadros e dashboards web independentes (Mainsail/Fluidd).",
    specs: "OS: Debian GNU/Linux 12 / Containers: Docker + Compose / Cams: 4x 1080p RTSP Stream"
  },
  {
    title: "Suporte de Garrafa Cachorro",
    img: "assets/images/proj_dog.png",
    tags: ["3D Print", "Design", "Produto"],
    desc: "Modelagem paramétrica de suporte ergonômico para garrafas com estética canina estilizada. Desenvolvido para manufatura aditiva sem suportes críticos, impresso com filamento PLA de alta densidade e pós-processado com acabamento acetinado.",
    specs: "CAD: Fusion 360 / Fatiador: OrcaSlicer / Material: PLA Premium / Tempo: 14h 20m"
  },
  {
    title: "Produtos Nero Studio",
    img: "assets/images/proj_nerostudio.png",
    tags: ["Design", "Impressão 3D", "Personalizado"],
    desc: "Linha de produtos personalizados sob a marca Nero Studio. Inclui luminárias de bancada em acrílico gravado com iluminação perimetral de LED neon, organizadores modulares de oficina e suportes técnicos para entusiastas de tecnologia.",
    specs: "Materiais: Acrílico Cast 4mm, PETG / Iluminação: COB LED 12V / Corte: Laser CNC"
  }
];

function openProjectModal(index) {
  const p = projectsData[index];
  if (!p) return;
  document.getElementById('modal-proj-title').textContent = `>_ PRJ_0${index + 1} // ${p.title}`;
  document.getElementById('modal-proj-img').src = p.img;
  document.getElementById('modal-proj-desc').textContent = p.desc;
  document.getElementById('modal-proj-specs').textContent = `[ESPECIFICAÇÕES]: ${p.specs}`;

  const tagsContainer = document.getElementById('modal-proj-tags');
  tagsContainer.innerHTML = '';
  p.tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tagsContainer.appendChild(span);
  });

  document.getElementById('project-modal').classList.add('open');
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.remove('open');
}

function openBioModal() {
  document.getElementById('bio-modal').classList.add('open');
}

function closeBioModal() {
  document.getElementById('bio-modal').classList.remove('open');
}

function openAllProjectsModal() {
  openProjectModal(0);
}

function openGameModal() {
  document.getElementById('game-modal').classList.add('open');
  startMatrixRain();
}

function closeGameModal() {
  document.getElementById('game-modal').classList.remove('open');
}

// Carousel Navigation
function initCarousel() {
  const container = document.getElementById('projects-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (prevBtn && container) {
    prevBtn.addEventListener('click', () => {
      container.scrollBy({ left: -220, behavior: 'smooth' });
    });
  }
  if (nextBtn && container) {
    nextBtn.addEventListener('click', () => {
      container.scrollBy({ left: 220, behavior: 'smooth' });
    });
  }
}

// ==========================================
// 6. INTERACTIVE TERMINAL CLI
// ==========================================
function initTerminalCLI() {
  const input = document.getElementById('terminal-input');
  const drawer = document.getElementById('terminal-drawer');
  const output = document.getElementById('terminal-output');

  if (!input || !drawer || !output) return;

  function printLine(text, isCmd = false) {
    const p = document.createElement('p');
    p.innerHTML = isCmd ? `<span class="cli-prompt">nerooh:~$</span> <span class="text-cmd">${text}</span>` : text;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawCmd = input.value.trim();
      if (!rawCmd) return;

      drawer.classList.add('open');
      printLine(rawCmd, true);
      input.value = '';

      const cmd = rawCmd.toLowerCase();
      
      switch (cmd) {
        case 'help':
          printLine(`
[COMANDOS DISPONÍVEIS]:
  - <span class="text-cmd">about</span>       : Biografia e foco de Carlito Batista
  - <span class="text-cmd">projects</span>    : Lista resumida dos 5 projetos
  - <span class="text-cmd">setup</span>       : Especificações de hardware e bancada
  - <span class="text-cmd">tools</span>       : Softwares e ferramentas favoritas
  - <span class="text-cmd">contact</span>     : Links de contato e redes
  - <span class="text-cmd">ping</span>        : Teste de conectividade com Cuiabá/MT
  - <span class="text-cmd">matrix</span>      : Inicia animação Matrix Rain
  - <span class="text-cmd">status</span>      : Diagnóstico geral dos serviços
  - <span class="text-cmd">clear</span>       : Limpa o console de saída
          `);
          break;

        case 'about':
          printLine("Carlito Batista // Técnico em impressoras 3D, estudante de Engenharia Elétrica, maker e desenvolvedor de automações.");
          break;

        case 'projects':
          projectsData.forEach((p, idx) => {
            printLine(`[0${idx+1}] <strong>${p.title}</strong> - Tags: ${p.tags.join(', ')}`);
          });
          break;

        case 'setup':
          printLine("CPU: Ryzen 5 5600 | GPU: RTX 3060 12GB | RAM: 32GB DDR4 | SSD: 1TB NVMe | Displays: 2x 27' 165Hz");
          break;

        case 'tools':
          printLine("Ferramentas: Klipper, OrcaSlicer, VS Code, Fusion 360, Raspberry Pi, Arduino, Tailscale, Linux.");
          break;

        case 'contact':
          printLine("Instagram: @nero.std | LinkedIn: /nerooh | GitHub: /nerooh | Discord: /nerooh | WhatsApp: Cuiabá/MT");
          break;

        case 'ping':
          printLine("PING cuiaba.mt.gov.br (177.136.240.1): 56 data bytes");
          printLine("64 bytes from 177.136.240.1: icmp_seq=1 ttl=58 time=12.4 ms");
          printLine("--- cuiaba.mt ping statistics: 0% packet loss, rtt min/avg/max = 12.4/14.1/16.2 ms");
          break;

        case 'status':
          printLine("[STATUS]: SYSTEM ONLINE [||||] | 3/4 Impressoras Ativas | Temp: 23.7°C | Uptime: 2d 14h 32m");
          break;

        case 'matrix':
          openGameModal();
          break;

        case 'clear':
          output.innerHTML = '<p class="sys-msg">[SYSTEM] Terminal buffer cleared.</p>';
          break;

        default:
          printLine(`Comando não reconhecido: "${rawCmd}". Digite <span class="text-cmd">help</span>.`);
          break;
      }
    }
  });
}

function closeTerminalDrawer() {
  document.getElementById('terminal-drawer').classList.remove('open');
}

// ==========================================
// 7. MATRIX RAIN EFFECT (CANVAS)
// ==========================================
let matrixInterval = null;
function startMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.parentElement.clientWidth || 560;
  canvas.height = 280;

  const letters = '0123456789ABCDEF01NEROOHKLIPPER3DAUTO';
  const fontSize = 12;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  if (matrixInterval) clearInterval(matrixInterval);

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff9d';
    ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  matrixInterval = setInterval(draw, 33);
}

// Close modals on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBioModal();
    closeProjectModal();
    closeGameModal();
    closeTerminalDrawer();
  }
});

// ==========================================
// 9. INITIALIZE EVERYTHING ON DOM READY
// ==========================================

// ==========================================
// 8. GEOLOCATION & BATTERY STATUS
// ==========================================
function initGeolocationAndBattery() {
  // Geolocation
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const latStr = lat >= 0 ? `${lat.toFixed(4)}° N` : `${Math.abs(lat).toFixed(4)}° S`;
        const lonStr = lon >= 0 ? `${lon.toFixed(4)}° E` : `${Math.abs(lon).toFixed(4)}° W`;

        document.getElementById('boot-lat').textContent = latStr;
        document.getElementById('boot-lon').textContent = lonStr;
        document.getElementById('cam-lat').textContent = latStr;
        document.getElementById('cam-lon').textContent = lonStr;

        try {
          // Reverse geocoding via Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || 'UNKNOWN';
            const state = data.address.state || 'UNKNOWN';
            const locationStr = `${city.toUpperCase()}/${state.toUpperCase()}`;

            document.getElementById('boot-city').textContent = locationStr;
            document.getElementById('cam-city').textContent = locationStr;
          }
        } catch (err) {
          console.warn("Reverse geocoding failed", err);
        }
      },
      (err) => {
        console.warn("Geolocation denied or failed", err);
      }
    );
  }

  // Battery
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      function updateBatteryUI() {
        const level = battery.level * 100;
        const barsContainer = document.getElementById('battery-bars');
        if (!barsContainer) return;

        const bars = barsContainer.querySelectorAll('.bat-bar');
        bars.forEach((bar, index) => {
          // 4 bars total: each represents 25%
          if (level > index * 25) {
            bar.classList.add('fill');
          } else {
            bar.classList.remove('fill');
          }
        });
      }

      updateBatteryUI();
      battery.addEventListener('levelchange', updateBatteryUI);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initGeolocationAndBattery();

  initSystemClock();
  initSphereCanvas();
  initSpacetimeGrid();
  initAudioPlayer();
  initCarousel();
  initTerminalCLI();
  console.log("%c[NEROOH] Cyberpunk HUD OS Initialized successfully.", "color: #00ff9d; font-weight: bold;");
});
