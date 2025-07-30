// ✅ Sample bets data
const betsData = [
  {
    user: "Sarah M",
    avatar: "https://i.pravatar.cc/40?img=5",
    bet: 100,
    multiplier: 1.38,
    cashout: 138,
  },
  {
    user: "Luna W",
    avatar: "https://i.pravatar.cc/40?img=11",
    bet: 70,
    multiplier: 5.28,
    cashout: 369,
  },
  {
    user: "Oliver U",
    avatar: "https://i.pravatar.cc/40?img=15",
    bet: 50,
    multiplier: 110,
    cashout: 5500,
  },
  {
    user: "Jack T",
    avatar: "https://i.pravatar.cc/40?img=9",
    bet: 30,
    multiplier: 2.5,
    cashout: 75,
  },
  {
    user: "Emma K",
    avatar: "https://i.pravatar.cc/40?img=22",
    bet: 25,
    multiplier: 8,
    cashout: 200,
  },
];

// ✅ Get table body
const betsTableBody = document.getElementById("bets-table-body");

// ✅ Render Bets
function renderBets(filter = "ALL") {
  betsTableBody.innerHTML = "";

  let filteredBets = betsData;
  if (filter === "MY") {
    filteredBets = betsData.slice(0, 2); // Example: Only first 2 as "my bets"
  }
  if (filter === "TOP") {
    filteredBets = betsData.sort((a, b) => b.cashout - a.cashout).slice(0, 3);
  }

  filteredBets.forEach((bet) => {
    const row = document.createElement("tr");
    row.className = "border-b border-gray-700 hover:bg-gray-800";

    row.innerHTML = `
        <td class="flex items-center gap-2 px-3 py-2">
          <img src="${bet.avatar}" class="w-8 h-8 rounded-full" />
          <span class="font-semibold text-white">${bet.user}</span>
        </td>
        <td class="px-3 py-2 text-green-400">$${bet.bet.toFixed(2)}</td>
        <td class="px-3 py-2 font-bold text-purple-400">${bet.multiplier}x</td>
        <td class="px-3 py-2 text-yellow-400 font-bold">$${bet.cashout.toFixed(2)}</td>
      `;
    betsTableBody.appendChild(row);
  });
}

// ✅ Initial Render
renderBets();

// ✅ Tabs Functionality
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("tab-active"));
    btn.classList.add("tab-active");

    const tabName = btn.textContent.trim();
    if (tabName === "ALL BETS") renderBets("ALL");
    if (tabName === "MY BETS") renderBets("MY");
    if (tabName === "TOP") renderBets("TOP");
  });
});
