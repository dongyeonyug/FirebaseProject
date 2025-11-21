// firebase-store.js
import { db } from "./firebase-init.js";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  getDocs,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// 사용할 컬렉션 이름
// (Fetch 함수는 Todo.js에 그대로 두고, query에 uid를 추가하도록 수정)
const TODOS_COL = "todos";



export const fetchAndRenderTodos = async (uid) => {

  if (!uid) return; // UID가 없으면 (로그아웃 상태면) 실행하지 않음

  //색인 같은경우, 데이터를 서버에서 받아올때 정렬된 상태로 받고 싶으면 색인 규칙을 추가하고 받아와야 한다.
  try {
    const colRef = collection(db, TODOS_COL);
    const q = query(
        colRef, 
        where("userId", "==", uid), 
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q); //getDocs() 컬렉션에 있는 모든 문서나 쿼리 조건에 맞는 문서들을 한 번에 가져올 때 사용됩니다.

    return snapshot;
  } catch (err) {
    console.error("할 일 불러오는 중 오류:", err);
  }
};



/* ----------------------------------------------------------
 * 1) Firestore에 새 일정(할 일) 저장
 * ---------------------------------------------------------- */
export const addTodo = async (text,uid) => {
  if (!text || !text.trim()) {
    throw new Error("빈 문자열은 저장할 수 없습니다.");
  }

  if (!uid) { // 👈 uid 필수 검사
    throw new Error("사용자 ID가 필요합니다.");
  }

  try {
    const colRef = collection(db, TODOS_COL);
    const newDocRef = await addDoc(colRef, {
      text: text.trim(),
      createdAt: serverTimestamp(),
      userId: uid, // user.uid를 userId 필드에 저장
      date: null
    });
    return newDocRef;
  } catch (err) {
    console.error("할 일 추가 중 오류:", err);
    throw err;
  }
};

// /* ----------------------------------------------------------
//  * 2) Firestore에서 일정 불러오기 + 화면 렌더링
//  * ---------------------------------------------------------- */
// // const listEl = $("#todo-list");
// //   const emptyState = $("#empty-state");
// //파라미터로 전달받는 걸로 변경 todo list값, 을 전달 받고 false or true를 return한다 그 값을 받아 empty-state를 block or none

// export const fetchAndRenderTodos = async (newDocRef) => {

//   try {
//     const colRef = collection(db, TODOS_COL);
//     const q = query(colRef, orderBy("createdAt", "desc")); // ?
//     const snapshot = await getDocs(q); //getDocs() 컬렉션에 있는 모든 문서나 쿼리 조건에 맞는 문서들을 한 번에 가져올 때 사용됩니다.

//     return snapshot;

//   } catch (err) {
//     console.error("할 일 불러오는 중 오류:", err);
//   }
// };

/* ----------------------------------------------------------
 * 3) 일정 완료 확인 후 Firestore에서 삭제
 * ---------------------------------------------------------- */

//해야할일 마쳤나요 알림 은 todo에서 따로 구현 알림->delete
//li는 여기서 다루지 않는다. 참고로 id는 여기서 다뤄진다.
export const DeleteTodo = async (id) => {
  try {
    const docRef = doc(db, TODOS_COL, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("할 일 삭제 중 오류:", err);
  }
};

/* ----------------------------------------------------------
 * 4) 일정 수정 (Firestore 업데이트)
 * ---------------------------------------------------------- */

//

export const editTodo = async (id, newText,dAte=null) => {
  if (!id) throw new Error("수정할 문서 id가 필요합니다.");
  if (newText == null) throw new Error("수정할 텍스트(newText)가 필요합니다.");

  const trimmed = String(newText).trim();
  if (!trimmed) {
    // 선택: 여기서 throw 해도 되고, 호출부에서 alert 처리하도록 할 수도 있음.
    throw new Error("비어 있는 내용으로 변경할 수 없습니다.");
  }

  try {
    const docRef = doc(db, TODOS_COL, id);
    await updateDoc(docRef, { text: trimmed , date: dAte});
    return { id: docRef.id, text: trimmed , date: dAte};
  } catch (err) {
    console.error("할 일 수정 중 오류:", err);
    throw err;
  }
};

/* ----------------------------------------------------------
 * (도움 함수) li 항목 DOM 생성
 * ---------------------------------------------------------- */
// export const createTodoListItem = (id, text) => {
//   const li = document.createElement("li");
//   li.setAttribute("data-id", id);
//   li.className =
//     "flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm";

//   // 왼쪽: 원 + 텍스트
//   const left = document.createElement("div");
//   left.className = "flex items-center gap-4";

//   const circleBtn = document.createElement("button");
//   circleBtn.type = "button";
//   circleBtn.className =
//     "todo-circle shrink-0 w-6 h-6 rounded-full border-2 border-black bg-transparent hover:bg-white transition-colors";
//   circleBtn.addEventListener("click", (e) => {
//     e.stopPropagation();
//     DeleteTodo(id);
//   });

//   const textSpan = document.createElement("span");
//   textSpan.className = "todo-text text-gray-800";
//   textSpan.textContent = text;

//   left.appendChild(circleBtn);
//   left.appendChild(textSpan);

//   // 오른쪽: 편집, 마감 버튼
//   const right = document.createElement("div");
//   right.className = "flex items-center gap-3";

//   const editBtn = document.createElement("button");
//   editBtn.type = "button";
//   editBtn.className = "edit-btn p-2 rounded-md hover:bg-gray-100";
//   editBtn.innerHTML = `<i class="fas fa-pen"></i>`;
//   editBtn.addEventListener("click", (e) => {
//     e.stopPropagation();
//     editTodo(id);
//   });

//   const dateBtn = document.createElement("button");
//   dateBtn.type = "button";
//   dateBtn.className = "date-btn p-2 rounded-md hover:bg-gray-100";
//   dateBtn.innerHTML = `<i class="fas fa-calendar-alt"></i>`;

//   right.appendChild(editBtn);
//   right.appendChild(dateBtn);

//   li.appendChild(left);
//   li.appendChild(right);

//   return li;
// };

/* ----------------------------------------------------------
 * 5) 폼 제출 핸들러 (Todo.js에서 연결)
 * ---------------------------------------------------------- */
// export const handleFormSubmit = async (event) => {
//   event.preventDefault();
//   const input = $("#todo-input");
//   if (!input) return;

//   const text = input.value.trim();
//   if (!text) {
//     alert("할 일을 입력하세요.");
//     return;
//   }

//   try {
//     const docRef = await addTodo(text);

//     const listEl = $("#todo-list");
//     const emptyState = $("#empty-state");
//     if (listEl) {
//       const li = createTodoListItem(docRef.id, text);
//       listEl.prepend(li);
//       if (emptyState) emptyState.style.display = "none";
//     }

//     input.value = "";
//     input.focus();
//   } catch (err) {
//     console.error("폼 제출 처리 중 오류:", err);
//     alert("할 일 추가에 실패했습니다.");
//   }
// };
