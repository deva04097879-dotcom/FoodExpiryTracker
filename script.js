
const form = document.getElementById("foodForm");
const foodName = document.getElementById("foodName");
const expiryDate = document.getElementById("expiryDate");
const foodList = document.getElementById("foodList");
const message = document.getElementById("message");

let foods = [];

try {
  foods = JSON.parse(localStorage.getItem("foodItems")) || [];
  if (!Array.isArray(foods)) foods = [];
} catch {
  foods = [];
}

function getStatus(dateText) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(dateText + "T00:00:00");
  const days = Math.round((expiry - today) / 86400000);

  if (days < 0) {
    return { text: "Expired", type: "danger", days };
  }

  if (days <= 3) {
    return {
      text: days === 0 ? "Expires today" : `Expires in ${days} day(s)`,
      type: "warning",
      days
    };
  }

  return { text: `${days} days left`, type: "", days };
}

function saveFoods() {
  localStorage.setItem("foodItems", JSON.stringify(foods));
}

function renderFoods() {
  foodList.innerHTML = "";

  let soonCount = 0;
  let expiredCount = 0;

  foods.forEach((food) => {
    const status = getStatus(food.expiry);

    if (status.days < 0) expiredCount++;
    else if (status.days <= 3) soonCount++;

    const card = document.createElement("div");
    card.className = "food-card";

    const name = document.createElement("strong");
    name.textContent = food.name;

    const date = document.createElement("p");
    date.textContent = "Expiry date: " + food.expiry;

    const badge = document.createElement("span");
    badge.className = "status " + status.type;
    badge.textContent = status.text;

    const remove = document.createElement("button");
    remove.className = "delete";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      foods = foods.filter(item => item.id !== food.id);
      saveFoods();
      renderFoods();
    });

    card.append(name, date, badge, remove);
    foodList.appendChild(card);
  });

  document.getElementById("total").textContent = foods.length;
  document.getElementById("soon").textContent = soonCount;
  document.getElementById("expired").textContent = expiredCount;

  if (foods.length === 0) {
    foodList.textContent = "No food items yet. Add your first item!";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = foodName.value.trim();
  const expiry = expiryDate.value;

  if (!name || !expiry) {
    message.textContent = "Please enter all details.";
    return;
  }

  if (expiry < new Date().toLocaleDateString("en-CA")) {
    message.textContent = "Choose today or a future expiry date.";
    return;
  }

  foods.push({
    id: Date.now() + Math.random(),
    name,
    expiry
  });

  saveFoods();
  renderFoods();
  form.reset();
  message.textContent = "Food item added successfully!";
});

document.getElementById("notifyButton")
  .addEventListener("click", async () => {
    if (!("Notification" in window)) {
      message.textContent =
        "Browser notifications are not supported here.";
      return;
    }

    if (!window.isSecureContext) {
      message.textContent =
        "Notifications need a secure HTTPS website.";
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        new Notification("Food Expiry Tracker", {
          body: "Notifications enabled while supported by your browser."
        });
        message.textContent = "Test notification sent!";
      } else {
        message.textContent = "Notification permission was not granted.";
      }
    } catch {
      message.textContent = "Could not enable notifications.";
    }
  });

renderFoods();
