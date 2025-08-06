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
  {
    user: "Noah S",
    avatar: "https://i.pravatar.cc/40?img=30",
    bet: 40,
    multiplier: 3.2,
    cashout: 128,
  },
  {
    user: "Ava D",
    avatar: "https://i.pravatar.cc/40?img=12",
    bet: 60,
    multiplier: 6.7,
    cashout: 402,
  },
  {
    user: "Liam H",
    avatar: "https://i.pravatar.cc/40?img=7",
    bet: 45,
    multiplier: 9.4,
    cashout: 423,
  },
  {
    user: "Mia R",
    avatar: "https://i.pravatar.cc/40?img=3",
    bet: 20,
    multiplier: 3.5,
    cashout: 70,
  },
  {
    user: "William B",
    avatar: "https://i.pravatar.cc/40?img=18",
    bet: 75,
    multiplier: 1.9,
    cashout: 142.5,
  },
  {
    user: "Isabella G",
    avatar: "https://i.pravatar.cc/40?img=19",
    bet: 80,
    multiplier: 2.1,
    cashout: 168,
  },
  {
    user: "James N",
    avatar: "https://i.pravatar.cc/40?img=6",
    bet: 55,
    multiplier: 4.8,
    cashout: 264,
  },
  {
    user: "Sophia Z",
    avatar: "https://i.pravatar.cc/40?img=2",
    bet: 90,
    multiplier: 7.1,
    cashout: 639,
  },
  {
    user: "Elijah A",
    avatar: "https://i.pravatar.cc/40?img=28",
    bet: 100,
    multiplier: 12,
    cashout: 1200,
  },
  {
    user: "Amelia P",
    avatar: "https://i.pravatar.cc/40?img=26",
    bet: 65,
    multiplier: 1.6,
    cashout: 104,
  },
  {
    user: "Benjamin C",
    avatar: "https://i.pravatar.cc/40?img=13",
    bet: 120,
    multiplier: 2.2,
    cashout: 264,
  },
  {
    user: "Harper Y",
    avatar: "https://i.pravatar.cc/40?img=10",
    bet: 35,
    multiplier: 10.5,
    cashout: 367.5,
  },
  {
    user: "Lucas M",
    avatar: "https://i.pravatar.cc/40?img=8",
    bet: 85,
    multiplier: 3.3,
    cashout: 280.5,
  },
  {
    user: "Evelyn F",
    avatar: "https://i.pravatar.cc/40?img=23",
    bet: 70,
    multiplier: 6.9,
    cashout: 483,
  },
  {
    user: "Henry J",
    avatar: "https://i.pravatar.cc/40?img=17",
    bet: 95,
    multiplier: 4.4,
    cashout: 418,
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
