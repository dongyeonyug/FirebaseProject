// main.js
import { auth } from "../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { logout } from "../firebase/firebase-auth.js";

import { processAddTodo, loadTodos } from "./Todo-logic.js";
import { renderSnapshot, createTodoElement, prependTodoItem } from "./Todo-ui.js";

// 전역 버튼 요소
const todoInputEl = document.getElementById("todo-input");
const todoSubmitBtn = document.getElementById("todo-button");
// const logoutBtn = document.getElementById("logout-button");
const userNameEl = document.getElementById("user-name");
const userEmailEl = document.getElementById("user-email");

document.addEventListener("DOMContentLoaded", () => {
  // 1. 인증 상태 감지
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    // 2. 사용자 정보 표시
    userNameEl.textContent = user.displayName || "이름 없음";
    userEmailEl.textContent = user.email;

    // 3. 초기 데이터 로드 및 렌더링
    const snapshot = await loadTodos(user.uid);
    renderSnapshot(snapshot);

    // 4. '추가' 버튼 이벤트 연결
    if (todoSubmitBtn) {
      todoSubmitBtn.onclick = async () => {
        const text = (todoInputEl?.value || "").trim();
        // 로직 처리는 logic.js가 담당
        const newId = await processAddTodo(text, user.uid); 
        
        if (newId) {
          // 화면 갱신은 ui.js가 담당
          const li = createTodoElement(newId, text, null);
          prependTodoItem(li);
          todoInputEl.value = "";
          todoInputEl.focus();
        }
      };
    }
  });
});

// // 로그아웃 이벤트
// logoutBtn?.addEventListener("click", async () => {
//   if (confirm("정말로 로그아웃하시겠습니까?")) {
//     try {
//       await logout();
//       window.location.href = "login.html";
//     } catch (error) {
//       console.error("로그아웃 실패", error);
//     }
//   }
// });