import { signup } from "./firebase/firebase-auth.js";

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("signup-button");

const locationModal = document.getElementById("location-modal");
const locationMessage = document.getElementById("location-message");
const checkLocationBtn = document.getElementById("check-location-button");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalMapContainer = document.getElementById("modal-map");
const allowedRegion = {
  latitude: 37.5543,
  longitude: 126.9705,
  radius: 20,
};

let isLocationVerified = false;
let modalMap;
let userMarker;

function initModalMap() {
  modalMap = L.map(modalMapContainer).setView(
    [allowedRegion.latitude, allowedRegion.longitude],
    12
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(modalMap);

  L.circle([allowedRegion.latitude, allowedRegion.longitude], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.2,
    radius: allowedRegion.radius * 1000,
  }).addTo(modalMap);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const updateUserLocation = (lat, lon) => {
    if(!modalMap) {
        alert("지도 객체가 초기화되지 않았습니다.");
        return;
    }

    if(userMarker) {
        modalMap.removeLayer(userMarker);
    }

    userMarker = L.marker([lat, lon]).addTo(modalMap);
    userMarker.bindPopup("Your Location").openPopup();

    modalMap.setView([lat, lon], 13);
}

const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
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

  if (!name || !email || !password || !confirmPassword) {
    showError("모든 필드를 채워주세요.");
    return;
  }

  if (password !== confirmPassword) {
    showError("비밀번호가 일치하지 않습니다.");
    return;
  }

  if(!isLocationVerified) {
    locationModal.classList.remove("hidden");
    if(!modalMap) {
        initModalMap();
    }
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

closeModalBtn.addEventListener("click", () => {
    locationModal.classList.add("hidden")
})

checkLocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            updateUserLocation(userLat, userLon);

            const distance = calculateDistance(
              allowedRegion.latitude,
              allowedRegion.longitude,
              userLat,
              userLon
            );

            if (distance <= allowedRegion.radius) {
              locationMessage.textContent =
                "허용된 지역 내에 있습니다. 회원가입이 가능합니다.";
            locationMessage.classList.remove("text-gray-700");
            locationMessage.classList.add("text-green-500");
            isLocationVerified = true;
            } else {
                locationMessage.innerText =
                "회원가입이 거부되었습니다. 허용된 지역 외부에 있습니다.";
                locationMessage.classList.add("text-gray-700");
                locationMessage.classList.remove("text-green-500");
            }
          },
          (error) => {
            locationMessage.innerText =
              "위치 정보를 가져오는 중 오류가 발생했습니다: " + error.message;
              locationMessage.classList.remove("text-gray-700");
              locationMessage.classList.add("text-red-500");
          }
        );
      } else {
        locationMessage.innerText = "브라우저에서 위치 정보를 지원하지 않습니다.";
        locationMessage.classList.remove("text-gray-700");
        locationMessage.classList.add("text-red-500");
      }
})