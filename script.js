
const form = document.getElementById("foodForm");
const foodName = document.getElementById("foodName");
const expiryDate = document.getElementById("expiryDate");
const foodList = document.getElementById("foodList");
const message = document.getElementById("message");

let foods = [];

try {
  foods = JSON.parse(localStorage.getItem("foods")) || [];
} catch {
  foods = [];
}

function saveFoods() {
  localStorage.setItem("foods", JSON.stringify(foods));
}

function getStatus(expiry) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDay = new Date(expiry + "T00:00:00");
  const difference = Math.round(
    (expiryDay - today) / (1000 * 60 * 60 * 24)
  );

  if (difference < 0) {
    return { text: "Expired", className: "expired" };
  }

  if (difference <= 3) {
    return { text: "Expiring Soon", className: "soon" };
  }

  return { text: "Fresh", className: "fresh" };
}

function renderFoods() {
  foodList.innerHTML = "";

  if (foods.length === 0) {
    foodList.innerHTML = "<p>No food items yet. Add your first item!</p>";
    return;
  }

  foods.forEach((food) => {
    const status = getStatus(food.expiry);
    const item = document.createElement("div");

    item.className = "food-card";
    item.innerHTML = `
      <h3></h3>
      <p>Expiry date: ${food.expiry}</p>
      <p class="${status.className}">${status.text}</p>
      <button type="button" class="delete-btn">Delete</button>
    `;

    item.querySelector("h3").textContent = food.name;

    item.querySelector(".delete-btn").addEventListener("click", () => {
      foods = foods.filter((entry) => entry.id !== food.id);
      saveFoods();
      renderFoods();
    });

    foodList.appendChild(item);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = foodName.value.trim();
  const expiry = expiryDate.value;

  if (!name || !expiry) {
    message.textContent = "Please enter all details.";
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(expiry + "T00:00:00");

  if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
    message.textContent = "Choose today or a future expiry date.";
    return;
  }

  foods.push({
    id: Date.now() + Math.random(),
    name: name,
    expiry: expiry
  });

  saveFoods();
  renderFoods();
  form.reset();

  message.textContent = "Food item added successfully!";
});

const notificationButton = document.getElementById("notificationButton");

if (notificationButton) {
  notificationButton.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      message.textContent = "Notifications are not supported in this browser.";
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      new Notification("Food Expiry Tracker", {
        body: "Notifications enabled successfully!"
      });
      message.textContent = "Notifications enabled!";
    } else {
      message.textContent = "Please allow notifications in your browser.";
    }
  });
}

renderFoods();
