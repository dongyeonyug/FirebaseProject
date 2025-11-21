import { signup, generateQRCode, verifyOTP } from "./firebase/firebase-auth.js";

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("signup-button");

const qrContainer = document.getElementById("qr-code-container");
const qrCode = document.getElementById("qr-code");

let tempSecret = null;
let isQRGenerated = false;

const showError = (message, isSuccess = false) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  errorMessage.className = `text-sm ${
    isSuccess ? "text-green-500" : "text-red-500"
  }`;
};

const hideError = () => {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
};

submitButton.addEventListener("click", async () => {
  hideError();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  const otpCode = document.getElementById("otp-code").value;

  if (!name || !email || !password || !confirmPassword) {
    showError("모든 필드를 채워주세요.");
    return;
  }

  if (password !== confirmPassword) {
    showError("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    if (!isQRGenerated) {
      const { secret, qrCodeUrl } = generateQRCode(email);

      tempSecret = secret;

      const img = new Image();
      img.onload = () => {
        qrCode.innerHTML = "";
        qrCode.appendChild(img);
        qrContainer.classList.remove("hidden");
        submitButton.textContent = "인증하고 가입하기";

        showError(
          "Google Authenticator로 QR 코드를 스캔한 후 인증번호를 입력해주세요.",
          true
        );
        isQRGenerated = true;
      };



      img.onerror = () => {
        showError("QR 코드 생성에 실패했습니다. 다시 시도해주세요.");
      };

      img.alt = "QR Code";
      img.className = "mx-auto";
      img.crossOrigin = "anonymous";
      img.src = qrCodeUrl;

      return;
    }

    if (!verifyOTP(tempSecret, otpCode)) {
      showError("잘못된 인증번호입니다.");
      return;
    }

    const user = await signup(email, password, name);


    alert("회원가입에 성공했습니다.")
    localStorage.setItem(`2fa_${user.uid}`,tempSecret);
    
    window.location.href = "login.html";
    console.log("가입된 사용자: ", user);
  } catch (error) {
    console.error("회원가입 실패: ", error.message);
    showError(`회원가입 실패: ${error.message}`);
  }
});
