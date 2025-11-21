import { signup } from "./firebase/firebase-auth.js";

//getElementById() 함수는 HTML 내에서 주어진 "문자열"과 값이 일치하는 id 속성의 값을 가진 요소 객체를 반환합니다.
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("signup-button");

const showError = (message) => {
  //textContent 속성은 HTML 요소의 텍스트 콘텐츠를 가져오거나 설정
  errorMessage.textContent = message;
  //classList를 통해 엘리먼트의 class에 접근 즉, CSS에 접근 가능
  errorMessage.classList.remove("hidden");
};

const hideError = () => {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
};

//HTML 요소의 "click"이 발생할 경우
submitButton.addEventListener("click", async () => {
  hideError();

  //trim():문자열 좌우에서 공백을 제거하는 함수
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name || !email || !password || !confirmPassword) {
    showError("모든 필드를 채워주세요.");
    return;
  }

  if (password !== confirmPassword) {
    showError("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    const user = await signup(email, password, name);
    alert("인증 이메일을 발송했습니다. 이메일을 확인해주세요!");
    //자바스크립트에서 html문서를 이동하는 방법
    window.location.href = "login.html";
    console.log("가입된 사용자: ", user);
  } catch (error) {
    console.error("회원가입 실패: ", error.message);
    showError(`회원가입 실패: ${error.message}`);
  }
});
