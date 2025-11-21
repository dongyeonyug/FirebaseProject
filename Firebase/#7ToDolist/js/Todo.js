import {
  addTodo,
  DeleteTodo,
  editTodo,
  fetchAndRenderTodos,
} from "./firebase/firebase-store.js";
import { auth } from "./firebase/firebase-init.js";
import { logout, deleteAccount } from "./firebase/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const TodoList = document.getElementById("todo-list");
const EmptyState = document.getElementById("empty-state");

/* ----------------------------------------------------------
 * Firestore에서 일정 불러오기 + 화면 렌더링
 * ---------------------------------------------------------- */
// const listEl = $("#todo-list");
//   const emptyState = $("#empty-state");
//파라미터로 전달받는 걸로 변경 todo list값, 을 전달 받고 false or true를 return한다 그 값을 받아 empty-state를 block or none

// const TODOS_COL = "todos"; // 컬렉션 이름

// const fetchAndRenderTodos = async (newDocRef) => {
//   try {
//     const colRef = collection(db, TODOS_COL);
//     const q = query(colRef, orderBy("createdAt", "desc")); // ?
//     const snapshot = await getDocs(q); //getDocs() 컬렉션에 있는 모든 문서나 쿼리 조건에 맞는 문서들을 한 번에 가져올 때 사용됩니다.

//     return snapshot;
//   } catch (err) {
//     console.error("할 일 불러오는 중 오류:", err);
//   }
// };

const renderSnapshotToList = (snapshot) => {
  TodoList.innerHTML = "";
  if (!snapshot || snapshot.empty) {
    if (EmptyState) EmptyState.style.display = "block";
    return;
  } else {
    if (EmptyState) EmptyState.style.display = "none";
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    const text = data?.text ?? "(내용 없음)";
    // 👈 이 부분 추가/수정: date 필드를 가져와 JS Date 객체로 변환
    const dAte = data?.date ? data.date.toDate() : null;
    const li = createTodoListItem(id, text, dAte); // 변경
    TodoList.appendChild(li);
  });
};

const createTodoListItem = (id, text, initialDate) => {
  const li = document.createElement("li");
  let date = initialDate;
  let currentText = text; // 원본 텍스트를 저장

  li.setAttribute("data-id", id); //li 태그에 data-id="문서ID" 라는 속성을 추가한다. , Firestore 같은 DB에서 가져온 문서 ID를 DOM 요소에 보관하려고 쓰는 것.
  li.className =
    "flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm";

  // 왼쪽: 원 + 텍스트
  const left = document.createElement("div");
  left.className = "flex items-center gap-4";

  const circleBtn = document.createElement("button");
  circleBtn.id = "circle-btn";
  circleBtn.type = "button";
  circleBtn.className =
    "todo-circle shrink-0 w-6 h-6 rounded-full border-2 border-black bg-transparent hover:bg-white transition-colors";
  circleBtn.addEventListener("click", async (e) => {
    e.stopPropagation(); //이벤트가 부모 요소로 퍼지는 것(버블링)을 막는다.

    const ok = confirm("해야할 일을 마쳤나요?");
    if (!ok) return;

    try {
      await DeleteTodo(id); // Firestore 에서 삭제
      li.remove(); // DOM에서 제거
      if (TodoList.children.length === 0 && EmptyState) {
        EmptyState.style.display = "block";
      }
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  });

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text text-gray-800";

  let innerHtmlContent = text;
  if (date instanceof Date) {
    const dateOnly = date.toLocaleDateString("ko-KR");
    innerHtmlContent = `${text}&emsp;&emsp;${dateOnly}까지`;
  }

  textSpan.innerHTML = innerHtmlContent;

  left.appendChild(circleBtn);
  left.appendChild(textSpan);

  // 오른쪽: 편집, 마감 버튼
  const right = document.createElement("div");
  right.className = "flex items-center gap-3";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn p-2 rounded-md hover:bg-gray-100";
  editBtn.innerHTML = `<i class="fas fa-pen"></i>`;
  editBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    const updatedText = prompt("수정할 내용을 입력하세요:", text);
    if (updatedText == null) return;
    const trimmed = updatedText.trim();
    if (!trimmed) {
      alert("비어 있는 내용으로 변경할 수 없습니다.");
      return;
    }
    try {
      await editTodo(id, trimmed, date);
      currentText = trimmed;
      // DOM 업데이트
      const textEl = li.querySelector(".todo-text");

      if (textEl) {
          let innerHtmlContent = trimmed;
          // date가 유효한 Date 객체이면 날짜 정보를 추가
          if (date instanceof Date) { 
              const dateOnly = date.toLocaleDateString("ko-KR");
              innerHtmlContent = `${trimmed}&emsp;&emsp;${dateOnly}까지`;
          }
          textEl.innerHTML = innerHtmlContent; // textSpan.innerHTML 대신 textEl.innerHTML 사용 (textEl은 textSpan을 참조)
      }
      else{
        innerHtmlContent = `${trimmed}`;
        textSpan.innerHTML = innerHtmlContent;
      }
      
    } catch (err) {
      console.error("수정 실패 (id=" + id + "):", err);
      alert("수정에 실패했습니다.");
    }
  });

  const dateBtn = document.createElement("button");
  dateBtn.type = "button";
  dateBtn.className = "date-btn p-2 rounded-md hover:bg-gray-100";
  dateBtn.innerHTML = `<i class="fas fa-calendar-alt"></i>`;

  // 숨겨진 input 생성
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.style.position = "absolute";
  dateInput.style.opacity = "0";
  dateInput.style.pointerEvents = "none";
  document.body.appendChild(dateInput);

  // 버튼 누르면 input의 네이티브 달력 실행
  dateBtn.addEventListener("click", () => {
    dateInput.focus();
    dateInput.showPicker?.(); // 최신 브라우저 지원
  });

  // 날짜 선택되면 이쪽으로 들어옴
  dateInput.addEventListener("change", async () => {
    console.log("선택된 날짜:", dateInput.value); // → yyyy-mm-dd
    const dateString = dateInput.value;
    const dAte = new Date(dateInput.value);

    const nowText=textSpan.innerText
    try {
      await editTodo(id, currentText, dAte);
      date = dAte; // 👈 로컬 스코프의 date 변수를 최신 값으로 업데이트

      const dateOnly = dAte.toLocaleDateString("ko-KR");
      // DOM 업데이트
      const textEl = li.querySelector(".todo-text");

      if (textEl) textEl.innerHTML = `${currentText}&emsp;&emsp;${dateOnly}까지`;
    } catch (err) {
      console.error("수정 실패 (id=" + id + "):", err);
      alert("수정에 실패했습니다.");
    }
  });

  right.appendChild(editBtn);
  right.appendChild(dateBtn);

  li.appendChild(left);
  li.appendChild(right);

  return li;
};

