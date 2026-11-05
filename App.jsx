import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  Wallet, TrendingUp, CreditCard, PlusCircle, 
  Filter, Trash2, Calendar, BarChart3, ArrowDownCircle, ArrowUpCircle 
} from 'lucide-react';

const INITIAL_EXPENSES = [
  { id: 1, name: 'Monthly Salary', amount: 85000, category: 'Salary', type: 'income', date: '2026-03-01' },
  { id: 2, name: 'SIP - Mutual Funds', amount: 15000, category: 'Investments', type: 'expense', date: '2026-03-02' },
  { id: 3, name: 'FD Deposit', amount: 10000, category: 'Savings', type: 'expense', date: '2026-03-02' },
  { id: 4, name: 'Groceries (D-Mart)', amount: 4500, category: 'Food', type: 'expense', date: '2026-03-03' },
  { id: 5, name: 'House Rent', amount: 18000, category: 'Housing', type: 'expense', date: '2026-03-04' },
];

const CATEGORY_COLORS = {
  Salary: '#10B981',
  Investments: '#06B6D4',
  Savings: '#8B5CF6',
  Food: '#F59E0B',
  Housing: '#3B82F6',
  Utilities: '#14B8A6',
  Entertainment: '#EC4899',
  Transport: '#F97316',
  Other: '#6B7280'
};

export default function App() {
  // Load initial data from localStorage if available
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('family_finance_transactions');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [type, setType] = useState('income');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('family_finance_transactions', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!name || !amount) return;
    const newExpense = {
      id: Date.now(),
      name,
      amount: parseFloat(amount),
      category,
      type,
      date: date || new Date().toISOString().split('T')[0]
    };
    setExpenses([newExpense, ...expenses]);
    setName('');
    setAmount('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all transactions?")) {
      setExpenses([]);
    }
  };

  const availableMonths = Array.from(
    new Set(expenses.map(e => e.date ? e.date.substring(0, 7) : ''))
  ).filter(Boolean).sort().reverse();

  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesMonth = selectedMonth === 'All' || (e.date && e.date.startsWith(selectedMonth));
    return matchesCategory && matchesMonth;
  });

  const totalIncome = filteredExpenses
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSpending = filteredExpenses
    .filter(e => e.type !== 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalSpending;

  const categoryTotals = filteredExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  }));

  const monthlyTotals = expenses.reduce((acc, curr) => {
    if (!curr.date) return acc;
    const monthKey = curr.date.substring(0, 7);
    if (!acc[monthKey]) acc[monthKey] = { month: monthKey, Income: 0, Expenses: 0 };
    if (curr.type === 'income') {
      acc[monthKey].Income += curr.amount;
    } else {
      acc[monthKey].Expenses += curr.amount;
    }
    return acc;
  }, {});

  const barData = Object.keys(monthlyTotals).sort().map(m => monthlyTotals[m]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <header className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Wallet className="text-emerald-400" /> Personal Finance Dashboard
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Track income, investments, savings, and monthly expenses</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center md:text-right">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Income</span>
              <p className="text-base sm:text-lg font-bold text-emerald-400">₹{totalIncome.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Expenses</span>
              <p className="text-base sm:text-lg font-bold text-rose-400">₹{totalSpending.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Net Saved</span>
              <p className={`text-base sm:text-lg font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{netBalance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </header>

        {/* Global Filter Bar */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-sm text-slate-300">
            <Filter className="w-4 h-4 text-emerald-400" /> Filters:
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Month Filter */}
            <div className="flex items-center gap-2 text-sm w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Month:
              </span>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Months</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 text-sm w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-slate-400 text-xs">Category:</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Categories</option>
                <option value="Salary">Salary (Income)</option>
                <option value="Investments">Investments</option>
                <option value="Savings">Savings</option>
                <option value="Food">Food</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Transport">Transport</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Form */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PlusCircle className="text-emerald-400" /> Add Entry
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Entry Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setType('income'); setCategory('Salary'); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 border ${
                      type === 'income' 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Income
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategory('Food'); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 border ${
                      type === 'expense' 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" /> Outflow / Save
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === 'income' ? 'e.g. March Salary' : 'e.g. PPF / Mutual Fund / Rent'} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                >
                  {type === 'income' ? (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Other">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Investments">Investments (SIP / Stocks)</option>
                      <option value="Savings">Savings (FD / PPF)</option>
                      <option value="Food">Food & Groceries</option>
                      <option value="Housing">Housing & Rent</option>
                      <option value="Utilities">Utilities & Bills</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Transport">Transport / Fuel</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg transition duration-200"
              >
                Add Entry
              </button>
            </form>
          </div>

          {/* Charts Area */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Monthly Trend Bar Chart */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="text-emerald-400" /> Income vs Outflow Trend
              </h2>
              <div className="h-48">
                {barData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="month" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                      <Legend />
                      <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="text-emerald-400" /> Distribution Breakdown ({selectedMonth === 'All' ? 'All Months' : selectedMonth})
              </h2>
              <div className="h-48 flex items-center justify-center">
                {filteredExpenses.length === 0 ? (
                  <p className="text-slate-500 text-sm">No transactions found for this selection</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Expense List */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="text-emerald-400" /> All Transactions
            </h2>
            {expenses.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:text-red-300 font-medium underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-500">No transactions recorded</td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-700/50 transition duration-150">
                      <td className="p-3 font-medium text-slate-200">{exp.name}</td>
                      <td className="p-3">
                        <span 
                          className="px-2.5 py-1 text-xs rounded-full font-medium"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[exp.category] || '#6B7280'}20`,
                            color: CATEGORY_COLORS[exp.category] || '#9CA3AF',
                            border: `1px solid ${CATEGORY_COLORS[exp.category] || '#4B5563'}`
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{exp.date}</td>
                      <td className={`p-3 text-right font-semibold ${exp.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-500 hover:text-red-400 transition p-1"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}