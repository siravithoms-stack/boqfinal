/**
 * Main Web Slide Presentation Controller
 */
import { PRESENTATION_CONFIG } from './presentation-config.js';
import { renderSlideTemplate } from './slide-templates.js';
import { initialiseSlideInteraction } from './slide-interactions.js';
import { SLIDES_DATA } from './slides-data.js';
import { renderSCurve, renderCashFlow } from './charts.js';
import { initCompletedWarehouse3D } from './warehouse-walkthrough.js';
import { 
  initPileDriving3D, 
  initCellularBeam3D, 
  initFloorStratigraphy3D,
  initRoofCladding3D,
  initInfrastructureRoad3D,
  initQualityLab3D,
  initSafetySite3D
} from './three-scenes.js';

class SlidePresentationApp {
  constructor() {
    this.slides = SLIDES_DATA;
    this.currentIndex = 0;
    this.active3DScene = null;
    this.interactiveTimeoutId = null;
    this.soundEnabled = true;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.timerPaused = false;
    this.audioContext = null;

    // Cache DOM
    this.stage = document.getElementById('slideStage');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.slideNumIndicator = document.getElementById('slideNumIndicator');
    this.progressBar = document.getElementById('progressBar');
    this.overviewModal = document.getElementById('overviewModal');
    this.overviewGrid = document.getElementById('overviewGrid');
    this.gridBtn = document.getElementById('gridBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.soundBtn = document.getElementById('soundBtn');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.closeOverviewBtn = document.getElementById('closeOverviewBtn');
    this.themeBtn = document.getElementById('themeBtn');
    this.themeLabel = document.getElementById('themeLabel');

    this.init();
  }

  init() {
    this.initTheme();
    this.setupCanvasScaling();
    this.renderAllSlides();
    document.getElementById("overviewTitle").textContent = `สารบัญสไลด์ทั้งหมด (${this.slides.length} หน้านำเสนอ)`;
    this.renderOverviewThumbnails();
    this.setupEvents();
    this.startTimer();

    // Read URL Hash
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const idx = parseInt(hash.replace('#slide-', '')) - 1;
      if (idx >= 0 && idx < this.slides.length) {
        this.goToSlide(idx, false);
        return;
      }
    }
    this.goToSlide(0, false);
  }

  initTheme() {
    let savedTheme;
    try { savedTheme = localStorage.getItem(PRESENTATION_CONFIG.themeStorageKey); } catch {}
    if (savedTheme === 'cyber-dark') {
      document.body.classList.remove('theme-bronze-stone');
      if (this.themeLabel) this.themeLabel.textContent = 'ธีม: Cyber Dark';
      if (this.themeBtn) this.themeBtn.classList.remove('active');
    } else {
      document.body.classList.add('theme-bronze-stone');
      if (this.themeLabel) this.themeLabel.textContent = 'ธีม: Bronze Stone';
      if (this.themeBtn) this.themeBtn.classList.add('active');
    }
    if (this.themeBtn) this.themeBtn.setAttribute('aria-pressed', String(document.body.classList.contains('theme-bronze-stone')));
  }

  toggleTheme() {
    const isBronze = document.body.classList.toggle('theme-bronze-stone');
    if (this.themeLabel) {
      this.themeLabel.textContent = isBronze ? 'ธีม: Bronze Stone' : 'ธีม: Cyber Dark';
    }
    if (this.themeBtn) {
      this.themeBtn.classList.toggle('active', isBronze);
      this.themeBtn.setAttribute('aria-pressed', String(isBronze));
    }
    try { localStorage.setItem(PRESENTATION_CONFIG.themeStorageKey, isBronze ? 'bronze-stone' : 'cyber-dark'); } catch {}
    this.playAudioBeep(isBronze ? 620 : 380, 0.08);

    this.renderCurrentChart();
  }

