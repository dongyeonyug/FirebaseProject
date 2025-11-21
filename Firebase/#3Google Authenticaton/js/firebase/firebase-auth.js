import { auth } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const generateRandomBase32 = () => {
  const chars = "ABCDEFGHIGKLMNOPQRSTUVWXYZ234567";
  let result = '';
  for(let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export const generateQRCode = (email) => {
  const secret = generateRandomBase32();
  const otpauth = `otpauth://totp/${encodeURIComponent(email)}?secret=${secret}&issuer=MyAuthApp`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  return { secret, qrCodeUrl };
}

export const verifyOTP = (secret, token) => {
  const totp = new jsOTP.totp();
  const generateOTP = totp.getOtp(secret);
  return generateOTP === token;
}

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
}
