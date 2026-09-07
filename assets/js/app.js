import { repositoriesData } from "./repos.js";
import { soundFx } from "./audio.js";

// Trạng thái ứng dụng
const state = {
  currentCategory: "all",
  searchQuery: "",
  openedDrawers: new Set(),
  soundEnabled: true
};

// Khởi tạo hiệu ứng 36 cánh hoa anh đào Sakura (Tái lập chính xác từ Japan_Elearning)
function initSakuraPetals() {
  const container = document.getElementById("sakuraContainer");
  if (!container) return;

  const count = 36;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("div");
    petal.className = "sakura-petal";

    const left = (Math.random() * 98).toFixed(1) + "%";
    const fallDuration = (9 + Math.random() * 11).toFixed(1) + "s";
    const swayDuration = (2.8 + Math.random() * 2.8).toFixed(1) + "s";
    const fallDelay = (-Math.random() * 14).toFixed(1) + "s";
    const swayDelay = (-Math.random() * 3.5).toFixed(1) + "s";
    const driftX = Math.floor(50 + Math.random() * 180) + "px";
    const swayX = (Math.random() > 0.5 ? 1 : -1) * Math.floor(25 + Math.random() * 40) + "px";
    const rotEnd = Math.floor(280 + Math.random() * 540) + "deg";
    const flipEnd = Math.floor(360 + Math.random() * 720) + "deg";
    const size = Math.floor(12 + Math.random() * 14);
    const variant = i % 4;

    petal.style.left = left;
    petal.style.animationDuration = `${fallDuration}, ${swayDuration}`;
    petal.style.animationDelay = `${fallDelay}, ${swayDelay}`;
    petal.style.setProperty("--drift-x", driftX);
    petal.style.setProperty("--sway-x", swayX);
    petal.style.setProperty("--rot-end", rotEnd);
    petal.style.setProperty("--flip-end", flipEnd);

    let svgInner = "";
    if (variant === 0) {
      svgInner = `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none">
        <path d="M15 2 C23 2, 29 11, 26 21 C23 27, 16 28, 15 28 C14 28, 7 27, 4 21 C1 11, 7 2, 15 2 Z" fill="rgba(255, 183, 197, 0.85)"/>
        <path d="M15 5 C19 10, 18 19, 15 25" stroke="rgba(255, 140, 165, 0.45)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
    } else if (variant === 1) {
      svgInner = `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none">
        <path d="M15 2 C23 2, 29 11, 26 21 C23 27, 16 28, 15 28 C14 28, 7 27, 4 21 C1 11, 7 2, 15 2 Z" fill="rgba(255, 220, 230, 0.78)"/>
      </svg>`;
    } else if (variant === 2) {
      svgInner = `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none">
        <path d="M15 2 C23 2, 29 11, 26 21 C23 27, 16 28, 15 28 C14 28, 7 27, 4 21 C1 11, 7 2, 15 2 Z" fill="rgba(255, 160, 180, 0.80)"/>
        <path d="M15 5 C19 10, 18 19, 15 25" stroke="rgba(255, 130, 155, 0.4)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
    } else {
      const largeSize = Math.round(size * 1.1);
      svgInner = `<svg width="${largeSize}" height="${largeSize}" viewBox="0 0 34 34" fill="none">
        <path d="M17 3 C25 3, 31 12, 28 23 C25 29, 18 30, 17 30 C16 30, 9 29, 6 23 C3 12, 9 3, 17 3 Z" fill="rgba(255, 192, 203, 0.90)"/>
        <circle cx="17" cy="18" r="3" fill="rgba(255, 140, 165, 0.35)"/>
      </svg>`;
    }

    petal.innerHTML = svgInner;
    fragment.appendChild(petal);
  }

  container.appendChild(fragment);
}

