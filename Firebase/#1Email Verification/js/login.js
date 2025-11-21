import { login } from "./firebase/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("login-button");

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

submitButton.addEventListener("click", async () => {
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  try {
    const user = await login(email, password);
    console.log("로그인된 사용자: ", user);
    alert(`로그인 성공! 환영합니다. ${user.displayName}님!`);
    window.location.href = "dashboard.html"
  } catch (error) {
    console.error("로그인 실패: ", error.message);
    if (error.message.includes("이메일 인증")) {
      showError("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
    } else {
      showError(error.message);
    }
  }
});
