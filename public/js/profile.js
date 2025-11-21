import { auth } from "./firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameElement = document.getElementById("user-name");
  const userEmailElement = document.getElementById("user-email");
  const userUidElement = document.getElementById("user-uid");
  const userCreatedElement = document.getElementById("user-created");
  const userLastLoginElement = document.getElementById("user-last-login");
  const userVerifiedElement = document.getElementById("user-verified");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userNameElement.textContent = user.displayName || "이름 없음";
      userEmailElement.textContent = user.email;
      userUidElement.textContent = user.uid;
      
      userVerifiedElement.textContent = user.emailVerified ? "인증됨" : "인증 필요";
      userVerifiedElement.className = user.emailVerified ? "ml-2 text-green-600" : "ml-2 text-red-600";

      const createdDate = new Date(user.metadata.creationTime);
      userCreatedElement.textContent = createdDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const lastLoginDate = new Date(user.metadata.lastSignInTime);
      userLastLoginElement.textContent = lastLoginDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
    }
  });
});