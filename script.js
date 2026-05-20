import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyAwvjKBBjaLR6-qJ4li6INQ9vKphTUB03Y",
  authDomain: "asdasdasd125215.firebaseapp.com",
  projectId: "asdasdasd125215",
  storageBucket: "asdasdasd125215.firebasestorage.app",
  messagingSenderId: "673607081978",
  appId: "1:673607081978:web:01e54a500101f52e158e43",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== ОСНОВНОЙ КОД =====
(function () {
  const targetYear = 2026;
  const targetMonth = 7;
  const targetDay = 29;

  const targetDate = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);

  const weekdaysElem = document.getElementById("weekdays");
  const weekdays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

  weekdays.forEach((d) => {
    const el = document.createElement("div");
    el.textContent = d;
    weekdaysElem.appendChild(el);
  });

  const grid = document.getElementById("grid");
  const year = 2026,
    month = 7;

  const first = new Date(year, month, 1);
  const jsDay = first.getDay();
  const emptyBefore = jsDay === 0 ? 6 : jsDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < emptyBefore; i++) {
    const c = document.createElement("div");
    c.className = "cell empty";
    c.textContent = "0";
    grid.appendChild(c);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const c = document.createElement("div");
    c.className = "cell";
    c.textContent = d;

    if (d === targetDay) {
      c.classList.add("selected");
    }

    grid.appendChild(c);
  }

  const totalCells = grid.children.length;
  const needed = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  for (let i = 0; i < needed; i++) {
    const c = document.createElement("div");
    c.className = "cell empty";
    c.textContent = "0";
    grid.appendChild(c);
  }

  const elDays = document.getElementById("days");
  const elHours = document.getElementById("hours");
  const elMinutes = document.getElementById("minutes");
  const elSeconds = document.getElementById("seconds");

  function pad(n) {
    return n.toString().padStart(2, "0");
  }

  function updateTimer() {
    const now = new Date();
    let diff = targetDate - now;

    if (diff < 0) diff = 0;

    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / (3600 * 24));
    const hours = Math.floor((s % (3600 * 24)) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    elDays.textContent = days;
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  updateTimer();
  setInterval(updateTimer, 1000);
})();

// ===== ЗАСТАВКА =====

const intro = document.getElementById("intro");
const openBtn = document.getElementById("openInvite");
const music = document.getElementById("bgMusic");
const video = document.getElementById("video");
const site = document.getElementById("site");

document.body.classList.add("lock");

openBtn.addEventListener("click", () => {
  music.play();
  video.play();
  site.style.display = "flex";

  intro.classList.add("hide");
  document.body.classList.remove("lock");
});

// ===== КАРТА =====

const button = document.querySelector(".button-map");
const mapContainer = document.querySelector(".map-container");

button.addEventListener("click", () => {
  mapContainer.classList.toggle("open");
});

// ===== АНИМАЦИЯ ПЛАНА =====

const planItems = document.querySelectorAll(".plan__day__item");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.2,
  },
);

planItems.forEach((item) => {
  observer.observe(item);
});

// ===== ФОРМА (FIREBASE) =====

const form = document.getElementById("anketaForm");
const nameInput = document.getElementById("nameInput");
const formMessage = document.getElementById("formMessage");
const submitButton = document.querySelector(".button__send");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  formMessage.textContent = "";
  formMessage.className = "form-message";
  nameInput.classList.remove("input-error");

  const name = nameInput.value.trim();

  if (name === "") {
    nameInput.classList.add("input-error");
    formMessage.textContent = "Поле имени должно быть заполнено";
    formMessage.classList.add("error");
    return;
  }

  const attendance = document.querySelector(
    'input[name="attendance"]:checked',
  ).value;

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Отправка...";

    await addDoc(collection(db, "guests"), {
      name: name,
      attendance: attendance,
      createdAt: serverTimestamp(),
    });

    formMessage.textContent = "Анкета успешно отправлена";
    formMessage.classList.add("success");

    form.reset();
    document.querySelector('input[name="attendance"][value="yes"]').checked =
      true;
  } catch (error) {
    console.error(error);

    formMessage.textContent = "Ошибка отправки...";
    formMessage.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Отправить";
  }
});

// слайдер

const wrapper = document.querySelector(".slider-wrapper");
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsContainer = document.getElementById("sliderDots");

let currentIndex = 0;
const totalSlides = slides.length;
let startX = 0;
let endX = 0;

// Создание точек
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
}

const dots = document.querySelectorAll(".dot");

function updateSlider() {
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
  });
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % totalSlides;
  updateSlider();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  updateSlider();
}

function goToSlide(index) {
  currentIndex = index;
  updateSlider();
}

// События кнопок
nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

// Обработка касаний
wrapper.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

wrapper.addEventListener("touchmove", (e) => {
  endX = e.touches[0].clientX;
});

wrapper.addEventListener("touchend", () => {
  if (startX - endX > 50) {
    nextSlide(); // Свайп влево
  } else if (endX - startX > 50) {
    prevSlide(); // Свайп вправо
  }
});

// Обработка мыши
let isDragging = false;

wrapper.addEventListener("mousedown", (e) => {
  startX = e.clientX;
  isDragging = true;
});

wrapper.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  endX = e.clientX;
});

wrapper.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  if (startX - endX > 50) {
    nextSlide(); // Перетаскивание влево
  } else if (endX - startX > 50) {
    prevSlide(); // Перетаскивание вправо
  }
});

wrapper.addEventListener("mouseleave", () => {
  isDragging = false; // Сброс флага, если мышь покинула область
});
