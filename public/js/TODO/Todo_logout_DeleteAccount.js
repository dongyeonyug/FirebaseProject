import {logout, deleteAccount} from "../firebase/firebase-auth.js";


  //Todo페이지 우측 상단 햄버거 버튼 클릭하면 나타나는 프로필, 로그아웃, 회원탈퇴 기능.




  document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-toggle-btn');
    const dropdown = document.getElementById('dropdown-menu');

    // 1. 메뉴 버튼 클릭 시 드롭다운 토글
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      dropdown.classList.toggle('hidden');
    });

    // 2. 메뉴 외부 영역 클릭 시 드롭다운 닫기
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // (옵션) 로그아웃/회원탈퇴 버튼 클릭 시 동작 예시
    document.getElementById('logout-button').addEventListener('click', async() => {
      
        try{
        const confirmed =confirm("정말로 로그아웃하시겠습니까?");
        if(confirmed){
            await logout();
            window.location.href="login.html";
        }
    }catch(error){
        console.error("로그아웃 실패: ",error.message);
        alert("로그아웃에 실패했습니다. 다시 시도해 주세요.");
    }
      
    });
    
    document.getElementById('delete-account-btn').addEventListener('click', async() => {
       try{
        const confirmed= confirm("정말로 계정을 삭제하시겠습니까?");
        if(!confirmed) return; 
        
        await deleteAccount();
    }catch(error){
        console.error("계정 삭제 실패: ",error.message);
        alert(error.message)
    }
    });
  });
