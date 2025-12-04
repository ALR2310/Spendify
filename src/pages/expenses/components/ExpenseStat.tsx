export default function ExpenseStat() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-base-content/60 text-xs">Total revenue</p>
          <p className="text-sm text-primary font-semibold">100.000đ</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">Total expenses</p>
          <p className="text-sm text-accent font-semibold">80.000đ</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">Difference</p>
          <p className="text-sm text-success font-semibold">20.000đ</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-semibold text-lg">Categories</p>

        <div className="grid grid-cols-3 items-center gap-y-2">
          <label className="text-sm">Food</label>
          <progress className="progress progress-primary col-span-2" value="80" max="100"></progress>

          <label className="text-sm">Transport</label>
          <progress className="progress progress-accent col-span-2" value="50" max="100"></progress>

          <label className="text-sm">Shopping</label>
          <progress className="progress progress-secondary col-span-2" value="60" max="100"></progress>
        </div>
      </div>
    </div>
  );
}
