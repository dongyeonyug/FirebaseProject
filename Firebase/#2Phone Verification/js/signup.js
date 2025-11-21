import {
  signup,
  setupRecaptcha,
  sendVerificationCode,
} from "./firebase/firebase-auth.js";

const form = document.getElementById("signup-form");
const phoneInput = document.getElementById("phone");
const verifyPhoneButton = document.getElementById("verify-phone-button");
const verificationCodeContainer = document.getElementById(
  "verification-code-container"
);
const verificationCodeInput = document.getElementById("verification-code");
const confirmCodeButton = document.getElementById("confirm-code-button");
const errorMessage = document.getElementById("error-message");

let isPhoneVerified = false;

const showError = (message, isSuccess = false) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  errorMessage.className = `text-sm ${
    isSuccess ? "text-green-500" : "text-red-500"
  }`;
};

const formatPhoneNumber = (phoneNumber) => {
  phoneNumber = phoneNumber.replace(/^0/, "+82");
  return phoneNumber.replace(/[^+\d]/g, "");
};

phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
});

verifyPhoneButton.addEventListener("click", async () => {
  const phoneNumber = formatPhoneNumber(phoneInput.value.trim());

  if (!/^\+82\d{9,10}$/.test(phoneNumber)) {
    showError("올바른 전화번호 형식이 아닙니다.");
    return;
  }

  try {
    verifyPhoneButton.disabled = true;
    const recaptchaVerifier = setupRecaptcha("recaptcha-container");
    await sendVerificationCode(phoneNumber, recaptchaVerifier);
    verificationCodeContainer.classList.remove("hidden");
    showError("인증번호가 발송되었습니다", true);
  } catch (error) {
    alert(error);
    showError("인증번호 발송에 실패했습니다.");
    verifyPhoneButton.disabled = false;
  }
});

confirmCodeButton.addEventListener("click", async () => {
  const code = verificationCodeInput.value.trim();
  if (!code) {
    showError("인증번호를 입력해주세요.");
    return;
  }

  try {
    await window.confirmationResult.confirm(code);
    isPhoneVerified = true;
    showError("전화번호 인증이 완료되었습니다.", true);
    phoneInput.disabled = true;
    verificationCodeInput.disabled = true;
    verifyPhoneButton.disabled = true;
    confirmCodeButton.disabled = true;
  } catch (error) {
    showError("잘못된 인증번호입니다.");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isPhoneVerified) {
    showError("전화번호 인증을 완료해주세요.");
    return;
  }

  const formData = new FormData(form);

  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirm-password");

  if (password !== confirmPassword) {
    showError("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    const user = await signup(email, password, name);
    alert("인증 이메일을 발송했습니다. 이메일을 확인해주세요!");
    window.location.href = "login.html";
    console.log("가입된 사용자: ", user);
  } catch (error) {
    console.error("회원가입 실패: ", error.message);
    showError(`회원가입 실패: ${error.message}`);
  }
});