document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    const confirmed = confirm("정말로 로그아웃하시겠습니까?");
    if (confirmed) {
      await logout();
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("로그아웃 실패: ", error.message);
    alert("로그아웃에 실패했습니다. 다시 시도해 주세요.");
  }
});

// 초기 로드: 기존 데이터 불러와 화면에 렌더
document.addEventListener("DOMContentLoaded", () => {
  const TodoInput = document.getElementById("todo-input");
  const TodoSubmitButton = document.getElementById("todo-button");

  if (!TodoList) {
    console.error("todo-list element not found. 확인해주세요.");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;

      try {
        const snapshot = await fetchAndRenderTodos(uid);
        console.log("snapshot:", snapshot, "empty?", snapshot?.empty);
        renderSnapshotToList(snapshot);
      } catch (err) {
        console.error("초기 로드 실패:", err);
      }

      // 버튼이 존재할 때만 이벤트 바인딩 (중복 바인딩 방지)
      if (TodoSubmitButton) {
        TodoSubmitButton.onclick = async () => {
          const text = (TodoInput?.value || "").trim();
          if (!text) {
            alert("할 일을 입력하세요.");
            return;
          }
          try {
            const docRef = await addTodo(text, uid);
            const li = createTodoListItem(docRef.id, text);
            TodoList.prepend(li);
            if (EmptyState) EmptyState.style.display = "none";
            TodoInput.value = "";
            TodoInput.focus();
          } catch (err) {
            console.error("할 일 추가 실패:", err);
            alert("추가에 실패했습니다.");
          }
        };
      } else {
        console.warn("TodoSubmitButton not found; skipping submit binding.");
      }
    } else {
      // 로그아웃(또는 아직 인증 복원중) 상태: 즉시 리다이렉트하지 않음
      TodoList.innerHTML = "";
      if (EmptyState) EmptyState.style.display = "block";
      console.log(
        "사용자 인증 없음 — 즉시 리다이렉트하지 않았습니다. auth.currentUser:",
        auth.currentUser
      );
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
    }
  });
});
////
