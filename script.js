// ==========================================================================
// 웹 명함 인터랙션 스크립트 (script.js)
// 김민준 - 바이브코딩 풀스택 개발자
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 참조
  const card = document.getElementById("card");
  const cardGlow = document.getElementById("cardGlow");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const copyButtons = document.querySelectorAll(".copy-btn");
  const saveContactBtn = document.getElementById("saveContactBtn");
  const shareCardBtn = document.getElementById("shareCardBtn");
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");

  // 프로필 데이터
  const profileData = {
    name: "김민준",
    title: "바이브코딩 풀스택 개발자",
    email: "kimmj@gmail.com",
    phone: "010-3412-6530",
    bio: "아이디어를 감각적인 프로덕트로, 바이브 있게 코딩하는 풀스택 개발자 김민준입니다."
  };

  /* --------------------------------------------------------------------------
     1. 다크 모드 / 라이트 모드 토글
     -------------------------------------------------------------------------- */
  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.setAttribute("data-theme", "dark");
      updateThemeIcon(true);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      updateThemeIcon(false);
    }
  };

  const updateThemeIcon = (isDark) => {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun" style="color: #fbbf24;"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeIcon(newTheme === "dark");
      showToast(`${newTheme === "dark" ? "다크 모드" : "라이트 모드"}가 적용되었습니다.`);
    });
  }

  initTheme();

  /* --------------------------------------------------------------------------
     2. 3D 틸트 (Tilt) & 빛 반사 효과
     -------------------------------------------------------------------------- */
  if (card) {
    let bounds;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      if (cardGlow) cardGlow.style.opacity = "1";
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      
      const percentX = (mouseX - centerX) / centerX;
      const percentY = (mouseY - centerY) / centerY;
      
      // 회전 각도 제한 (-10도 ~ +10도)
      const maxRotate = 9;
      const rotateX = -percentY * maxRotate;
      const rotateY = percentX * maxRotate;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

      // 마우스 위치에 따른 조명 효과 위치 이동
      if (cardGlow) {
        cardGlow.style.background = `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.45) 0%, transparent 65%)`;
      }
    };

    const onMouseLeave = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (cardGlow) cardGlow.style.opacity = "0";
      bounds = null;
    };

    card.addEventListener("mouseenter", onMouseEnter);
    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);
  }

  /* --------------------------------------------------------------------------
     3. 클립보드 복사 & 토스트 팝업 알림
     -------------------------------------------------------------------------- */
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    
    toastMsg.textContent = message;
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute("data-copy");
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`복사되었습니다: ${textToCopy}`);
        
        // 아이콘 일시적 변경 피드백
        const icon = btn.querySelector("i");
        if (icon) {
          icon.className = "fa-solid fa-check";
          setTimeout(() => {
            icon.className = "fa-regular fa-copy";
          }, 1500);
        }
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast(`복사되었습니다: ${textToCopy}`);
      }
    });
  });

  /* --------------------------------------------------------------------------
     4. 스마트폰 연락처 저장 (vCard .vcf 다운로드)
     -------------------------------------------------------------------------- */
  if (saveContactBtn) {
    saveContactBtn.addEventListener("click", () => {
      const vCardContent = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${profileData.name}`,
        `TITLE:${profileData.title}`,
        `TEL;TYPE=CELL,VOICE:${profileData.phone}`,
        `EMAIL;TYPE=PREF,INTERNET:${profileData.email}`,
        `NOTE:${profileData.bio}`,
        "END:VCARD"
      ].join("\r\n");

      const blob = new Blob([vCardContent], { type: "text/vcard;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${profileData.name}_명함.vcf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("연락처 파일(vCard)이 다운로드되었습니다.");
    });
  }

  /* --------------------------------------------------------------------------
     5. 명함 공유 (Web Share API 또는 링크 복사)
     -------------------------------------------------------------------------- */
  if (shareCardBtn) {
    shareCardBtn.addEventListener("click", async () => {
      const shareData = {
        title: `${profileData.name} | ${profileData.title}`,
        text: `${profileData.bio} (${profileData.phone} / ${profileData.email})`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // 사용자가 취소한 경우 예외 무시
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast("웹 명함 링크가 복사되었습니다!");
        } catch (err) {
          showToast("명함 주소 복사에 실패했습니다.");
        }
      }
    });
  }
});

