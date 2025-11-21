import { auth } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword, //회원가입
  signInWithEmailAndPassword, //로그인
  updateProfile, //프로필수정
  sendEmailVerification, //이메일 인증
  sendPasswordResetEmail, //비밀번호재설정
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// 회원가입 함수
export const signup = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(userCredential.user, {
    displayName: displayName, //이메일·비밀번호로 생성된 계정에 “닉네임”을 덧붙이기
  });

  await sendEmailVerification(userCredential.user); //가입한 사용자 이메일로 인증 메일 발송

  return userCredential.user; //사용자 정보 반환
};

//로그인함수
export const login = async (email, password) => {
  //패스워드가 틀리거나 email이 없는 경우 try문 종료 catch(error)발생
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
    //"auth/invalid-credential"<-이메일 또는 비밀번호가 틀렸을 경우 발생하는 에러
    if (error.code === "auth/invalid-credential") {
      //throw: 자바스크립트의 에러 이외의, 내가 예외로 처리하고 싶은 예외 규칙을 설정할 수 있다.
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    //로그인 횟수가 너무 비정상으로 많을 경우 발생하는 에러
    else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "너무 많은 로그인 시도가 있습니다. 잠시 후 다시 시도해주세요."
      );
    } else {
      throw error;
    }
  }
};

//비밀번호 초기화 함수
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};


//전화번호 인증을 시작하기 전에,봇이 아닌 실제 사용자가 요청을 보낸 것인지 확인하는 “reCAPTCHA 위젯”을 만들어주는 함수.
//기존에 존재하는 reCAPTCHA 객체가 있으면 제거
//새로운 RecaptchaVerifier 객체 생성
export const setupRecaptcha = (containerID) => {
  if(window.recaptchaVerifier){
    window.recaptchaVerifier.clear();

  }

  //firebase에서 제공하는 RecaptchaVerifier함수를 가져와 새로운 객체 생성
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerID, {

    'size': 'normal',
    'callback': () => {}
  
  });

  return window.recaptchaVerifier;
};

//Firebase에 전화번호 인증 요청 (SMS 전송)
export const sendVerificationCode = async (phoneNumber, recaptchaVerifier) =>{
  const confirmationResult =await signInWithPhoneNumber(auth, phoneNumber , recaptchaVerifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}