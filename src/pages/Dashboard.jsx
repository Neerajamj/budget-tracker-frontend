import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const API_BASE = "https://budget-tracker-backend-gd4s.onrender.com";


export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState("");

 const categories = useMemo(
  () => ["Food", "Shopping", "Bills", "Travel", "Salary", "Other"],
  []
);


  const token = localStorage.getItem("token");

  const fetchTransactions = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/transactions`, {
        params: { token },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Could not load transactions.");
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!amount) return;

    setError("");

    const payload = {
      id: Date.now(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split("T")[0],
      note,
    };

    try {
      await axios.post(`${API_BASE}/transactions`, payload, {
        params: { token },
      });
      setAmount("");
      setNote("");
      fetchTransactions();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Could not add transaction.");
      }
    }
  };

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  const categoryTotals = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c] = 0));
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions, categories]);

  const lineData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let running = 0;
    const labels = [];
    const values = [];

    sorted.forEach((t) => {
      if (t.type === "income") running += t.amount;
      else running -= t.amount;
      labels.push(t.date);
      values.push(running);
    });

    return { labels, values };
  }, [transactions]);

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const lineChartData = {
    labels: lineData.labels,
    datasets: [
      {
        label: "Balance over time",
        data: lineData.values,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const isDark = darkMode ? "dark" : "light";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={`app ${isDark}`}>
      <div className="app-shell">
        <header className="navbar">
          <div className="logo">
            <span className="logo-mark">₹</span>
            <span className="logo-text">TrackIt</span>
            <span className="logo-sub">Simple. Clear. In control.</span>
          </div>
          <div className="nav-actions">
            <button
              className="toggle-btn"
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          {error && <p className="top-error">{error}</p>}

          <section className="top">
            <SummaryCards
              balance={balance}
              income={totalIncome}
              expense={totalExpense}
            />
            <AddTransactionForm
              amount={amount}
              setAmount={setAmount}
              type={type}
              setType={setType}
              category={category}
              setCategory={setCategory}
              note={note}
              setNote={setNote}
              categories={categories}
              handleAdd={handleAdd}
            />
          </section>

          <section className="bottom">
            <ChartsSection pieData={pieData} lineChartData={lineChartData} />
            <TransactionsTable transactions={transactions} />
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryCards({ balance, income, expense }) {
  return (
    <div className="cards">
      <div className="card glass">
        <p className="card-label">Total Balance</p>
        <p className="card-value main">₹{balance.toFixed(2)}</p>
      </div>
      <div className="card glass">
        <p className="card-label">Income</p>
        <p className="card-value income">+₹{income.toFixed(2)}</p>
      </div>
      <div className="card glass">
        <p className="card-label">Expense</p>
        <p className="card-value expense">−₹{expense.toFixed(2)}</p>
      </div>
    </div>
  );
}

function AddTransactionForm({
  amount,
  setAmount,
  type,
  setType,
  category,
  setCategory,
  note,
  setNote,
  categories,
  handleAdd,
}) {
  return (
    <form className="card glass form" onSubmit={handleAdd}>
      <h2 className="form-title">Add Transaction</h2>
      <div className="form-row">
        <div className="field">
          <label>Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="field">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="eg. Coffee with friends"
          />
        </div>
      </div>

      <button className="primary-btn" type="submit">
        + Add
      </button>
    </form>
  );
}

function ChartsSection({ pieData, lineChartData }) {
  return (
    <div className="charts glass card">
      <h2 className="section-title">Overview</h2>
      <div className="charts-grid">
        <div className="chart-box">
          <h3>Expenses by Category</h3>
          <Pie data={pieData} />
        </div>
        <div className="chart-box">
          <h3>Balance Over Time</h3>
          <Line
            data={lineChartData}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { display: true },
                y: { display: true },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TransactionsTable({ transactions }) {
  return (
    <div className="card glass table-card">
      <h2 className="section-title">Recent Transactions</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Note</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No transactions yet. Add one to get started ✨
                </td>
              </tr>
            )}
            {transactions
              .slice()
              .reverse()
              .map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td
                    className={
                      t.type === "income" ? "tag-income" : "tag-expense"
                    }
                  >
                    {t.type}
                  </td>
                  <td>{t.category}</td>
                  <td>{t.note || "-"}</td>
                  <td
                    className={
                      t.type === "income"
                        ? "amount-income"
                        : "amount-expense"
                    }
                  >
                    {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
