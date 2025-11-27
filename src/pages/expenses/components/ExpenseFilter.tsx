export default function ExpenseFilter() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button className="btn btn-xs btn-outline whitespace-nowrap">All</button>
        <button className="btn btn-xs btn-outline whitespace-nowrap">Today</button>
        <button className="btn btn-xs btn-outline whitespace-nowrap">7 Days</button>
        <button className="btn btn-xs btn-primary whitespace-nowrap">This Month</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select className="select select-sm select-bordered w-full">
          <option selected>Category</option>
          <option>Food</option>
          <option>Transportation</option>
          <option>Housing</option>
        </select>

        <select className="select select-sm select-bordered w-full">
          <option selected>Type</option>
          <option>Expense</option>
          <option>Income</option>
        </select>
      </div>

      <button className="btn btn-sm btn-soft w-full">Advanced Filters</button>
    </div>
  );
}
