import { login, verifyOTP } from "./firebase/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("login-button");

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

const hideError = () => {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}

submitButton.addEventListener("click", async () => {
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if(!email || !password) {
        showError("이메일과 비밀번호를 모두 입력해주세요.");
        return;
    }

    try {
        const user = await login(email, password);
        const secret = localStorage.getItem(`2fa_${user.uid}`);

        if(!secret) {
            showError("2FA 설정을 찾을 수 없습니다.");
            return;
        }

        const otpCode = prompt("Google Authenticator 인증번호를 입력하세요 (6자리): ");

        if(!otpCode) {
            showError("인증번호를 입력해주세요.")
            return;
        }

        if(!verifyOTP(secret, otpCode)) {
            showError("잘못된 인증번호입니다.");
            return;
        }

        console.log("로그인된 사용자: ", user);
        alert(`로그인 성공! 환영합니다. ${user.displayName}님!`);
        window.location.href = "dashboard.html";
    } catch(error) {
        console.error("로그인 실패: ", error.message);
        if(error.message.includes("이메일 인증")) {
            showError("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
        } else {
            showError(error.message);
        }
    }
})
