import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js"; //파이어베이스 불러오기
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js"; //실제로 회원가입을 하거나 로그인을 위한 기능
import firebaseConfig from "./firebase-config.js";



const app = initializeApp(firebaseConfig); //파이어베이스 앱 초기화
const auth = getAuth(app); //인증과 관련된 객체를 담아놓을 변수


//외부 자바스크립트에서 해당 객체들을 사용하기 위함.
export{app,auth};