  setupCanvasScaling() {
    const viewport = document.querySelector('.slide-viewport');
    const frame = document.querySelector('.slide-canvas-wrapper');
    const fit = () => {
      const style = getComputedStyle(viewport);
      const width = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height = viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const scale = Math.max(PRESENTATION_CONFIG.minimumScale, Math.min(1, (width - PRESENTATION_CONFIG.frameBorder) / PRESENTATION_CONFIG.canvasWidth, (height - PRESENTATION_CONFIG.frameBorder) / PRESENTATION_CONFIG.canvasHeight));
      frame.style.width = `${PRESENTATION_CONFIG.canvasWidth * scale + PRESENTATION_CONFIG.frameBorder}px`;
      frame.style.height = `${PRESENTATION_CONFIG.canvasHeight * scale + PRESENTATION_CONFIG.frameBorder}px`;
      this.stage.style.transform = `scale(${scale})`;
    };
    this.canvasObserver = new ResizeObserver(fit);
    this.canvasObserver.observe(viewport);
    window.addEventListener('resize', fit);
    fit();
  }

  renderCurrentChart() {
    const slide = this.slides[this.currentIndex];
    if (slide.type === 'interactive-scurve') {
      const slider = document.getElementById('scurveSlider');
      renderSCurve('scurveChartContainer', slide.content.milestones, slider ? Number(slider.value) : PRESENTATION_CONFIG.defaultMonthIndex);
    } else if (slide.type === 'cashflow-chart') {
      renderCashFlow('cashFlowChartContainer', slide.content.chartData);
    }
  }

