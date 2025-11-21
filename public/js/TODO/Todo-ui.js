// todo-ui.js
import { processDeleteTodo, processEditTodo } from "./Todo-logic.js";

// DOM 요소 참조
const todoListEl = document.getElementById("todo-list");
const emptyStateEl = document.getElementById("empty-state");

// 리스트 전체 렌더링 함수
export const renderSnapshot = (snapshot) => {
  todoListEl.innerHTML = "";
  const isEmpty = !snapshot || snapshot.empty;
  updateEmptyState(isEmpty);

  if (isEmpty) return;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const dateObj = data?.date ? data.date.toDate() : null;
    const li = createTodoElement(docSnap.id, data?.text, dateObj);
    todoListEl.appendChild(li);
  });
};

// 단일 아이템 UI 생성 및 이벤트 연결 (핵심)
export const createTodoElement = (id, text, dateObj) => {
  const li = document.createElement("li");
  li.className = "flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm";
  li.dataset.id = id;

  // 1. HTML 구조 잡기 (Template Literals)
  const dateStr = dateObj ? dateObj.toLocaleDateString("ko-KR") + "까지" : "";
  const displayText = dateStr 
    ? `${text}&emsp;&emsp;<small class="text-gray-500">${dateStr}</small>` 
    : text;

  li.innerHTML = `
    <div class="flex items-center gap-4">
      <button type="button" class="btn-complete todo-circle shrink-0 w-6 h-6 rounded-full border-2 border-black bg-transparent hover:bg-white transition-colors"></button>
      <span class="todo-text text-gray-800">${displayText}</span>
    </div>
    <div class="flex items-center gap-3">
      <button type="button" class="btn-edit p-2 rounded-md hover:bg-gray-100"><i class="fas fa-pen"></i></button>
      <button type="button" class="btn-date p-2 rounded-md hover:bg-gray-100"><i class="fas fa-calendar-alt"></i></button>
      <input type="date" class="date-input absolute opacity-0 pointer-events-none" /> 
    </div>
  `;

  // 2. 내부 요소 선택
  const completeBtn = li.querySelector(".btn-complete");
  const editBtn = li.querySelector(".btn-edit");
  const dateBtn = li.querySelector(".btn-date");
  const dateInput = li.querySelector(".date-input");
  const textSpan = li.querySelector(".todo-text");

  // 3. 이벤트 리스너 연결

  // [삭제/완료]
  completeBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (confirm("해야할 일을 마쳤나요?")) {
      const success = await processDeleteTodo(id);
      if (success) {
        li.remove();
        checkEmptyList();
      }
    }
  });

  // [수정]
  editBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const newText = prompt("수정할 내용을 입력하세요:", text);
    if (newText && newText.trim()) {
      const trimmed = newText.trim();
      const success = await processEditTodo(id, trimmed, dateObj);
      if (success) {
        text = trimmed; // 내부 상태 업데이트
        updateTextUI(textSpan, text, dateObj);
      }
    }
  });

  // [날짜]
  dateBtn.addEventListener("click", () => {
    dateInput.showPicker ? dateInput.showPicker() : dateInput.focus();
  });

  dateInput.addEventListener("change", async (e) => {
    const newDate = new Date(e.target.value);
    const success = await processEditTodo(id, text, newDate);
    if (success) {
      dateObj = newDate; // 내부 상태 업데이트
      updateTextUI(textSpan, text, dateObj);
    }
  });

  return li;
};

// UI 헬퍼 함수: 리스트에 새 아이템 추가 (맨 위로)
export const prependTodoItem = (li) => {
  todoListEl.prepend(li);
  updateEmptyState(false);
};

// UI 헬퍼 함수: 텍스트 업데이트
function updateTextUI(element, text, dateObj) {
  const dateStr = dateObj ? dateObj.toLocaleDateString("ko-KR") + "까지" : "";
  element.innerHTML = dateStr 
    ? `${text}&emsp;&emsp;<small class="text-gray-500">${dateStr}</small>` 
    : text;
}

// UI 헬퍼 함수: 빈 상태 토글
function updateEmptyState(isEmpty) {
  if (emptyStateEl) emptyStateEl.style.display = isEmpty ? "block" : "none";
}

// UI 헬퍼 함수: 리스트 개수 체크 후 빈 상태 처리
function checkEmptyList() {
  if (todoListEl.children.length === 0) updateEmptyState(true);
}