// todo-logic.js
import {
  addTodo,
  DeleteTodo,
  editTodo,
  fetchAndRenderTodos,
} from "../firebase/firebase-store.js";

/**
 * 할 일 추가 로직
 */
export const processAddTodo = async (text, uid) => {
  if (!text.trim()) {
    alert("할 일을 입력하세요.");
    return null;
  }
  try {
    const docRef = await addTodo(text.trim(), uid);
    return docRef.id; // 성공 시 ID 반환
  } catch (err) {
    console.error("추가 실패:", err);
    alert("추가에 실패했습니다.");
    throw err;
  }
};

/**
 * 할 일 삭제 로직
 */
export const processDeleteTodo = async (id) => {
  try {
    await DeleteTodo(id);
    return true;
  } catch (err) {
    console.error("삭제 실패:", err);
    alert("삭제에 실패했습니다.");
    return false;
  }
};

/**
 * 할 일 수정 로직
 */
export const processEditTodo = async (id, text, date) => {
  try {
    await editTodo(id, text, date);
    return true;
  } catch (err) {
    console.error("수정 실패:", err);
    alert("수정에 실패했습니다.");
    return false;
  }
};

/**
 * 초기 데이터 가져오기
 */
export const loadTodos = async (uid) => {
  try {
    return await fetchAndRenderTodos(uid);
  } catch (err) {
    console.error("데이터 로드 실패:", err);
    return null;
  }
};