  setupEvents() {
    // Theme toggle button
    if (this.themeBtn) {
      this.themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Nav buttons
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());

    // Grid Overview modal
    this.gridBtn.addEventListener('click', () => this.toggleOverview());
    this.closeOverviewBtn.addEventListener('click', () => this.toggleOverview(false));

    // Fullscreen
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

    // Sound toggle
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        this.soundBtn.classList.toggle('active', this.soundEnabled);
        this.soundBtn.setAttribute('aria-pressed', String(this.soundEnabled));
        this.soundBtn.querySelector('.btn-label').textContent = this.soundEnabled ? 'SFX: ON' : 'SFX: OFF';
        if (this.soundEnabled) this.playAudioBeep(600, 0.05);
      });
    }

    document.getElementById('timerBtn').addEventListener('click', () => {
      this.timerPaused = !this.timerPaused;
      document.getElementById('timerBtn').setAttribute('aria-pressed', String(this.timerPaused));
      document.getElementById('timerBtn').title = this.timerPaused ? 'เดินเวลาต่อ' : 'พักเวลา';
    });
    document.getElementById('timerResetBtn').addEventListener('click', () => {
      this.timerSeconds = 0;
      this.timerDisplay.textContent = '00:00';
    });

    // Keyboard bindings
    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (this.overviewModal.classList.contains('open')) {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'g') { this.toggleOverview(false); e.preventDefault(); }
        if (e.key === 'Tab') {
          const controls = [...this.overviewModal.querySelectorAll('button')];
          const first = controls[0], last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
          else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
        }
        return;
      }
      if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === 'g' || e.key === 'G') {
        this.toggleOverview();
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        this.toggleTheme();
      } else if (e.key === 'Escape') {
        this.toggleOverview(false);
      }
    });

    // Native fullscreen state listener
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());

    // Popstate & Hashchange
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#slide-')) {
        const idx = parseInt(hash.replace('#slide-', '')) - 1;
        if (idx >= 0 && idx < this.slides.length && idx !== this.currentIndex) {
          this.goToSlide(idx, false);
        }
      }
    };
    window.addEventListener('popstate', handleHash);
    window.addEventListener('hashchange', handleHash);
  }

  playAudioBeep(freq = 440, duration = 0.05) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.audioContext || (this.audioContext = new (window.AudioContext || window.webkitAudioContext)());
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } catch(e) {}
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timerPaused) return;
      this.timerSeconds++;
      const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
      const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
      this.timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  handleFullscreenChange() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (this.fullscreenBtn) {
      this.fullscreenBtn.classList.toggle('active', isFull);
      const label = this.fullscreenBtn.querySelector('span:last-child');
      if (label) label.textContent = isFull ? 'ออกเต็มจอ [F]' : 'เต็มจอ [F]';
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 80);
  }


  toggleOverview(forceState) {
    const shouldOpen = forceState !== undefined ? forceState : !this.overviewModal.classList.contains('open');
    const wasOpen = this.overviewModal.classList.contains('open');
    if (shouldOpen && !wasOpen) this.overviewReturnFocus = document.activeElement;
    this.overviewModal.classList.toggle('open', shouldOpen);
    this.overviewModal.setAttribute('aria-hidden', String(!shouldOpen));
    for (const element of document.querySelectorAll('.top-bar, .slide-viewport, .bottom-bar')) element.inert = shouldOpen;
    if (shouldOpen) this.closeOverviewBtn.focus();
    else if (wasOpen) (this.overviewReturnFocus || this.gridBtn).focus();
    if (shouldOpen) {
      this.playAudioBeep(700, 0.05);
      // highlight active
      const cards = this.overviewGrid.querySelectorAll('.slide-thumb-card');
      cards.forEach((c, idx) => {
        c.classList.toggle('active', idx === this.currentIndex);
      });
    }
  }

  goToSlide(index, updateHistory = true) {
    if (index < 0 || index >= this.slides.length) return;
    
    // Clear any pending timeout for previous slide interactive initializers
    if (this.interactiveTimeoutId) {
      clearTimeout(this.interactiveTimeoutId);
      this.interactiveTimeoutId = null;
    }

    // Dispose previous 3D scene if any
    if (this.active3DScene && this.active3DScene.destroy) {
      try {
        this.active3DScene.destroy();
      } catch (err) {
        console.warn('Error destroying 3D scene:', err);
      }
      this.active3DScene = null;
    }

    const panels = this.stage.querySelectorAll('.slide-panel');
    panels.forEach(p => p.classList.remove('active'));

    this.currentIndex = index;
    const targetPanel = document.getElementById(`slide-${index + 1}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update bottom HUD
    this.slideNumIndicator.textContent = `${(this.currentIndex + 1).toString().padStart(2, '0')} / ${this.slides.length}`;
    const progressPct = ((this.currentIndex + 1) / this.slides.length) * 100;
    this.progressBar.style.width = `${progressPct}%`;

    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex === this.slides.length - 1;

    if (updateHistory) {
      history.pushState(null, '', `#slide-${this.currentIndex + 1}`);
      this.playAudioBeep(520, 0.04);
    }

    // Initialize slide interactive content
    this.initSlideInteractiveContent(this.slides[index]);
  }

  prevSlide() {
    if (this.currentIndex > 0) this.goToSlide(this.currentIndex - 1);
  }

  nextSlide() {
    if (this.currentIndex < this.slides.length - 1) this.goToSlide(this.currentIndex + 1);
  }

  renderOverviewThumbnails() {
    this.overviewGrid.innerHTML = this.slides.map((s, idx) => `
      <button type="button" class="slide-thumb-card ${idx === this.currentIndex ? 'active' : ''}" data-index="${idx}">
        <span class="thumb-num">SLIDE ${(idx + 1).toString().padStart(2, '0')}</span>
        <div class="thumb-title">${s.title}</div>
        <span class="thumb-category">${s.tag}</span>
      </button>
    `).join('');

    this.overviewGrid.querySelectorAll('.slide-thumb-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index);
        this.goToSlide(idx);
        this.toggleOverview(false);
      });
    });
  }

  initSlideInteractiveContent(slide) {
    if (this.interactiveTimeoutId) {
      clearTimeout(this.interactiveTimeoutId);
      this.interactiveTimeoutId = null;
    }

    this.interactiveTimeoutId = setTimeout(() => {
      this.active3DScene = initialiseSlideInteraction(slide, {
        document, factories: {
          initCompletedWarehouse3D, initPileDriving3D, initCellularBeam3D,
          initFloorStratigraphy3D, initRoofCladding3D, initInfrastructureRoad3D,
          initQualityLab3D, initSafetySite3D
        },
        renderSCurve, renderCashFlow,
        beep: (frequency, duration) => this.playAudioBeep(frequency, duration)
      });
    }, PRESENTATION_CONFIG.interactiveDelayMs);
  }

  renderAllSlides() {
    this.stage.innerHTML = this.slides.map(s => this.createSlideHTML(s)).join('');
  }

  createSlideHTML(slide) {
    return renderSlideTemplate(slide);
  }
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.presentationApp = new SlidePresentationApp();
});