// Render các ô tủ Tansu theo danh sách repos đã lọc
function renderCabinetGrid() {
  const grid = document.getElementById("tansuGrid");
  const countBadge = document.getElementById("repoCountBadge");
  if (!grid) return;

  const query = state.searchQuery.toLowerCase().trim();
  const filtered = repositoriesData.filter(repo => {
    const matchCategory = state.currentCategory === "all" || repo.category === state.currentCategory;
    const matchQuery = !query || 
      repo.name.toLowerCase().includes(query) ||
      repo.title.toLowerCase().includes(query) ||
      repo.description.toLowerCase().includes(query) ||
      repo.tags.some(t => t.toLowerCase().includes(query));
    return matchCategory && matchQuery;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Ô Tủ`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <p style="font-size: 18px; margin-bottom: 8px;">Không tìm thấy ngăn tủ phù hợp với từ khóa "${state.searchQuery}"</p>
        <button id="btnResetFilter" style="cursor: pointer; padding: 8px 18px; background: rgba(212,163,89,0.15); border: 1px solid var(--border-brass); color: var(--brass-accent); border-radius: 8px;">Đặt lại bộ lọc</button>
      </div>
    `;
    const resetBtn = document.getElementById("btnResetFilter");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.currentCategory = "all";
        state.searchQuery = "";
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = "";
        updateFilterUI();
        renderCabinetGrid();
      });
    }
    return;
  }

  grid.innerHTML = filtered.map(repo => {
    const isOpen = state.openedDrawers.has(repo.id);
    const catClass = `cat-${repo.category}`;

    return `
      <div class="drawer-slot ${isOpen ? 'has-open-drawer' : ''}" data-repo-id="${repo.id}">
        <!-- Thân ngăn kéo chính -->
        <div class="drawer-inner-cavity">
          <div style="margin-bottom: 12px; font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">
            📦 Tủ lưu trữ: ${repo.categoryLabel}
          </div>
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="cavity-quick-link">
            <span>Mở Kho Mã Nguồn GitHub</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>

        <!-- Thân ngăn kéo chính -->
        <div class="drawer-box ${isOpen ? 'is-open' : ''}" id="drawer-${repo.id}" tabindex="0" role="button" aria-expanded="${isOpen}">
          <div class="drawer-face">
            <div class="drawer-header">
              <span class="category-tag ${catClass}">${repo.categoryLabel}</span>
              <span class="badge-tag">${repo.badge}</span>
            </div>

            <!-- Biển tên dập nổi kim loại -->
            <div class="drawer-nameplate">
              <span class="repo-name">${repo.name}</span>
              <span class="repo-sub">${repo.title}</span>
            </div>

            <!-- Vòng đồng kéo tủ -->
            <div class="drawer-handle-assembly" title="${isOpen ? 'Click hoặc kéo để đóng ngăn tủ' : 'Click hoặc kéo để rút ngăn tủ ra'}">
              <div class="handle-rosette"></div>
              <div class="handle-ring"></div>
              <div class="pull-status-hint">${isOpen ? '▲ ĐẨY ĐỂ ĐÓNG' : '▼ KÉO ĐỂ MỞ'}</div>
            </div>

            <!-- Nội dung chi tiết mở rộng -->
            <div class="drawer-detail-body">
              <p class="repo-description">${repo.description}</p>
              <div class="tags-row">
                ${repo.tags.map(t => `<span class="tech-chip">#${t}</span>`).join('')}
              </div>
              <div class="drawer-footer-actions">
                <div class="repo-lang-indicator">
                  <span class="lang-color-circle"></span>
                  <span>${repo.language}</span>
                </div>
                <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="btn-repo-visit" onclick="event.stopPropagation()">
                  <span>GitHub ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  attachDrawerInteractions();
}

// Gán tương tác Kéo / Thả và Click mở tủ
function attachDrawerInteractions() {
  const drawerSlots = document.querySelectorAll(".drawer-slot");

  drawerSlots.forEach(slot => {
    const repoId = slot.dataset.repoId;
    const drawerBox = slot.querySelector(".drawer-box");
    if (!drawerBox) return;

    let startY = 0;
    let isDragging = false;
    let hasMoved = false;

    // Pointer Drag Support
    drawerBox.addEventListener("pointerdown", (e) => {
      // Don't drag if clicked on link button
      if (e.target.closest("a")) return;
      startY = e.clientY;
      isDragging = true;
      hasMoved = false;
      drawerBox.setPointerCapture(e.pointerId);
    });

    drawerBox.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      if (Math.abs(deltaY) > 6) {
        hasMoved = true;
      }
    });

    drawerBox.addEventListener("pointerup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      drawerBox.releasePointerCapture(e.pointerId);

      const deltaY = e.clientY - startY;
      if (hasMoved) {
        // Dragged downwards or upwards
        if (deltaY < -25) {
          // Dragged up -> open
          toggleDrawer(repoId, true);
        } else if (deltaY > 25) {
          // Dragged down -> close
          toggleDrawer(repoId, false);
        }
      } else {
        // Simple click -> toggle
        toggleDrawer(repoId);
      }
    });

    // Keyboard Accessibility (Enter or Space)
    drawerBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDrawer(repoId);
      }
    });
  });
}

