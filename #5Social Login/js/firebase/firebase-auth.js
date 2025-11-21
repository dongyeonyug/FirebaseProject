import { auth } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
  
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// 회원가입 함수
export const signup = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(userCredential.user, {
    displayName: displayName,
  });

  await sendEmailVerification(userCredential.user);

  return userCredential.user;
};

// 로그인 함수
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!userCredential.user.emailVerified) {
      throw new Error("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
    }

    console.log("로그인 성공: ", userCredential.user);
    return userCredential.user;
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요."
      );
    } else {
      throw error;
    }
  }
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const googleLogin = async() => {
  try {
    const provider = new GoogleAuthProvider();
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("google 로그인 성공: ", user);
    return user;
  } catch(error) {
    if(error.code === "auth/popup-closed-by-user") {
      throw new Error("로그인 창이 닫혔습니다. 다시 시도해주세요.");
    } else if(error.code === "auth/network-request-failed") {
      throw new Error("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } else {
      console.error("google 로그인 실패: ", error);
      throw new Error("구글 로그인에 실패했습니다. 다시 시도해주세요");
    }
  }
}

export const githubLogin = async() => {
  try {
    const provider = new GithubAuthProvider();
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("Github 로그인 성공: ", user);
    return user;
  } catch(error) {
    if(error.code === "auth/popup-closed-by-user") {
      throw new Error("로그인 창이 닫혔습니다. 다시 시도해주세요.");
    } else if(error.code === "auth/network-request-failed") {
      throw new Error("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } else {
      console.error("Github 로그인 실패: ", error);
      throw new Error("구글 로그인에 실패했습니다. 다시 시도해주세요");
    }
  }
}