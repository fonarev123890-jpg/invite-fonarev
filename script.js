(function () {
  // Настройки
  const targetYear = 2026;
  const targetMonth = 7; // 0-based: 7 = август
  const targetDay = 29;
  // Время целевого момента (полночь начала дня, можно поменять на '23:59:59')
  const targetDate = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);

  // Заполнение названий дней (начинаем с ПН)
  const weekdaysElem = document.getElementById("weekdays");
  const weekdays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  weekdays.forEach((d) => {
    const el = document.createElement("div");
    el.textContent = d;
    weekdaysElem.appendChild(el);
  });

  // Построение календаря для августа 2026
  const grid = document.getElementById("grid");
  const year = 2026,
    month = 7; // август
  const first = new Date(year, month, 1);
  // JS getDay(): 0=Sun,1=Mon,... => мы хотим 0 = Monday index
  const jsDay = first.getDay(); // 0..6 (Sun..Sat)
  // compute number of empty cells before day 1, treating Monday as start
  const emptyBefore = jsDay === 0 ? 6 : jsDay - 1;
  // days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // render empty cells
  for (let i = 0; i < emptyBefore; i++) {
    const c = document.createElement("div");
    c.className = "cell empty";
    c.textContent = "0";
    grid.appendChild(c);
  }
  // render days
  for (let d = 1; d <= daysInMonth; d++) {
    const c = document.createElement("div");
    c.className = "cell";
    c.textContent = d;
    if (d === targetDay) {
      c.classList.add("selected");
    }
    grid.appendChild(c);
  }
  // fill trailing empty cells to complete 6x7 grid if desired (optional)
  const totalCells = grid.children.length;
  const needed = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < needed; i++) {
    const c = document.createElement("div");
    c.className = "cell empty";
    c.textContent = "0";
    grid.appendChild(c);
  }

  // Таймер
  const elDays = document.getElementById("days");
  const elHours = document.getElementById("hours");
  const elMinutes = document.getElementById("minutes");
  const elSeconds = document.getElementById("seconds");

  function pad(n) {
    return n.toString().padStart(2, "0");
  }

  function updateTimer() {
    const now = new Date();
    let diff = targetDate - now; // ms
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

// блокируем скролл
document.body.classList.add("lock");

openBtn.addEventListener("click", () => {
  // запускаем музыку
  music.play();
  video.play();
  site.style.display = "flex";

  // скрываем заставку
  intro.classList.add("hide");

  // возвращаем скролл
  document.body.classList.remove("lock");
});

const button = document.querySelector(".button-map");
const mapContainer = document.querySelector(".map-container");

button.addEventListener("click", () => {
  mapContainer.classList.toggle("open");
});

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

// ===== ОТПРАВКА АНКЕТЫ В TELEGRAM =====

const form = document.getElementById("anketaForm");
const nameInput = document.getElementById("nameInput");
const formMessage = document.getElementById("formMessage");
const submitButton = document.querySelector(".button__send");

const TOKEN = "8949638817:AAGZzC_fbV_545Sn7ZeZOE18UD-BNTrcQgU";
const CHAT_ID = "-5120123334";

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

  const text = `
📩 Новая анкета

👤 Имя: ${name}
✅ Присутствие: ${attendance}
`;

  try {
    // disabled состояние
    submitButton.disabled = true;
    submitButton.textContent = "Отправка...";

    const response = await fetch(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
        }),
      },
    );

    const data = await response.json();

    console.log(data);

    if (data.ok) {
      formMessage.textContent = "Анкета успешно отправлена";
      formMessage.classList.add("success");

      form.reset();

      document.querySelector('input[name="attendance"][value="yes"]').checked =
        true;
    } else {
      throw new Error(data.description || "Ошибка Telegram API");
    }
  } catch (error) {
    console.error(error);

    formMessage.textContent = "Анкета не отправлена, произошла ошибка...";
    formMessage.classList.add("error");
  } finally {
    // возвращаем кнопку
    submitButton.disabled = false;
    submitButton.textContent = "Отправить";
  }
});