// Chuyển đổi trạng thái ngăn tủ
function toggleDrawer(repoId, forceState) {
  const isCurrentlyOpen = state.openedDrawers.has(repoId);
  const targetState = typeof forceState === "boolean" ? forceState : !isCurrentlyOpen;

  if (targetState) {
    state.openedDrawers.add(repoId);
    soundFx.playDrawerSlide(true);
  } else {
    state.openedDrawers.delete(repoId);
    soundFx.playDrawerSlide(false);
  }

  const drawerElement = document.getElementById(`drawer-${repoId}`);
  if (drawerElement) {
    drawerElement.classList.toggle("is-open", targetState);
    drawerElement.setAttribute("aria-expanded", targetState.toString());
    const hint = drawerElement.querySelector(".pull-status-hint");
    if (hint) {
      hint.textContent = targetState ? "▲ ĐẨY ĐỂ ĐÓNG" : "▼ KÉO ĐỂ MỞ";
    }
  }

  const slotElement = document.querySelector(`.drawer-slot[data-repo-id="${repoId}"]`);
  if (slotElement) {
    slotElement.classList.toggle("has-open-drawer", targetState);
  }
}

// Cập nhật giao diện thanh lọc Category
function updateFilterUI() {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(pill => {
    if (pill.dataset.category === state.currentCategory) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });
}

// Khởi chạy toàn bộ sự kiện khi tài liệu sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  initSakuraPetals();
  renderCabinetGrid();

  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderCabinetGrid();
    });
  }

  // Filter pills
  const filterPills = document.querySelectorAll(".filter-pill");
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      soundFx.playBellChime();
      state.currentCategory = pill.dataset.category;
      updateFilterUI();
      renderCabinetGrid();
    });
  });

  // Master Actions: Pull All / Push All
  const btnPullAll = document.getElementById("btnPullAll");
  const btnPushAll = document.getElementById("btnPushAll");

  if (btnPullAll) {
    btnPullAll.addEventListener("click", () => {
      soundFx.playDrawerSlide(true);
      repositoriesData.forEach(r => state.openedDrawers.add(r.id));
      renderCabinetGrid();
    });
  }

  if (btnPushAll) {
    btnPushAll.addEventListener("click", () => {
      soundFx.playDrawerSlide(false);
      state.openedDrawers.clear();
      renderCabinetGrid();
    });
  }

  // Toggle Sound Button
  const btnSound = document.getElementById("btnToggleSound");
  if (btnSound) {
    btnSound.addEventListener("click", () => {
      const enabled = soundFx.toggleSound();
      btnSound.innerHTML = enabled 
        ? `<span>🔊 Âm thanh: Bật</span>` 
        : `<span>🔇 Âm thanh: Tắt</span>`;
      if (enabled) soundFx.playBellChime();
    });
  }

  // Image error handling fallback (giống Japan_Elearning)
  const scenicBg = document.getElementById("scenicBgImg");
  if (scenicBg) {
    scenicBg.addEventListener("error", () => {
      scenicBg.src = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2000&auto=format&fit=crop";
    });
  }
});
